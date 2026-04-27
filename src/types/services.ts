/**
 * AgroTalk Services Marketplace — Canonical Types
 */

export type ServiceCategory =
  | 'all'
  | 'soil-water'
  | 'crop-health'
  | 'drone-tech'
  | 'infrastructure'
  | 'advisory'
  | 'government';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed';
export type Urgency = 'normal' | 'urgent';

export interface ServiceTeamMember {
  name: string;
  role: string;
}

export interface ServiceReview {
  author: string;
  comment: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  includes: string[];
  priceMin: number;
  priceMax: number;
  duration: string;
  iconEmoji: string;       // emoji icon
  iconBgClass: string;     // tailwind bg class for colored tile
  teamMember: ServiceTeamMember;
  rating: number;
  reviews: ServiceReview[];
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceEmoji: string;
  category: string;
  farmerName: string;
  farmLocation: string;
  village: string;
  specialInstructions: string;
  scheduleDate: string;
  timeSlot: TimeSlot;
  urgency: Urgency;
  status: BookingStatus;
  assignedMember: string;
  priceMin: number;
  priceMax: number;
  urgencySurcharge: number;
  attachedScanDisease?: string;
  attachedScanSeverity?: string;
  reportSummary?: string;
  reportPhotos?: string[];
  reportRecommendations?: string[];
  createdAt: number;
  updatedAt: number;
}
