import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  MapPin, BadgeCheck, Home, ArrowLeft, Phone, 
  CheckCircle2, Lock, Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Hostel {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  price: number;
  hostel_type: string;
  images: string[];
  facilities: string[];
  rules: string[];
  caretaker_name: string;
  is_verified: boolean;
  available_rooms: number;
  inspection_days?: string[] | null;
  inspection_time_from?: string | null;
  inspection_time_to?: string | null;
}

interface AgentContact {
  agent_name: string;
  agent_phone: string;
  agent_email: string | null;
  agent_photo: string | null;
}

const DAY_LABEL: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export default function HostelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, bookings, payments } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [agentContact, setAgentContact] = useState<AgentContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasBooked = bookings.some(b => b.hostel_id === id && b.status === 'confirmed');
  const hasPaidRent = payments.some(p => p.payment_type === 'hostel' && p.description?.includes(id ?? '__none__'));


  useEffect(() => {
    const fetchHostel = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('hostels_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data && !error) {
        setHostel(data as Hostel);
        supabase
          .from('hostel_views')
          .insert({ hostel_id: id, viewer_id: user?.id ?? null })
          .then(() => {});
      }
      setIsLoading(false);
    };

    fetchHostel();
  }, [id, user?.id]);

  // Fetch assigned agent if user has confirmed booking
  useEffect(() => {
    const fetchAgent = async () => {
      if (!id || !hasBooked) return;
      const { data, error } = await supabase.rpc('get_assigned_agent', { hostel_uuid: id });
      if (data && data.length > 0 && !error) {
        setAgentContact(data[0] as AgentContact);
      }
    };
    fetchAgent();
  }, [id, hasBooked]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Hostel not found</h1>
            <p className="text-muted-foreground mb-4">This hostel may have been removed or doesn't exist.</p>
            <Link to="/hostels">
              <Button variant="hero">Browse hostels</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }







  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/hostels" className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>
        </div>

        {/* Hostel Details */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Image Gallery */}
                <div className="aspect-[16/9] bg-muted rounded-xl overflow-hidden mb-6 relative">
                  {hostel.images && hostel.images.length > 0 ? (
                    <img 
                      src={hostel.images[0]} 
                      alt={hostel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Home className="h-16 w-16 opacity-30" />
                    </div>
                  )}
                  {hostel.is_verified && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                      <BadgeCheck className="h-4 w-4" />
                      Verified Hostel
                    </div>
                  )}
                </div>

                {/* Title & Location */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">
                      {hostel.hostel_type}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {hostel.available_rooms} rooms available
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{hostel.name}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{hostel.location}, {hostel.address}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">About this hostel</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {hostel.description}
                  </p>
                </div>

                {/* Facilities */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Facilities & Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hostel.facilities.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                {hostel.rules && hostel.rules.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">House Rules</h2>
                    <ul className="space-y-2">
                      {hostel.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Inspection availability */}
                {hostel.inspection_days && hostel.inspection_days.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Inspection Availability</h2>
                    <div className="bg-secondary/40 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hostel.inspection_days.map(d => (
                          <span key={d} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {DAY_LABEL[d] || d}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Between <span className="font-medium text-foreground">{hostel.inspection_time_from || '09:00'}</span> and{' '}
                        <span className="font-medium text-foreground">{hostel.inspection_time_to || '17:00'}</span>
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sticky top-24"
              >
                <div className="bg-card border rounded-xl p-6 shadow-soft">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(hostel.price)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">per year</span>
                  </div>

                  {/* Book Button or Agent Info */}
                  {hasBooked && agentContact ? (
                    <>
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span className="font-medium text-success">Booking Confirmed</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Your OffCampus agent will guide you for the hostel inspection.
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Your Agent</p>
                            <p className="font-medium">{agentContact.agent_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <a href={`tel:${agentContact.agent_phone}`} className="font-medium text-primary hover:underline">
                              {agentContact.agent_phone}
                            </a>
                          </div>
                          {agentContact.agent_email && (
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <a href={`mailto:${agentContact.agent_email}`} className="font-medium text-primary hover:underline text-sm break-all">
                                {agentContact.agent_email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {hasPaidRent ? (
                        <Button variant="outline" size="lg" className="w-full mb-2" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Hostel Paid
                        </Button>
                      ) : (
                        <>
                          <Link to={`/payment?type=hostel&hostelId=${hostel.id}`}>
                            <Button variant="hero" size="lg" className="w-full mb-2">
                              Pay for hostel
                            </Button>
                          </Link>
                          <p className="text-xs text-muted-foreground text-center">
                            Pay rent + 20% service fee after a successful inspection
                          </p>
                        </>
                      )}
                    </>
                  ) : hasBooked ? (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-success" />
                        <span className="font-medium text-success">Loading agent details...</span>
                      </div>
                    </div>
                  ) : (

                    <>
                      <Link to={`/book/${hostel.id}`}>
                        <Button variant="hero" size="lg" className="w-full mb-4">
                          Book this hostel
                        </Button>
                      </Link>

                      <p className="text-xs text-muted-foreground text-center mb-6">
                        Your OffCampus agent's details will be revealed after booking
                      </p>

                      {/* Agent Preview */}
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">OffCampus Agent</p>
                            <p className="text-xs text-muted-foreground">Assigned after booking</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Lock className="h-4 w-4" />
                          <span>An agent will guide your inspection</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Trust Badge */}
                <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Verified by OffCampus</p>
                      <p className="text-xs text-muted-foreground">
                        This hostel has been physically inspected and verified by our team.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
