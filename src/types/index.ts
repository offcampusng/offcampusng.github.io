export interface Hostel {
  id: string;
  name: string;
  location: string;
  area: string;
  priceMin: number;
  priceMax: number;
  type: 'self-contained' | 'single-room' | 'shared';
  isVerified: boolean;
  images: string[];
  description: string;
  facilities: string[];
  caretaker?: {
    name: string;
    phone: string;
  };
  availableRooms: number;
  rating?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  university: string;
  subscription: SubscriptionPlan;
  trialEndsAt?: Date;
  createdAt: Date;
}

export type SubscriptionPlan = 'free' | 'premium' | 'trial';

export interface Booking {
  id: string;
  hostelId: string;
  hostelName: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  createdAt: Date;
  checkInDate?: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: 'subscription' | 'booking';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  createdAt: Date;
}
