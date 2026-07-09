-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'trial', 'premium');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create enum for payment type
CREATE TYPE public.payment_type AS ENUM ('subscription', 'booking');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  university TEXT DEFAULT 'University of Benin',
  subscription subscription_plan DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hostels table
CREATE TABLE public.hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  hostel_type TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  caretaker_name TEXT NOT NULL,
  caretaker_phone TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  available_rooms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  hostel_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_type payment_type NOT NULL,
  description TEXT NOT NULL,
  status payment_status DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Hostels policies (public read, no public write)
CREATE POLICY "Anyone can view hostels"
ON public.hostels FOR SELECT
TO authenticated
USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, subscription, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Student'),
    'trial',
    NOW() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostels_updated_at
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hostel data
INSERT INTO public.hostels (name, location, address, description, price, hostel_type, images, facilities, rules, caretaker_name, caretaker_phone, is_verified, available_rooms) VALUES
('Grace Lodge', 'Ekosodin', '12 Ekosodin Road, Ekosodin', 'A comfortable and affordable hostel located in the heart of Ekosodin. Perfect for students who want easy access to campus while enjoying a peaceful environment.', 150000, 'Self-contained', ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['24/7 Water Supply', 'Electricity (Prepaid)', 'Security', 'Parking Space'], ARRAY['No loud music after 10pm', 'No pets allowed', 'Visitors must leave by 8pm'], 'Mrs. Grace Okonkwo', '+234 801 234 5678', true, 5),
('Kings Court', 'Bdpa', '45 BDPA Junction, Ugbowo', 'Modern self-contained apartments with excellent facilities. Located close to the main gate for easy campus access.', 200000, 'Self-contained', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], ARRAY['24/7 Water Supply', 'Electricity (Prepaid)', 'Security', 'WiFi Available', 'Generator Backup'], ARRAY['No smoking', 'No loud parties', 'Rent due by 5th of each month'], 'Mr. Kingsley Eze', '+234 802 345 6789', true, 3),
('Favour Hostel', 'Osasogie', '78 Osasogie Street, Osasogie', 'Budget-friendly room and parlour apartments perfect for students on a tight budget. Clean and well-maintained.', 80000, 'Room and Parlour', ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'], ARRAY['Water Supply', 'Electricity (Shared Meter)', 'Security'], ARRAY['No cooking in rooms', 'Keep environment clean', 'No overnight visitors'], 'Mr. Favour Igbinoba', '+234 803 456 7890', true, 8),
('Divine Apartments', 'Uselu', '23 Uselu Lagos Road, Uselu', 'Spacious self-contained apartments with modern amenities. Ideal for final year students who need a quiet study environment.', 180000, 'Self-contained', ARRAY['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'], ARRAY['24/7 Water Supply', 'Electricity (Prepaid)', 'Security', 'Reading Room', 'Parking Space'], ARRAY['Quiet hours 10pm-6am', 'No pets', 'Monthly inspection'], 'Mrs. Divine Obasuyi', '+234 804 567 8901', true, 4),
('Success Lodge', 'Ekosodin', '56 Success Avenue, Ekosodin', 'Popular student hostel known for its friendly community and reliable facilities. Great location near markets and eateries.', 120000, 'Room and Parlour', ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'], ARRAY['Water Supply', 'Electricity (Prepaid)', 'Security', 'Common Area'], ARRAY['No loud music', 'Visitors leave by 9pm', 'Keep surroundings clean'], 'Mr. Success Ehigiator', '+234 805 678 9012', true, 6),
('Blessed Hostel', 'Bdpa', '89 BDPA Road, Ugbowo', 'Affordable single rooms perfect for students who prefer privacy. Close to campus and public transportation.', 100000, 'Single Room', ARRAY['https://images.unsplash.com/photo-1598928506311-c55ez61a1a5b?w=800', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'], ARRAY['Water Supply', 'Electricity (Shared)', 'Security'], ARRAY['No cooking in room', 'No overnight guests', 'Maintain cleanliness'], 'Mrs. Blessing Omoruyi', '+234 806 789 0123', false, 10),
('Royal Heights', 'Uselu', '34 Royal Street, Uselu', 'Premium self-contained apartments with top-notch facilities. For students who want the best accommodation experience.', 250000, 'Self-contained', ARRAY['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], ARRAY['24/7 Water Supply', 'Electricity (Prepaid)', 'Security', 'WiFi', 'Generator', 'Gym Access', 'Parking'], ARRAY['No parties', 'Professional conduct', 'Rent due monthly'], 'Mr. Royal Ogbeide', '+234 807 890 1234', true, 2),
('Peace Villa', 'Osasogie', '67 Peace Close, Osasogie', 'Quiet and peaceful environment ideal for serious students. Well-maintained facilities and responsive management.', 90000, 'Room and Parlour', ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'], ARRAY['Water Supply', 'Electricity (Prepaid)', 'Security', 'Study Area'], ARRAY['Quiet environment', 'No loud gatherings', 'Respect neighbors'], 'Mrs. Peace Aighobahi', '+234 808 901 2345', true, 7);
