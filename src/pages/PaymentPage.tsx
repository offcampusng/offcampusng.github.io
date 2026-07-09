import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CreditCard, CheckCircle2, Loader2, Home } from 'lucide-react';
import { toast } from 'sonner';

interface HostelInfo {
  id: string;
  name: string;
  price: number;
}


export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, upgradeToPremium, addBooking, addPayment, isLoading: authLoading } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hostel, setHostel] = useState<HostelInfo | null>(null);
  const [hostelLoading, setHostelLoading] = useState(false);

  const type = searchParams.get('type') || 'subscription';
  const hostelId = searchParams.get('hostelId');
  const amountParam = searchParams.get('amount');

  // Fetch hostel from database if booking or hostel rent
  useEffect(() => {
    if (!hostelId) return;
    setHostelLoading(true);
    supabase
      .from('hostels_public')
      .select('id, name, price')
      .eq('id', hostelId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setHostel(data as HostelInfo);
        setHostelLoading(false);
      });
  }, [hostelId]);

  if (authLoading || (hostelId && hostelLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Pricing per payment type
  let amount = 0;
  let commission = 0;
  let rentAmount = 0;
  if (type === 'subscription') {
    amount = 5000;
  } else if (type === 'hostel') {
    rentAmount = hostel?.price ?? 0;
    commission = Math.round(rentAmount * 0.20);
    amount = rentAmount + commission;
  } else {
    amount = amountParam ? parseInt(amountParam, 10) : 2000;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const paymentType: 'subscription' | 'booking' | 'hostel' =
        type === 'subscription' ? 'subscription' : type === 'hostel' ? 'hostel' : 'booking';

      const description =
        type === 'subscription'
          ? 'Premium Subscription'
          : type === 'hostel'
            ? `Hostel rent: ${hostel?.name || 'Hostel'} [hid:${hostel?.id}]`
            : `Booking: ${hostel?.name || 'Hostel'}`;

      await addPayment({ amount, type: paymentType, description });

      if (type === 'subscription') {
        await upgradeToPremium();
        toast.success('Payment successful! You now have Premium access.');
      } else if (type === 'hostel' && hostel) {
        toast.success('Rent paid! The caretaker has been notified.');
      } else if (hostel) {
        await addBooking({
          hostelId: hostel.id,
          hostelName: hostel.name,
          amount,
          inspectionDay: searchParams.get('day') ?? undefined,
          inspectionTime: searchParams.get('time') ?? undefined,
        });
        toast.success('Booking confirmed! Your agent details are ready on the dashboard.');
      }

      setIsComplete(true);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }

    setIsProcessing(false);
  };


  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              {type === 'subscription'
                ? 'Your Premium subscription is now active. Enjoy full access to all features!'
                : type === 'hostel'
                  ? 'Rent payment received. The caretaker will hand over the hostel — welcome to your new place!'
                  : 'Your booking is confirmed. Check your dashboard for the caretaker\'s contact details.'
              }
            </p>

            <div className="space-y-3">
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/hostels">
                <Button variant="outline" size="lg" className="w-full">
                  Browse More Hostels
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Back Navigation */}
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Secure Payment</h1>
              <p className="text-muted-foreground text-sm">
                Your payment information is encrypted and secure
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-card border rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              {type === 'hostel' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hostel rent — {hostel?.name || 'Hostel'}</span>
                    <span className="font-medium">{formatPrice(rentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (20%)</span>
                    <span className="font-medium">{formatPrice(commission)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">{formatPrice(amount)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {type === 'subscription' ? 'Premium Subscription' : `Booking: ${hostel?.name || 'Hostel'}`}
                    </span>
                    <span className="text-xl font-bold">{formatPrice(amount)}</span>
                  </div>
                  {type === 'subscription' && (
                    <p className="text-xs text-muted-foreground mt-2">Valid for 30 days</p>
                  )}
                </>
              )}
            </div>


            {/* Payment Form */}
            <form onSubmit={handlePayment} className="bg-card border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Card Details</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Name on Card</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full mt-6"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(amount)}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                This is a demo payment. No actual charges will be made.
              </p>
            </form>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-6 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                SSL Encrypted
              </div>
              <span>•</span>
              <span>Secure Payment</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
