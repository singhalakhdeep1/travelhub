export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'HOST' | 'GUEST';
  avatar?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: 'APARTMENT' | 'HOUSE' | 'CONDO' | 'VILLA' | 'STUDIO' | 'OTHER';
  address: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  host?: User;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  property?: Property;
  user?: User;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
