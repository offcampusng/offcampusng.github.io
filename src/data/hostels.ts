import { Hostel } from '@/types';

export const hostels: Hostel[] = [
  {
    id: '1',
    name: 'Graceland Hostel',
    location: 'Ekosodin',
    area: 'Off BDPA Road',
    priceMin: 150000,
    priceMax: 250000,
    type: 'self-contained',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Modern self-contained apartments with excellent facilities. Located just 5 minutes walk from UNIBEN main gate. Each room comes with a private bathroom, wardrobe, reading table, and good ventilation.',
    facilities: ['24/7 Water', 'Security', 'Prepaid Meter', 'Tiled Floor', 'POP Ceiling', 'Wardrobe'],
    caretaker: {
      name: 'Mr. Johnson',
      phone: '08012345678'
    },
    availableRooms: 8,
    rating: 4.5
  },
  {
    id: '2',
    name: 'Divine Mercy Lodge',
    location: 'Osasogie',
    area: 'Behind Zenith Bank',
    priceMin: 80000,
    priceMax: 120000,
    type: 'single-room',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Affordable single rooms perfect for students on a budget. Clean environment with shared facilities. Close to lecture halls and campus shuttle pickup points.',
    facilities: ['Borehole Water', 'Security Guard', 'Spacious Rooms', 'Parking Space'],
    caretaker: {
      name: 'Mrs. Ada',
      phone: '08098765432'
    },
    availableRooms: 15,
    rating: 4.0
  },
  {
    id: '3',
    name: 'Royal Crest Apartments',
    location: 'Ugbowo',
    area: 'Beside First Bank',
    priceMin: 200000,
    priceMax: 350000,
    type: 'self-contained',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Premium self-contained apartments with top-notch facilities. Ideal for final year students and postgraduates who want comfort and convenience.',
    facilities: ['24/7 Power (Solar)', 'Treated Water', 'CCTV Security', 'AC Ready', 'Balcony', 'Kitchen Cabinet'],
    caretaker: {
      name: 'Mr. Emeka',
      phone: '07012345678'
    },
    availableRooms: 5,
    rating: 4.8
  },
  {
    id: '4',
    name: 'Blessed Lodge',
    location: 'Ekosodin',
    area: 'Opposite Tantalizers',
    priceMin: 70000,
    priceMax: 100000,
    type: 'shared',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Budget-friendly shared rooms for students who want to split costs. 2-person rooms available with good facilities and proximity to campus.',
    facilities: ['Water Supply', 'Security', 'Reading Room', 'Generating Set'],
    caretaker: {
      name: 'Mr. Okon',
      phone: '08123456789'
    },
    availableRooms: 20,
    rating: 3.8
  },
  {
    id: '5',
    name: 'Success Villa',
    location: 'Osasogie',
    area: 'Near GTBank',
    priceMin: 120000,
    priceMax: 180000,
    type: 'self-contained',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Well-maintained self-contained rooms with a quiet and serene environment. Perfect for serious students who need a conducive reading atmosphere.',
    facilities: ['Constant Water', 'Security', 'Prepaid Meter', 'Tiled', 'Pop', 'Spacious'],
    caretaker: {
      name: 'Mrs. Grace',
      phone: '09012345678'
    },
    availableRooms: 10,
    rating: 4.2
  },
  {
    id: '6',
    name: 'New Era Hostel',
    location: 'Ugbowo',
    area: 'Off Uselu Road',
    priceMin: 90000,
    priceMax: 140000,
    type: 'single-room',
    isVerified: true,
    images: ['/placeholder.svg'],
    description: 'Newly renovated hostel with modern amenities. Single rooms with shared bathroom facilities. Great location with easy access to campus and markets.',
    facilities: ['Borehole', 'Security', 'New Building', 'Good Road Network'],
    caretaker: {
      name: 'Mr. Chidi',
      phone: '08034567890'
    },
    availableRooms: 12,
    rating: 4.1
  }
];

export const locations = ['All Locations', 'Ekosodin', 'Osasogie', 'Ugbowo'];
export const hostelTypes = ['All Types', 'self-contained', 'single-room', 'shared'];
export const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₦100k', min: 0, max: 100000 },
  { label: '₦100k - ₦150k', min: 100000, max: 150000 },
  { label: '₦150k - ₦250k', min: 150000, max: 250000 },
  { label: 'Above ₦250k', min: 250000, max: Infinity },
];
