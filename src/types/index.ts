export type UserRole = 'client' | 'supplier' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  onboardingCompleted: boolean;
  supplierOnboardingCompleted?: boolean;
  supplierOnboardingStep?: number;
  clientOnboardingCompleted?: boolean;
  themePreference?: 'system' | 'light' | 'dark';
  activeProjectId?: string;
  businessId?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Project {
  projectId: string;
  ownerId: string;
  name: string;
  location: LocationData;
  isDefault: boolean;
  savedItemIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type VerificationStatus = 'LISTED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'REJECTED';

export type BusinessCategory =
  | 'Equipment Rental'
  | 'Construction Materials'
  | 'Construction Logistics'
  | 'Construction Services'
  | 'Other Construction Business'
  | 'Building Material Supplier'
  | 'Construction Company'
  | 'Logistics Provider'
  | 'Block Factory';

export interface Business {
  businessId: string;
  ownerId: string;
  businessName: string;
  category: BusinessCategory;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  location: LocationData;
  serviceArea?: string;
  openingHours?: string;
  offeringCategories?: string[]; // e.g. ['equipment', 'logistics', 'materials']
  offeringCatalogItems?: string[]; // e.g. ['cat_320', 'concrete_mixer_350l']
  verificationStatus: VerificationStatus;
  verificationDocUrl?: string;
  rejectionReason?: string;
  rating: number;
  reviewCount: number;
  deliveryAvailable: boolean;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export type ListingType = 'equipment' | 'material' | 'logistics' | 'service';
export type EquipmentCondition = 'NEW' | 'LIKE NEW' | 'GOOD' | 'FAIR' | 'NEEDS MAINTENANCE';
export type AvailabilityStatus = 'AVAILABLE' | 'CURRENTLY RENTED' | 'UNDER MAINTENANCE' | 'UNAVAILABLE';

export interface RentalPricing {
  hourlyPrice?: number;
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  contactForPrice?: boolean;
  securityDeposit?: number;
  operatorIncluded?: 'Included' | 'Not included' | 'Optional';
  fuelIncluded?: 'Included' | 'Not included' | 'Depends';
}

export interface DeliveryInfo {
  available: boolean;
  serviceArea?: string;
  fee?: number;
}

export interface EquipmentSpecifications {
  operatingWeight?: string;
  enginePower?: string;
  bucketCapacity?: string;
  maxDiggingDepth?: string;
  maxReach?: string;
  fuelType?: string;
  mixingCapacity?: string;
  engineType?: string;
  ratedPower?: string;
  voltage?: string;
  plateSize?: string;
  compactionForce?: string;
  payloadCapacity?: string;
  liftingHeight?: string;
  yearOfManufacture?: string;
  [key: string]: string | undefined;
}

export interface Listing {
  listingId: string;
  businessId: string;
  businessName?: string;
  businessVerification?: VerificationStatus;
  businessRating?: number;
  catalogItemId?: string;
  type: ListingType;
  title: string;
  category: string;
  subcategory?: string;
  
  // Equipment specific
  manufacturer?: string;
  model?: string;
  modelNumber?: string;
  condition?: EquipmentCondition;
  specifications?: EquipmentSpecifications;
  rental?: RentalPricing;
  
  // Material / Logistics specific
  brand?: string;
  price?: number;
  priceUnit?: string;
  priceLastUpdated?: string;
  contactForPrice?: boolean;
  
  availability: {
    status: AvailabilityStatus;
    availableFrom?: string;
  };
  
  location: LocationData;
  delivery: DeliveryInfo;
  photos: string[];
  description?: string;
  status: 'active' | 'unavailable' | 'under_maintenance' | 'paused';
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  catalogItemId: string;
  name: string;
  category: string;
  subcategory: string;
  type: ListingType;
  searchableNames: string[];
  specificationTemplate?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequest {
  quoteRequestId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  businessId: string;
  listingId?: string;
  listingTitle?: string;
  projectId?: string;
  projectName?: string;
  itemName: string;
  quantity: string;
  projectLocation: LocationData;
  message: string;
  status: 'sent' | 'viewed' | 'responded' | 'closed';
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  reviewId: string;
  businessId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  listingId?: string;
  rating: number;
  comment: string;
  status: 'visible' | 'flagged' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface SavedItem {
  savedId: string;
  type: 'business' | 'equipment' | 'material' | 'logistics';
  referenceId: string;
  createdAt: string;
}

export interface FilterState {
  category: string;
  query: string;
  maxDistanceKm: number;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  verifiedOnly: boolean;
  availableOnly: boolean;
  deliveryOnly: boolean;
  condition: string;
  sortBy: 'nearest' | 'price_asc' | 'price_desc' | 'rating' | 'recent';
}
