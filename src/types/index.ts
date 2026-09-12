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
  isVerified?: boolean;
  verificationDocUrl?: string;
  verificationDetails?: {
    cacNumber?: string;
    businessRegNumber?: string;
    tinNumber?: string;
    idCardUrl?: string;
    notes?: string;
  };
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
  minimumPeriod?: string;
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
  ownerId?: string;
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
  contactPhone?: string;
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

export interface QuoteRequestItem {
  listingId?: string;
  catalogItemId?: string;
  name: string;
  quantity: string | number;
  unit: string;
  specifications?: string;
}

export interface QuoteRequest {
  quoteRequestId: string;
  clientId: string;
  userId?: string;
  supplierBusinessId: string;
  businessId?: string;
  supplierOwnerId?: string;
  listingId?: string;
  listingTitle?: string;
  clientName: string;
  userName?: string;
  clientPhone: string;
  userPhone?: string;
  clientEmail: string;
  projectName: string;
  projectLocation: string | LocationData; // string or location summary
  requiredDate: string;
  items: QuoteRequestItem[];
  itemName: string;
  quantity: string;
  message: string;
  attachments?: string[];
  status: 'NEW' | 'sent' | 'viewed' | 'VIEWED' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  itemId: string;
  item: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface SupplierQuote {
  quoteId: string;
  quoteRequestId?: string;
  businessId: string;
  businessName?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectName: string;
  projectLocation: string;
  quoteNumber: string;
  items: QuoteLineItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  labourFee: number;
  otherCharges: number;
  tax: number;
  grandTotal: number;
  notes: string;
  validUntil: string;
  status: 'DRAFT' | 'GENERATED';
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
