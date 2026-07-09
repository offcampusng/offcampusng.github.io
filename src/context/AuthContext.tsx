import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  name: string;
  university: string;
  subscription: 'free' | 'trial' | 'premium';
  trial_ends_at: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  hostel_id: string;
  hostel_name: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: 'subscription' | 'booking' | 'hostel';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string | null;
  created_at: string;
}


interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, asLandlord?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  isPremium: boolean;
  isLandlord: boolean;
  bookings: Booking[];
  payments: Payment[];
  addBooking: (booking: { hostelId: string; hostelName: string; amount: number; inspectionDay?: string; inspectionTime?: string }) => Promise<void>;
  addPayment: (payment: { amount: number; type: 'subscription' | 'booking' | 'hostel'; description: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLandlord, setIsLandlordState] = useState(false);

  const fetchIsLandlord = async (userId: string) => {
    const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'landlord' });
    setIsLandlordState(data === true);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      setProfile(data as Profile);
    }
  };

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setBookings(data as Booking[]);
    }
  };

  const fetchPayments = async (userId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPayments(data as Payment[]);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchBookings(session.user.id);
            fetchPayments(session.user.id);
            fetchIsLandlord(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setBookings([]);
          setPayments([]);
          setIsLandlordState(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
        fetchBookings(session.user.id);
        fetchPayments(session.user.id);
        fetchIsLandlord(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    asLandlord: boolean = false,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please log in instead.' };
      }
      return { success: false, error: error.message };
    }

    // If signing up as landlord, self-assign the landlord role
    if (asLandlord && data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'landlord' });
      if (roleError) console.error('Failed to assign landlord role:', roleError);
      setIsLandlordState(true);
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setBookings([]);
    setPayments([]);
    setIsLandlordState(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ subscription: 'premium', trial_ends_at: null })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }
  };

  const isPremium = profile?.subscription === 'premium';

  const addBooking = async (booking: { hostelId: string; hostelName: string; amount: number; inspectionDay?: string; inspectionTime?: string }) => {
    if (!user) return;

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        hostel_id: booking.hostelId,
        hostel_name: booking.hostelName,
        amount: booking.amount,
        status: 'confirmed',
        inspection_day: booking.inspectionDay ?? null,
        inspection_time: booking.inspectionTime ?? null,
      });

    if (!error) {
      await fetchBookings(user.id);
    }
  };


  const addPayment = async (payment: { amount: number; type: 'subscription' | 'booking' | 'hostel'; description: string }) => {
    if (!user) return;

    const { error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: payment.amount,
        payment_type: payment.type,
        description: payment.description,
        status: 'completed',
        reference: `TXN${Date.now()}`,
      });

    if (!error) {
      await fetchPayments(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isLoading,
      login,
      signup,
      logout,
      upgradeToPremium,
      isPremium,
      isLandlord,
      bookings,
      payments,
      addBooking,
      addPayment,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
