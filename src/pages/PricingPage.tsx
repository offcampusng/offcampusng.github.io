import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Browse hostels and pay per booking',
    features: [
      { text: 'Browse all hostel listings', included: true },
      { text: 'View full hostel details', included: true },
      { text: 'Search & filter hostels', included: true },
      { text: '₦2,000 per booking to unlock caretaker contact', included: true },
      { text: 'Discounted booking fees', included: false },
      { text: 'Free bookings included', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₦5,000',
    period: 'per month',
    description: 'Save more if you book often',
    features: [
      { text: 'Browse all hostel listings', included: true },
      { text: 'View full hostel details', included: true },
      { text: 'Search & filter hostels', included: true },
      { text: 'First 5 bookings completely free', included: true },
      { text: 'Just ₦1,000 per booking afterwards', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Upgrade to Premium',
    popular: true,
  },
];

export default function PricingPage() {
  const { user, isPremium } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Simple, transparent pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose your plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Pay only when you book, or go Premium to save on every booking.
              No agent fees, no hidden charges.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative bg-card rounded-2xl border p-6 md:p-8",
                  plan.popular && "border-primary shadow-glow"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={cn(
                        "text-sm",
                        !feature.included && "text-muted-foreground"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.popular ? (
                  isPremium ? (
                    <Button variant="outline" size="lg" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Link to="/payment?type=subscription">
                      <Button variant="hero" size="lg" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  )
                ) : (
                  <Button variant="outline" size="lg" className="w-full" disabled>
                    {isPremium ? 'Downgrade' : 'Current Plan'}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* FAQ Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              Have questions?{' '}
              <Link to="/#faq" className="text-primary font-medium hover:underline">
                Check our FAQs
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
