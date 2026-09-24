export interface Buyer {
  id: string;
  name: string;
  category: string;
  streetAddress?: string;
  city: string;
  state: string;
  country: string;
  website: string;
  email: string;
  phone: string;
  buyerName: string;
  buyerRole: string;
  specialty: string;
  estimatedOrderValue: string;
  currentSuppliers?: string;
  painPoint?: string;
  matchScore: number;
  status: 'uncontacted' | 'drafted' | 'sent' | 'failed';
  notes: string;
  lastFailureReason?: string;
  lastContactedAt?: string;
}

export interface DeliveryLog {
  id: string;
  buyerId: string;
  buyerName: string;
  email: string;
  subject: string;
  status: 'sent' | 'failed';
  failureReason?: string;
  failureCode?: string;
  timestamp: string;
  method: 'gmail' | 'default_mail' | 'direct';
}

export interface CampaignStats {
  totalAttempts: number;
  sentSuccessCount: number;
  failedCount: number;
  deliveryRate: number;
  failureBreakdown: Record<string, number>;
}
