import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HostelCard } from '@/components/HostelCard';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';


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
  is_verified: boolean;
  available_rooms: number;
}

const locations = ['All Locations', 'Ekosodin', 'Bdpa', 'Osasogie', 'Uselu'];
const hostelTypes = ['All Types', 'Self-contained', 'Room and Parlour', 'Single Room'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₦100k', min: 0, max: 100000 },
  { label: '₦100k - ₦150k', min: 100000, max: 150000 },
  { label: '₦150k - ₦200k', min: 150000, max: 200000 },
  { label: 'Above ₦200k', min: 200000, max: Infinity },
];

export default function HostelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');

  useEffect(() => {
    const fetchHostels = async () => {
      const { data, error } = await supabase
        .from('hostels_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setHostels(data as Hostel[]);
      }
      setIsLoading(false);
    };

    fetchHostels();
  }, []);

  const filteredHostels = useMemo(() => {
    return hostels.filter((hostel) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Location filter
      const matchesLocation = selectedLocation === 'All Locations' || 
        hostel.location === selectedLocation;

      // Type filter
      const matchesType = selectedType === 'All Types' || 
        hostel.hostel_type === selectedType;

      // Price filter
      const priceRange = priceRanges.find(p => p.label === selectedPriceRange);
      const matchesPrice = !priceRange || 
        (hostel.price >= priceRange.min && hostel.price <= priceRange.max);

      return matchesSearch && matchesLocation && matchesType && matchesPrice;
    });
  }, [hostels, searchQuery, selectedLocation, selectedType, selectedPriceRange]);

  const handleHostelClick = (hostelId: string) => {
    navigate(`/hostels/${hostelId}`);
  };

  const PUBLIC_LIMIT = 10;
  const visibleHostels = user ? filteredHostels : filteredHostels.slice(0, PUBLIC_LIMIT);
  const hasMoreLocked = !user && filteredHostels.length > PUBLIC_LIMIT;

  // Transform hostel data to match HostelCard props
  const transformHostel = (hostel: Hostel) => ({
    id: hostel.id,
    name: hostel.name,
    location: hostel.location,
    area: hostel.address,
    priceMin: hostel.price,
    priceMax: hostel.price,
    type: hostel.hostel_type.toLowerCase().replace(/ /g, '-') as 'self-contained' | 'single-room' | 'shared',
    isVerified: hostel.is_verified,
    availableRooms: hostel.available_rooms,
    description: hostel.description,
    facilities: hostel.facilities,
    images: hostel.images,
    caretaker: { name: '', phone: '' },
  });

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/30 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Browse Verified Hostels
              </h1>
              <p className="text-muted-foreground">
                {filteredHostels.length} verified hostels around UNIBEN
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-40 bg-background border-b py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hostels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter selects */}
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Listings */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {filteredHostels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleHostels.map((hostel, index) => (
                    <motion.div
                      key={hostel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <HostelCard
                        hostel={transformHostel(hostel)}
                        onClick={() => handleHostelClick(hostel.id)}
                      />
                    </motion.div>
                  ))}
                </div>
                {hasMoreLocked && (
                  <div className="mt-10 max-w-xl mx-auto text-center bg-card border rounded-2xl p-8 shadow-soft">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {filteredHostels.length - PUBLIC_LIMIT} more hostels available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create a free account to browse all listings and unlock booking.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="hero" size="lg" onClick={() => navigate('/signup')}>
                        Sign up free
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                        Log in to see more
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hostels found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
