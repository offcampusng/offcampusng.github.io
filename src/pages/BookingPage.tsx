import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MapPin, CheckCircle2, AlertCircle, Loader2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Hostel {
  id: string;
  name: string;
  location: string;
  address: string;
  price: number;
  hostel_type: string;
  inspection_days: string[] | null;
  inspection_time_from: string | null;
  inspection_time_to: string | null;
}

const DAY_LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

function generateTimeSlots(from: string, to: string): string[] {
  const [fh] = from.split(':').map(Number);
  const [th] = to.split(':').map(Number);
  const slots: string[] = [];
  for (let h = fh; h <= th; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPremium, isLoading: authLoading, addPayment } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [inspectionDay, setInspectionDay] = useState<string>('');
  const [inspectionTime, setInspectionTime] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [{ data: hostelData }, { count }] = await Promise.all([
        supabase
          .from('hostels_public')
          .select('id, name, location, address, price, hostel_type, inspection_days, inspection_time_from, inspection_time_to')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user?.id ?? '')
          .eq('status', 'confirmed'),
      ]);

      if (hostelData) setHostel(hostelData as Hostel);
      setConfirmedBookings(count ?? 0);
      setIsLoading(false);
    };

    fetchData();
  }, [id, user?.id]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (!hostel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Hostel not found</h1>
            <Link to="/hostels">
              <Button variant="hero">Browse hostels</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);

  const bookingFee = isPremium ? (confirmedBookings < 5 ? 0 : 1000) : 2000;
  const feeLabel = isPremium
    ? confirmedBookings < 5
      ? `Free (${5 - confirmedBookings} free booking${5 - confirmedBookings === 1 ? '' : 's'} left on Premium)`
      : 'Premium rate'
    : 'Free plan rate';

  const availableDays = hostel.inspection_days ?? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const timeSlots = generateTimeSlots(hostel.inspection_time_from || '09:00', hostel.inspection_time_to || '17:00');
  const canProceed = !!inspectionDay && !!inspectionTime;

  const confirmFreeBooking = async () => {
    if (!hostel || !canProceed) return;
    setIsConfirming(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        hostel_id: hostel.id,
        hostel_name: hostel.name,
        amount: 0,
        status: 'confirmed',
        inspection_day: inspectionDay,
        inspection_time: inspectionTime,
      });
      if (error) throw error;
      await addPayment({ amount: 0, type: 'booking', description: `Booking (free): ${hostel.name}` });
      toast.success('Booking confirmed! Your agent details are ready on the dashboard.');
      navigate('/dashboard');
    } catch (e) {
      toast.error('Could not confirm booking. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to={`/hostels/${id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to hostel
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Confirm Booking</h1>
            <p className="text-muted-foreground mb-8">
              Pick a day and time for inspection, then confirm.
            </p>

            {/* Hostel Summary */}
            <div className="bg-card border rounded-xl p-6 mb-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Home className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">{hostel.name}</h2>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{hostel.location}, {hostel.address}</span>
                  </div>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">
                    {hostel.hostel_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Inspection Day */}
            <div className="bg-card border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pick an inspection day</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableDays.map(d => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setInspectionDay(d)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                      inspectionDay === d
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-secondary/50'
                    )}
                  >
                    {DAY_LABEL[d] || d}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspection Time */}
            <div className="bg-card border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pick a time slot</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Available between {hostel.inspection_time_from || '09:00'} and {hostel.inspection_time_to || '17:00'}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {timeSlots.map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setInspectionTime(t)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                      inspectionTime === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-secondary/50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-card border rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Price Breakdown</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hostel rent (starting)</span>
                  <span className="font-medium">{formatPrice(hostel.price)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Platform booking fee</span>
                    <span className="text-xs text-muted-foreground/80">{feeLabel}</span>
                  </div>
                  <span className="font-medium">{bookingFee === 0 ? 'Free' : formatPrice(bookingFee)}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total due now</span>
                  <span className="text-xl font-bold text-primary">{bookingFee === 0 ? 'Free' : formatPrice(bookingFee)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  * Rent (plus 20% service fee) is paid through the platform after your inspection.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-secondary/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">An OffCampus agent is assigned and their contact is revealed to you.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">The agent meets you at the hostel for inspection on the day and time you chose.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">If you like the hostel, pay the rent on the platform to secure it.</span>
                </li>
              </ul>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Please note</p>
                  <p className="text-sm text-muted-foreground">
                    All payments happen on OffCampus. Never pay a caretaker or agent directly for rent — this protects you if anything goes wrong.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {bookingFee === 0 ? (
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={isConfirming || !canProceed}
                  onClick={confirmFreeBooking}
                >
                  {isConfirming ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Confirming...</>
                  ) : (
                    'Confirm Booking — Free'
                  )}
                </Button>
              ) : (
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  disabled={!canProceed}
                  onClick={() => {
                    if (!canProceed) return;
                    navigate(
                      `/payment?type=booking&hostelId=${hostel.id}&amount=${bookingFee}&day=${inspectionDay}&time=${inspectionTime}`
                    );
                  }}
                >
                  Proceed to Payment — {formatPrice(bookingFee)}
                </Button>
              )}
              <Link to={`/hostels/${id}`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Cancel</Button>
              </Link>
            </div>
            {!canProceed && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Select a day and time to continue
              </p>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
