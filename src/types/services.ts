export type ServiceCategory = 'soil' | 'crop' | 'drone' | 'infrastructure' | 'advisory' | 'government';

export interface Service {
  id: string;
  name: string;
  nameLocale: Record<string, string>; // ta, hi, te, mr, en
  description: string;
  descLocale: Record<string, string>;
  icon: string;           // emoji
  category: ServiceCategory;
  priceMin: number;       // in ₹
  priceMax: number;
  duration: string;       // "2-3 hrs"
  includes: string[];     // checklist items
  urgencyLevels: ('normal' | 'urgent')[];
}

export interface Booking {
  id: string;             // generated uuid
  serviceId: string;
  serviceName: string;
  farmerName: string;
  farmLocation: string;
  scheduledDate: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
  urgency: 'normal' | 'urgent';
  specialInstructions: string;
  attachedScanId?: string;  // from crop disease scan
  createdAt: string;
  teamMember?: string;
  reportUrl?: string;
}
