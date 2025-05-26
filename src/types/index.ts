export interface User {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  imageUrl?: string;
  description?: string;
  courtsCount?: number;
  avgRating?: number;
}

export interface Court {
  id: string;
  venueId: string;
  courtNumber: number;
  courtType?: string;
  isIndoor: boolean;
  amenities?: string[];
  imageUrl?: string;
  avgRating?: number;
  ratingsCount?: number;
}

export interface Rating {
  id: string;
  courtId: string;
  userId: string;
  overallRating: number;
  surfaceRating?: number;
  netRating?: number;
  lightingRating?: number;
  comment?: string;
  createdAt: string;
  username?: string;
}