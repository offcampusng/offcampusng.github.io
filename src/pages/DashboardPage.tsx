import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Crown, Search, Home, CreditCard,
  ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, profile, isPremium, bookings, payments } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const subscriptionStatus = () => {
    if (isPremium) {
      return { label: 'Premium', color: 'text-primary', bg: 'bg-primary/10' };
    }
    return { label: 'Free', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const status = subscriptionStatus();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your bookings and subscription from here.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Subscription Status</h2>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-full text-sm font-medium", status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <Crown className={cn("h-8 w-8", isPremium ? "text-primary" : "text-muted")} />
                </div>

                {!isPremium && (
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">You're on the Free plan</p>
                        <p className="text-sm text-muted-foreground">
                          Pay ₦2,000 per booking, or upgrade to Premium for 5 free bookings + ₦1,000 each afterwards.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Booking fee</p>
                    <p className="font-semibold">{isPremium ? '₦0 – ₦1,000' : '₦2,000'}</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Plan</p>
                    <p className="font-semibold">{isPremium ? 'Premium' : 'Free'}</p>
                  </div>
                </div>

                {isPremium ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Premium Active
                  </Button>
                ) : (
                  <Link to="/pricing">
                    <Button variant="hero" className="w-full">
                      Upgrade to Premium
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </motion.div>

              {/* Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Your Bookings</h2>
                
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <Link
                        key={booking.id}
                        to={`/hostels/${booking.hostel_id}`}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium hover:text-primary transition-colors">{booking.hostel_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.created_at)} · Tap to view agent & pay rent
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(booking.amount)}</p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            booking.status === 'confirmed' ? "bg-success/10 text-success" :
                            booking.status === 'pending' ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {booking.status}
                          </span>
                        </div>
                      </Link>
                    ))}

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Link to="/hostels">
                      <Button variant="outline" size="sm">
                        Browse Hostels
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Payment History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Payment History</h2>
                
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{payment.payment_type} Payment</p>
                            <p className="text-sm text-muted-foreground">
                              Ref: {payment.reference}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No payments yet</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card border rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/hostels" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Hostels
                    </Button>
                  </Link>
                  <Link to="/pricing" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Crown className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card border rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4">Account Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{profile?.name || 'Student'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{profile?.email || user?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">University</p>
                    <p className="font-medium">{profile?.university || 'University of Benin'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Member since</p>
                    <p className="font-medium">
                      {profile?.created_at ? formatDate(profile.created_at) : '-'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
