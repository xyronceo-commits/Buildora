import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, Wrench, Package, Truck, HardHat } from 'lucide-react';
import { Listing, ListingType, EquipmentCondition, AvailabilityStatus } from '../types';
import { INITIAL_CATALOG_ITEMS } from '../data/seedData';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface AddListingViewProps {
  businessId: string;
  businessName: string;
  onBack: () => void;
  onPublish: (listing: Listing) => void;
}

export const AddListingView: React.FC<AddListingViewProps> = ({
  businessId,
  businessName,
  onBack,
  onPublish,
}) => {
  const { activeProject } = useProject();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<ListingType>('equipment');
  const [catalogItemId, setCatalogItemId] = useState(INITIAL_CATALOG_ITEMS[0].catalogItemId);
  const [title, setTitle] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<EquipmentCondition>('GOOD');
  const [dailyPrice, setDailyPrice] = useState(150000);
  const [weeklyPrice, setWeeklyPrice] = useState(900000);
  const [operatorIncluded, setOperatorIncluded] = useState<'Included' | 'Not included' | 'Optional'>('Included');
  const [fuelIncluded, setFuelIncluded] = useState<'Included' | 'Not included' | 'Depends'>('Not included');
  const [operatingWeight, setOperatingWeight] = useState('21,000 kg');
  const [enginePower, setEnginePower] = useState('110 kW');
  const [bucketCapacity, setBucketCapacity] = useState('1.2 m³');
  const [streetAddress, setStreetAddress] = useState('Plot 12, Gbongan Road Industrial Zone');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('AVAILABLE');
  // 3 Required Listing Photos: Front, Engine, Back
  const DEFAULT_FRONT = 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=1000&q=80';
  const DEFAULT_ENGINE = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80';
  const DEFAULT_BACK = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80';

  const [frontPhotoUrl, setFrontPhotoUrl] = useState('');
  const [enginePhotoUrl, setEnginePhotoUrl] = useState('');
  const [backPhotoUrl, setBackPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleAutofillSamplePhotos = () => {
    setFrontPhotoUrl(DEFAULT_FRONT);
    setEnginePhotoUrl(DEFAULT_ENGINE);
    setBackPhotoUrl(DEFAULT_BACK);
    setPhotoError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
          setPhotoError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontPhotoUrl.trim() || !enginePhotoUrl.trim() || !backPhotoUrl.trim()) {
      setPhotoError('Strict Requirement: You must upload or select all 3 photos (1. Front View, 2. Engine View, 3. Back View) before publishing your listing.');
      return;
    }

    const finalPhotos = [
      frontPhotoUrl.trim(),
      enginePhotoUrl.trim(),
      backPhotoUrl.trim(),
    ];

    const newListing: Listing = {
      listingId: `list_${Date.now()}`,
      ownerId: currentUser?.uid,
      businessId,
      businessName,
      businessVerification: 'VERIFIED',
      businessRating: 4.9,
      catalogItemId,
      type,
      category: type === 'equipment' ? 'CONSTRUCTION EQUIPMENT' : type === 'material' ? 'CONSTRUCTION MATERIALS' : 'CONSTRUCTION LOGISTICS',
      title: title || `${manufacturer} ${model} Equipment`,
      manufacturer,
      model,
      condition,
      specifications: {
        operatingWeight,
        enginePower,
        bucketCapacity,
      },
      rental: {
        dailyPrice,
        weeklyPrice,
        operatorIncluded,
        fuelIncluded,
      },
      availability: {
        status: availabilityStatus,
      },
      location: {
        ...activeProject.location,
        address: streetAddress.trim() || 'Plot 12, Gbongan Road Industrial Zone',
      },
      delivery: {
        available: true,
        serviceArea: `${activeProject.location.city} + 50km`,
        fee: 25000,
      },
      photos: finalPhotos,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onPublish(newListing);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel & Back
      </button>

      <div className="rounded-3xl bg-[#121418] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="font-['Cabinet_Grotesk'] text-2xl font-black text-white">
              LIST EQUIPMENT / MATERIAL
            </h1>
            <p className="text-xs text-slate-400">Step {step} of 5 — Structured Supplier Listing System</p>
          </div>
          <span className="text-xs bg-amber-500 text-black font-extrabold px-3 py-1 rounded-full">
            BUILDORA CATALOGUE
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <label className="font-bold text-slate-300 block">Select Listing Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'equipment', label: 'Equipment', icon: Wrench },
                  { id: 'material', label: 'Material', icon: Package },
                  { id: 'logistics', label: 'Logistics', icon: Truck },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as any)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer font-bold ${
                      type === t.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <t.icon className="h-6 w-6" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Standardized Catalogue Template</label>
                <select
                  value={catalogItemId}
                  onChange={(e) => setCatalogItemId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                >
                  {INITIAL_CATALOG_ITEMS.map((cat) => (
                    <option key={cat.catalogItemId} value={cat.catalogItemId}>
                      {cat.name} ({cat.subcategory})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CATERPILLAR 320 Tracked Hydraulic Excavator"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Caterpillar, Komatsu"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Model / Reference</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. 320 GC"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="font-bold text-amber-400">Specifications & Condition</div>
              <div className="grid grid-cols-3 gap-2">
                {['NEW', 'LIKE NEW', 'GOOD', 'FAIR'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond as any)}
                    className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                      condition === cond ? 'bg-amber-500 text-black border-amber-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Operating Weight</label>
                  <input
                    type="text"
                    value={operatingWeight}
                    onChange={(e) => setOperatingWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Engine Power</label>
                  <input
                    type="text"
                    value={enginePower}
                    onChange={(e) => setEnginePower(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="font-bold text-amber-400">Rental Rates & Location</div>
              
              <div>
                <label className="font-bold text-slate-300 block mb-1">Supplier Depot / Yard Physical Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Plot 12, Gbongan Road Industrial Zone"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Daily Price (₦)</label>
                  <input
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Weekly Price (₦)</label>
                  <input
                    type="number"
                    value={weeklyPrice}
                    onChange={(e) => setWeeklyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" /> 3 Mandatory Photos Required
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    You must provide 3 distinct photos showing the Front, Engine / Compartment, and Back of your listing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillSamplePhotos}
                  className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  ⚡ Use Sample Photos (3 Angles)
                </button>
              </div>

              {photoError && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
                  <span>{photoError}</span>
                  <button type="button" onClick={() => setPhotoError(null)} className="text-slate-400 hover:text-white text-xs underline ml-2">Dismiss</button>
                </div>
              )}

              {/* 3 Photo Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. FRONT PHOTO */}
                <div className={`bg-slate-900/80 border rounded-2xl p-3 space-y-2 text-center transition-colors ${frontPhotoUrl ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                    <span className="text-amber-400">1. FRONT VIEW</span>
                    {frontPhotoUrl ? (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Check className="h-3 w-3" /> UPLOADED
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
                    {frontPhotoUrl ? (
                      <img src={frontPhotoUrl} alt="Front View" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500">No photo selected</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg cursor-pointer transition-colors mb-1">
                      Choose Front File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setFrontPhotoUrl)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={frontPhotoUrl}
                      onChange={(e) => {
                        setFrontPhotoUrl(e.target.value);
                        setPhotoError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 2. ENGINE PHOTO */}
                <div className={`bg-slate-900/80 border rounded-2xl p-3 space-y-2 text-center transition-colors ${enginePhotoUrl ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                    <span className="text-amber-400">2. ENGINE VIEW</span>
                    {enginePhotoUrl ? (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Check className="h-3 w-3" /> UPLOADED
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
                    {enginePhotoUrl ? (
                      <img src={enginePhotoUrl} alt="Engine View" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500">No photo selected</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg cursor-pointer transition-colors mb-1">
                      Choose Engine File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setEnginePhotoUrl)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={enginePhotoUrl}
                      onChange={(e) => {
                        setEnginePhotoUrl(e.target.value);
                        setPhotoError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 3. BACK PHOTO */}
                <div className={`bg-slate-900/80 border rounded-2xl p-3 space-y-2 text-center transition-colors ${backPhotoUrl ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                    <span className="text-amber-400">3. BACK VIEW</span>
                    {backPhotoUrl ? (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Check className="h-3 w-3" /> UPLOADED
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
                    {backPhotoUrl ? (
                      <img src={backPhotoUrl} alt="Back View" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500">No photo selected</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg cursor-pointer transition-colors mb-1">
                      Choose Back File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setBackPhotoUrl)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={backPhotoUrl}
                      onChange={(e) => {
                        setBackPhotoUrl(e.target.value);
                        setPhotoError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description & Maintenance History</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about operator certification, maintenance history, hour meter reading..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold"
              >
                Back
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto bg-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto bg-amber-500 text-black font-black px-6 py-3 rounded-xl cursor-pointer uppercase tracking-wider"
              >
                PUBLISH LISTING
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
