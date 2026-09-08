import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Wrench,
  Package,
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  Upload,
  Edit,
  Search,
  HardHat,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Business, Listing, BusinessCategory, EquipmentCondition, AvailabilityStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, sanitizeForFirestore, OperationType } from '../lib/firebase';
import { INITIAL_CATALOG_ITEMS } from '../data/seedData';

interface SupplierOnboardingViewProps {
  onBackToRoleSelection: () => void;
  onComplete: (business: Business, firstListing?: Listing) => void;
  onOpenAuthModal?: () => void;
}

export const SupplierOnboardingView: React.FC<SupplierOnboardingViewProps> = ({
  onBackToRoleSelection,
  onComplete,
  onOpenAuthModal,
}) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { activeProject } = useProject();

  // Resume saved step if exists from currentUser or localStorage
  const [step, setStep] = useState<number>(() => {
    if (currentUser?.supplierOnboardingStep) return currentUser.supplierOnboardingStep;
    const savedStep = localStorage.getItem('buildora_supplier_onboarding_step');
    return savedStep ? Number(savedStep) : 1;
  });

  const [isFinished, setIsFinished] = useState(false);

  // Sync saved step when currentUser loads
  useEffect(() => {
    if (currentUser?.supplierOnboardingStep && currentUser.supplierOnboardingStep > 0) {
      setStep(currentUser.supplierOnboardingStep);
    }
  }, [currentUser]);

  // Sync Step to LocalStorage and Firestore immediately upon state change
  useEffect(() => {
    localStorage.setItem('buildora_supplier_onboarding_step', step.toString());
    localStorage.setItem('buildora_temp_role', 'supplier');
    if (currentUser) {
      updateUserProfile({
        role: 'supplier',
        supplierOnboardingStep: step,
      });
    }
  }, [step]);

  // STEP 1: BUSINESS INFO
  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem('buildora_sup_name') || '';
  });
  const [businessType, setBusinessType] = useState<BusinessCategory>(() => {
    return (localStorage.getItem('buildora_sup_type') as BusinessCategory) || 'Equipment Rental';
  });

  // STEP 2: OFFERINGS & SPECIFIC CATALOGUE
  const [offeringCategories, setOfferingCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('buildora_sup_cats');
    return saved ? JSON.parse(saved) : ['equipment', 'logistics'];
  });
  const [selectedCatalogItemIds, setSelectedCatalogItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('buildora_sup_catalog_ids');
    return saved ? JSON.parse(saved) : ['cat_320_excavator', 'concrete_mixer_350l', 'tipper_10ton'];
  });
  const [catalogSearch, setCatalogSearch] = useState('');

  // STEP 3: FIRST LISTING (OPTIONAL)
  const [skipFirstListing, setSkipFirstListing] = useState(false);
  const [listingTitle, setListingTitle] = useState('CAT 320 Hydraulic Excavator (32 Ton)');
  const [listingCondition, setListingCondition] = useState<EquipmentCondition>('GOOD');
  const [listingAvailability, setListingAvailability] = useState<AvailabilityStatus>('AVAILABLE');
  const [dailyPrice, setDailyPrice] = useState<number>(180000);
  const [weeklyPrice, setWeeklyPrice] = useState<number>(1080000);
  const [operatingWeight, setOperatingWeight] = useState('21,000 kg');
  const [enginePower, setEnginePower] = useState('110 kW');
  const [bucketCapacity, setBucketCapacity] = useState('1.2 m³');
  const [fuelType, setFuelType] = useState('Diesel');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=1000&q=80');

  // STEP 4: LOCATION & SERVICE AREA
  const [address, setAddress] = useState('Km 4, Osogbo-Ilesa Expressway');
  const [city, setCity] = useState('Osogbo');
  const [state, setState] = useState('Osun');
  const [serviceArea, setServiceArea] = useState('Osogbo, Ilesa, Ife, Ede & Surrounding Sites');

  // STEP 5: CONTACT & DESCRIPTION
  const [phone, setPhone] = useState('+234 803 456 7890');
  const [whatsapp, setWhatsapp] = useState('+234 803 456 7890');
  const [email, setEmail] = useState('contact@abcrentals.ng');
  const [website, setWebsite] = useState('www.abcrentals.ng');
  const [description, setDescription] = useState('Certified construction equipment rental yard and site logistics provider offering excavators, concrete mixers and tippers.');
  const [openingHours, setOpeningHours] = useState('Mon - Sat: 7:00 AM - 6:00 PM');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);

  // Persist form fields
  useEffect(() => {
    localStorage.setItem('buildora_sup_name', businessName);
    localStorage.setItem('buildora_sup_type', businessType);
    localStorage.setItem('buildora_sup_cats', JSON.stringify(offeringCategories));
    localStorage.setItem('buildora_sup_catalog_ids', JSON.stringify(selectedCatalogItemIds));
  }, [businessName, businessType, offeringCategories, selectedCatalogItemIds]);

  const toggleCategory = (cat: string) => {
    if (offeringCategories.includes(cat)) {
      setOfferingCategories(offeringCategories.filter((c) => c !== cat));
    } else {
      setOfferingCategories([...offeringCategories, cat]);
    }
  };

  const toggleCatalogItem = (id: string) => {
    if (selectedCatalogItemIds.includes(id)) {
      setSelectedCatalogItemIds(selectedCatalogItemIds.filter((item) => item !== id));
    } else {
      setSelectedCatalogItemIds([...selectedCatalogItemIds, id]);
    }
  };

  const handleNextStep = () => {
    if (step < 6) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToRoleSelection();
    }
  };

  const handlePublishBusiness = async () => {
    const bizId = `biz_${Date.now()}`;
    const newBusiness: Business = {
      businessId: bizId,
      ownerId: currentUser?.uid || 'usr_supplier_temp',
      businessName: businessName || 'ABC Equipment Rentals',
      category: businessType,
      description: description || 'Certified heavy construction equipment rental yard and haulage logistics supplier.',
      phone: phone || '+234 803 123 4567',
      whatsapp: whatsapp || '+234 803 123 4567',
      email: email || currentUser?.email || 'supplier@constrora.ng',
      website,
      location: {
        address: address || 'Site Depot',
        city: city || 'Osogbo',
        state: state || 'Osun',
        country: 'Nigeria',
        latitude: 7.7827,
        longitude: 4.5418,
      },
      serviceArea: serviceArea || `${city} & Surrounding Sites`,
      openingHours,
      offeringCategories,
      offeringCatalogItems: selectedCatalogItemIds,
      verificationStatus: 'VERIFICATION_PENDING',
      rating: 5.0,
      reviewCount: 1,
      deliveryAvailable,
      photos: [photoUrl],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newFirstListing: Listing | undefined = undefined;

    if (!skipFirstListing) {
      const firstListingId = `list_${Date.now()}`;
      newFirstListing = {
        listingId: firstListingId,
        businessId: bizId,
        businessName: newBusiness.businessName,
        businessVerification: 'VERIFICATION_PENDING',
        businessRating: 5.0,
        type: offeringCategories.includes('equipment')
          ? 'equipment'
          : offeringCategories.includes('material')
          ? 'material'
          : 'logistics',
        title: listingTitle || 'CAT 320 Hydraulic Excavator',
        category: businessType,
        condition: listingCondition,
        specifications: {
          operatingWeight,
          enginePower,
          bucketCapacity,
          fuelType,
        },
        rental: {
          dailyPrice,
          weeklyPrice,
          operatorIncluded: 'Included',
          fuelIncluded: 'Not included',
        },
        availability: {
          status: listingAvailability,
        },
        location: newBusiness.location,
        delivery: {
          available: deliveryAvailable,
          serviceArea,
          fee: 25000,
        },
        photos: [photoUrl],
        description,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Store in Firestore if user is logged in
    if (currentUser && !currentUser.uid.startsWith('demo_')) {
      try {
        await setDoc(doc(db, 'businesses', bizId), sanitizeForFirestore(newBusiness));
        if (newFirstListing) {
          await setDoc(doc(db, 'listings', newFirstListing.listingId), sanitizeForFirestore(newFirstListing));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `businesses/${bizId}`);
      }
    }

    // Mark user supplier onboarding completed
    localStorage.setItem('buildora_supplier_onboarding_completed', 'true');
    localStorage.removeItem('buildora_supplier_onboarding_step');

    await updateUserProfile({
      role: 'supplier',
      supplierOnboardingCompleted: true,
      onboardingCompleted: true,
      businessId: bizId,
    });

    setIsFinished(true);
    onComplete(newBusiness, newFirstListing);
  };

  const filteredCatalog = INITIAL_CATALOG_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.subcategory.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 px-4 text-center">
        <div className="rounded-3xl bg-[#121418] border-2 border-amber-500/50 p-8 space-y-6 shadow-2xl bg-grid-industrial">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-amber-500 text-black flex items-center justify-center font-black shadow-xl shadow-amber-500/20">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
              SUPPLIER PROFILE CREATED
            </span>
            <h1 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              YOU'RE LIVE ON CONSTRORA
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-md mx-auto">
              Builders across <strong className="text-amber-400">{city}, {state}</strong> can now find your business on Constrora.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase">BUSINESS NAME:</span>
              <strong className="text-white text-sm">{businessName || 'ABC Equipment Rentals'}</strong>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="font-bold text-slate-400 uppercase">VERIFICATION STATUS:</span>
              <span className="bg-amber-500/20 text-amber-400 font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase">
                VERIFICATION PENDING
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="font-bold text-slate-400 uppercase">INITIAL LISTINGS:</span>
              <strong className="text-amber-400">{skipFirstListing ? '0 Items (Skipped)' : '1 Item Published'}</strong>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onComplete({
                businessId: `biz_${Date.now()}`,
                ownerId: currentUser?.uid || 'usr_temp',
                businessName: businessName || 'ABC Equipment Rentals',
                category: businessType,
                description,
                phone,
                whatsapp,
                email: currentUser?.email || 'contact@constrora.ng',
                location: { address, city, state, country: 'Nigeria', latitude: 7.78, longitude: 4.54 },
                verificationStatus: 'VERIFICATION_PENDING',
                rating: 5.0,
                reviewCount: 1,
                deliveryAvailable: true,
                photos: [photoUrl],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              GO TO SUPPLIER DASHBOARD <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4 pb-24">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevStep}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" /> {step === 1 ? 'Change Role' : 'Back'}
        </button>

        <div className="text-right">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
            STEP {step} OF 6
          </span>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
            {step === 1 && 'BUSINESS INFO'}
            {step === 2 && 'OFFERINGS'}
            {step === 3 && 'FIRST LISTING'}
            {step === 4 && 'LOCATION'}
            {step === 5 && 'CONTACT'}
            {step === 6 && 'REVIEW & PUBLISH'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl bg-[#121418] border-2 border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl bg-grid-industrial">
        {/* STEP 1: BUSINESS NAME & TYPE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                LET'S SET UP YOUR BUSINESS
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                TELL US ABOUT YOUR BUSINESS.
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Create your Constrora supplier profile so builders can find what you offer around their site.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  BUSINESS NAME *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. ABC Equipment Rentals"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  BUSINESS TYPE *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                >
                  <option value="Equipment Rental">Equipment Rental</option>
                  <option value="Construction Materials">Construction Materials</option>
                  <option value="Construction Logistics">Construction Logistics</option>
                  <option value="Construction Services">Construction Services</option>
                  <option value="Other Construction Business">Other Construction Business</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!businessName.trim()}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              CONTINUE TO OFFERINGS <ArrowRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 2: WHAT DO YOU OFFER? */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                RESOURCE CATEGORIES
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                WHAT DO YOU OFFER?
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Select the core categories of resources your business provides to builders.
              </p>
            </div>

            {/* Category Checkboxes */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'equipment', label: 'EQUIPMENT', icon: Wrench, desc: 'Excavators, mixers, generators, cranes' },
                { id: 'material', label: 'MATERIALS', icon: Package, desc: 'Cement, blocks, sand, granite, steel' },
                { id: 'logistics', label: 'LOGISTICS', icon: Truck, desc: 'Tippers, lowbeds, flatbeds, site haulage' },
                { id: 'service', label: 'SERVICES', icon: HardHat, desc: 'Piling, trenching, soil testing, batching' },
              ].map((c) => {
                const isSelected = offeringCategories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <c.icon className={`h-6 w-6 ${isSelected ? 'text-amber-500' : 'text-slate-500'}`} />
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-xs uppercase text-white">{c.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{c.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Catalogue Searchable Multi-Select */}
            <div className="space-y-3 pt-2">
              <div className="font-black text-xs text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>WHAT SPECIFICALLY DO YOU OFFER?</span>
                <span className="text-[10px] text-slate-400 font-normal">CONSTRORA STANDARDIZED CATALOGUE</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search catalogue (e.g. CAT 320, Cement, Tipper)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
                {filteredCatalog.map((item) => {
                  const isChecked = selectedCatalogItemIds.includes(item.catalogItemId);
                  return (
                    <div
                      key={item.catalogItemId}
                      onClick={() => toggleCatalogItem(item.catalogItemId)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked ? 'bg-amber-500/10 border-amber-500/40 text-white font-bold' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block">{item.subcategory}</span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20"
            >
              CONTINUE TO FIRST LISTING <ArrowRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 3: ADD FIRST LISTING (OPTIONAL) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                YOUR FIRST LISTING (OPTIONAL)
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                ADD SOMETHING BUILDERS CAN FIND.
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Publish an initial piece of machinery or offer now, or skip this step to add listings later from your supplier dashboard.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  LISTING TITLE
                </label>
                <input
                  type="text"
                  required
                  value={listingTitle}
                  onChange={(e) => {
                    setListingTitle(e.target.value);
                    setSkipFirstListing(false);
                  }}
                  placeholder="e.g. CATERPILLAR 320 Tracked Hydraulic Excavator"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    CONDITION
                  </label>
                  <select
                    value={listingCondition}
                    onChange={(e) => setListingCondition(e.target.value as any)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="NEEDS MAINTENANCE">Needs Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    AVAILABILITY
                  </label>
                  <select
                    value={listingAvailability}
                    onChange={(e) => setListingAvailability(e.target.value as any)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold text-emerald-400"
                  >
                    <option value="AVAILABLE">AVAILABLE NOW</option>
                    <option value="CURRENTLY RENTED">CURRENTLY RENTED</option>
                    <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    DAILY RATE (₦)
                  </label>
                  <input
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-black"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    WEEKLY RATE (₦)
                  </label>
                  <input
                    type="number"
                    value={weeklyPrice}
                    onChange={(e) => setWeeklyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-black"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-bold text-amber-400 uppercase text-[11px]">MACHINE / RESOURCE SPECS</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Operating Weight</label>
                    <input
                      type="text"
                      value={operatingWeight}
                      onChange={(e) => setOperatingWeight(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Engine Power</label>
                    <input
                      type="text"
                      value={enginePower}
                      onChange={(e) => setEnginePower(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Bucket Capacity</label>
                    <input
                      type="text"
                      value={bucketCapacity}
                      onChange={(e) => setBucketCapacity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Fuel Type</label>
                    <input
                      type="text"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  LISTING PHOTO IMAGE URL
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
                {photoUrl && (
                  <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-slate-800">
                    <img src={photoUrl} alt="Listing Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-2 left-2 bg-black/80 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                      LIVE PHOTO PREVIEW
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSkipFirstListing(true);
                  handleNextStep();
                }}
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 font-black py-4 rounded-2xl text-xs hover:bg-slate-800 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
              >
                SKIP FOR NOW
              </button>
              <button
                type="button"
                onClick={() => {
                  setSkipFirstListing(false);
                  handleNextStep();
                }}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20"
              >
                SAVE LISTING & CONTINUE <ArrowRight className="inline h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BUSINESS LOCATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                DEPOT & SITE LOCATION
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                WHERE ARE YOU LOCATED?
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Builders will see how far your depot or equipment is from their construction site.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  BUSINESS ADDRESS *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Km 4, Osogbo-Ilesa Expressway, near Technical Roundabout"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    CITY *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Osogbo"
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    STATE *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Osun"
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  SERVICE AREA COVERAGE
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Osogbo, Ilesa, Ife, Ede, Ibadan"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20"
            >
              CONTINUE TO CONTACT DETAILS <ArrowRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 5: CONTACT INFORMATION & AUTHENTICATION */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                DIRECT CONTACT
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                HOW CAN BUILDERS CONTACT YOU?
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Builders use these details to call, send WhatsApp messages, or request site delivery quotes directly.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-amber-500" /> PHONE NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> WHATSAPP LINE *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                    WEBSITE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-slate-200 block mb-1 uppercase tracking-wider">
                  BUSINESS DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your equipment fleet, stock capacity, site delivery coverage..."
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                />
              </div>

              {/* Authentication Status Check */}
              {!currentUser && (
                <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-2">
                  <div className="font-black text-amber-400 uppercase text-xs">
                    AUTHENTICATION REQUIRED TO SAVE BUSINESS
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Sign in with your Email so your supplier profile is permanently linked to your CONSTRORA account.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="bg-amber-500 text-black font-black px-4 py-2 rounded-xl text-xs hover:bg-amber-400 cursor-pointer uppercase"
                  >
                    Connect Account Now
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20"
            >
              REVIEW PROFILE <ArrowRight className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* STEP 6: REVIEW BEFORE PUBLISHING */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded">
                FINAL CHECK
              </span>
              <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                REVIEW YOUR BUSINESS
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Here is a preview of exactly how builders will see your business on Constrora.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Section 1: Business */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">BUSINESS</span>
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="text-sm font-black text-white">{businessName || 'ABC Equipment Rentals'}</div>
                <div className="text-slate-400">{businessType}</div>
              </div>

              {/* Section 2: Offerings */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">OFFERINGS</span>
                  <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {offeringCategories.map((c) => (
                    <span key={c} className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase font-black text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 3: First Listing */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">FIRST LISTING</span>
                  <button onClick={() => setStep(3)} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit className="h-3 w-3" /> {skipFirstListing ? 'Add Listing' : 'Edit'}
                  </button>
                </div>
                {skipFirstListing ? (
                  <div className="text-xs text-slate-400 italic mt-1">
                    Skipped for now — You can add equipment anytime from your supplier dashboard.
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-black text-white mt-1">{listingTitle}</div>
                    <div className="text-amber-400 font-extrabold">₦{dailyPrice.toLocaleString()} / day</div>
                  </>
                )}
              </div>

              {/* Section 4: Location */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">LOCATION</span>
                  <button onClick={() => setStep(4)} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="text-white font-bold">{address}, {city}, {state}</div>
                <div className="text-slate-400 text-[11px]">Service Area: {serviceArea}</div>
              </div>

              {/* Section 5: Contact */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">CONTACT</span>
                  <button onClick={() => setStep(5)} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="text-white">Phone: <strong>{phone}</strong> | WhatsApp: <strong>{whatsapp}</strong></div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePublishBusiness}
              className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" /> PUBLISH BUSINESS TO CONSTRORA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
