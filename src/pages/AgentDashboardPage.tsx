import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Home, Phone, User, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AgentBooking {
  booking_id: string;
  hostel_id: string;
  hostel_name: string;
  student_name: string | null;
  student_email: string | null;
  inspection_day: string | null;
  inspection_time: string | null;
  status: string;
  created_at: string;
}

interface CaretakerInfo {
  caretaker_name: string;
  caretaker_phone: string;
}

const DAY_LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export default function AgentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [caretakers, setCaretakers] = useState<Record<string, CaretakerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [isAgent, setIsAgent] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'agent' }).then(({ data }) => {
      setIsAgent(data === true);
    });
  }, [user]);

  useEffect(() => {
    if (!isAgent) return;
    (async () => {
      const { data, error } = await supabase.rpc('get_agent_bookings');
      if (error) {
        toast.error('Failed to load assigned bookings');
      } else if (data) {
        setBookings(data as AgentBooking[]);
      }
      setLoading(false);
    })();
  }, [isAgent]);

  const revealCaretaker = async (hostelId: string) => {
    if (caretakers[hostelId]) return;
    const { data, error } = await supabase.rpc('get_caretaker_for_agent', { hostel_uuid: hostelId });
    if (error || !data || data.length === 0) {
      toast.error('Could not fetch caretaker contact');
      return;
    }
    setCaretakers(prev => ({ ...prev, [hostelId]: data[0] as CaretakerInfo }));
  };

  if (authLoading || isAgent === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!isAgent) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-muted-foreground mb-8">Students assigned to you for hostel inspection.</p>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No bookings assigned to you yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map(b => (
              <Card key={b.booking_id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{b.hostel_name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{b.student_name || 'Student'} · {b.student_email}</div>
                        {b.inspection_day && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />{DAY_LABEL[b.inspection_day] || b.inspection_day}
                            <Clock className="h-3.5 w-3.5 ml-2" />{b.inspection_time}
                          </div>
                        )}
                      </div>
                      {caretakers[b.hostel_id] && (
                        <div className="mt-3 p-3 bg-secondary/40 rounded-lg text-sm">
                          <p className="font-medium">Caretaker: {caretakers[b.hostel_id].caretaker_name}</p>
                          <a href={`tel:${caretakers[b.hostel_id].caretaker_phone}`} className="text-primary hover:underline flex items-center gap-1 mt-1">
                            <Phone className="h-3.5 w-3.5" />{caretakers[b.hostel_id].caretaker_phone}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success text-center">{b.status}</span>
                      {!caretakers[b.hostel_id] && (
                        <Button size="sm" variant="outline" onClick={() => revealCaretaker(b.hostel_id)}>
                          Reveal caretaker
                        </Button>
                      )}
                      <Link to={`/hostels/${b.hostel_id}`}>
                        <Button size="sm" variant="ghost">View hostel</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
