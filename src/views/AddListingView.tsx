import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, Wrench, Package, Truck, HardHat } from 'lucide-react';
import { Listing, ListingType, EquipmentCondition, AvailabilityStatus } from '../types';
import { INITIAL_CATALOG_ITEMS } from '../data/seedData';
import { useProject } from '../context/ProjectContext';

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
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('AVAILABLE');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=1000&q=80');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: Listing = {
      listingId: `list_${Date.now()}`,
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
      location: activeProject.location,
      delivery: {
        available: true,
        serviceArea: `${activeProject.location.city} + 50km`,
        fee: 25000,
      },
      photos: [photoUrl],
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
              <div className="font-bold text-amber-400">Rental Rates & Terms</div>
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
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description / Machine History</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide brief details about operator certification, maintenance history..."
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
