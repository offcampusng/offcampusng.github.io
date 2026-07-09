import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BadgeCheck, Shield, CreditCard, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Hostels',
    description: 'Every listing is physically verified. No fake photos, no surprises.'
  },
  {
    icon: Shield,
    title: 'No Agents',
    description: 'Deal directly with caretakers. No agent fees or middlemen.'
  },
  {
    icon: CreditCard,
    title: 'Transparent Pricing',
    description: 'See the full cost upfront. No hidden charges.'
  },
  {
    icon: Search,
    title: 'Easy Search',
    description: 'Filter by location, price, and type to find your perfect hostel.'
  }
];

const faqs = [
  {
    question: 'Is OffCampus legit?',
    answer: 'Yes! We physically verify every hostel listing before it appears on our platform. Our team visits each location to confirm the photos, amenities, and pricing are accurate.'
  },
  {
    question: 'Why should I pay when I can find hostels myself?',
    answer: 'While you can search on your own, you\'ll likely spend days visiting different locations, dealing with agents, and encountering fake listings. OffCampus saves you time, transport money, and frustration by showing only verified options with transparent pricing.'
  },
  {
    question: 'How is this better than using agents?',
    answer: 'Agents charge 10% or more of your annual rent, which could be ₦15,000-₦35,000. With OffCampus, you pay a small subscription fee and connect directly with caretakers. Plus, you avoid the stress of being taken to see unsuitable hostels.'
  },
  {
    question: 'What happens after I book?',
    answer: 'After booking, you\'ll receive the caretaker\'s contact details. You can arrange an inspection time directly with them. If the hostel doesn\'t match our listing, let us know and we\'ll help resolve it.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'If you\'re not satisfied within 7 days of subscribing and haven\'t made any bookings, you can request a full refund. For booking-related issues, contact our support team.'
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Verified Off-Campus Hostels — <span className="text-primary">No Agents</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop wasting time and money on fake listings and agent fees. 
              Browse verified hostels around UNIBEN with transparent pricing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Sign up free
                </Button>
              </Link>
              <Link to="/hostels">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Browse hostels
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why students choose OffCampus
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We understand the struggle. That's why we built a platform that actually helps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to find your perfect hostel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Browse', description: 'Explore verified hostels filtered by location, price, and type.' },
              { step: '2', title: 'Choose', description: 'View detailed info, photos, and facilities. Pick your favorite.' },
              { step: '3', title: 'Book', description: 'Pay securely and get caretaker contact to arrange inspection.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full gradient-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border rounded-xl overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFaq === index ? "max-h-96" : "max-h-0"
                  )}
                >
                  <p className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to find your hostel?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join hundreds of UNIBEN students who found their perfect accommodation without stress.
            </p>
            <Link to="/signup">
              <Button
                size="xl"
                className="bg-card text-foreground hover:bg-card/90 font-semibold"
              >
                Start your free trial
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
