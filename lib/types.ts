export interface Driver {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isOnline: boolean;
  isAvailable: boolean;
  driverStatus: string;
  rating: number;
  totalRides: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    vehicleType: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isBlocked: boolean;
  createdAt: string;
  totalRides: number;
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string;
  status: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedFare: number;
  distance: number;
  duration: number;
  user?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  driver?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
}

export interface Config {
  id: string;
  name: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigUpdate {
  name: string;
  value: string;
}

