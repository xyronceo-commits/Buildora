import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Scale,
  PhoneCall,
  ShieldCheck,
  Bookmark,
  Building2,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Wrench,
  Search,
  Truck,
  UserCheck,
  Building,
  HardHat,
} from 'lucide-react';
import { UserRole } from '../types';

interface OnboardingProps {
  onComplete: (role: UserRole) => void;
  onSignInClick: () => void;
  onAdminClick?: () => void;
}

const SCREENS = [
  {
    title: 'FIND WHAT YOU NEED TO BUILD.',
    description:
      'Discover construction materials, heavy equipment rentals, logistics and certified suppliers around your project site.',
    badge: 'DISCOVER',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-bold">
          <div className="flex items-center gap-1.5 text-amber-500">
            <MapPin className="h-4 w-4" />
            <span>My Duplex · Osogbo, Osun</span>
          </div>
          <span className="bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
            8.4 KM RADIUS
          </span>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
          <div className="h-10 w-10 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white truncate">CAT 320 EXCAVATOR (32T)</h4>
            <p className="text-[11px] text-amber-400 font-bold">₦180,000 / day · 8.4 km away</p>
          </div>
          <span className="text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded uppercase">
            Available
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "DON'T JUST FIND SUPPLIERS. FIND WHAT THEY ACTUALLY HAVE.",
    description:
      'Search for specific materials, equipment models and logistics availability — see actual listings with specs and live availability.',
    badge: 'EXACT SEARCH',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 space-y-3 text-xs">
        <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-2 border-2 border-amber-500">
          <Search className="h-4 w-4 text-amber-500" />
          <span className="text-white font-black text-sm">CAT 320 Excavator</span>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5 border border-slate-700">
          <div className="flex justify-between font-black text-white text-xs">
            <span>CAT 320 EXCAVATOR</span>
            <span className="text-amber-500">₦180,000 / day</span>
          </div>
          <div className="text-[10px] text-slate-300 font-bold flex gap-3">
            <span>32 TON</span>
            <span>DIESEL</span>
            <span className="text-emerald-400 font-black">✓ AVAILABLE</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'COMPARE BEFORE YOU CHOOSE.',
    description:
      'Compare price, distance from site, operator terms, ratings, specifications and verification side-by-side.',
    badge: 'COMPARE',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 text-xs space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center font-black pb-2 border-b border-slate-800">
          <div className="text-amber-500 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">CAT 320</div>
          <div className="text-slate-300 p-2 bg-slate-800 rounded-lg">KOMATSU PC210</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-400 text-[10px] font-bold">DAILY RATE</div>
            <div className="font-black text-amber-500 text-sm">₦180,000</div>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-400 text-[10px] font-bold">DAILY RATE</div>
            <div className="font-black text-slate-200 text-sm">₦150,000</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'FOUND IT? CONNECT DIRECTLY.',
    description:
      'Contact the supplier directly without unnecessary middlemen. Call, send WhatsApp messages, request formal quotes, or get site directions.',
    badge: 'CONNECT',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 grid grid-cols-2 gap-3">
        <div className="bg-amber-500 text-black font-black p-3 rounded-xl text-center text-xs flex items-center justify-center gap-2 shadow-lg">
          <PhoneCall className="h-4 w-4" /> CALL SUPPLIER
        </div>
        <div className="bg-emerald-600 text-white font-black p-3 rounded-xl text-center text-xs flex items-center justify-center gap-2 shadow-lg">
          <span>WHATSAPP</span>
        </div>
      </div>
    ),
  },
  {
    title: "KNOW WHO YOU'RE DEALING WITH.",
    description:
      'Verified construction supplier profiles, ratings, reviews, physical depot location, and equipment fleet photos.',
    badge: 'TRUST',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-white uppercase">Osun Heavy Rental Yard</h4>
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded">
            <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
          <span>★ 4.9 RATING</span>
          <span className="text-slate-400 text-[11px] font-normal">(34 verified reviews)</span>
        </div>
      </div>
    ),
  },
  {
    title: 'KEEP YOUR BEST OPTIONS CLOSE.',
    description:
      'Save equipment, building materials, tippers and certified businesses directly to your project binder.',
    badge: 'SAVE',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-3 space-y-2 text-xs">
        <div className="p-2.5 bg-slate-800 rounded-xl flex justify-between items-center text-slate-200 font-bold">
          <span>Dangote Cement (Apex Depot)</span>
          <span className="text-amber-500 font-black">₦10,500/bag</span>
        </div>
        <div className="p-2.5 bg-slate-800 rounded-xl flex justify-between items-center text-slate-200 font-bold">
          <span>10 Ton Tipper Haulage</span>
          <span className="text-amber-500 font-black">₦38,000/trip</span>
        </div>
      </div>
    ),
  },
  {
    title: "SEARCH AROUND WHERE YOU'RE BUILDING.",
    description:
      'Constrora prioritizes resources around your active construction project site location, not just where your phone happens to be.',
    badge: 'PROJECT SITE',
    mockup: (
      <div className="w-full rounded-2xl bg-slate-900 border-2 border-slate-800 p-4 space-y-3">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">ACTIVE SITE ADDRESS</div>
        <div className="bg-amber-500/10 border-2 border-amber-500 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-black text-white text-sm">MY DUPLEX SITE</div>
            <div className="text-xs text-amber-500 font-bold">Ring Road Phase 2, Osogbo</div>
          </div>
          <span className="text-[10px] bg-amber-500 text-black font-black px-2.5 py-1 rounded uppercase">
            SITE
          </span>
        </div>
      </div>
    ),
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSignInClick, onAdminClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  const isFinalSlide = currentIndex === SCREENS.length;

  const handleNext = () => {
    if (currentIndex < SCREENS.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowRoleSelection(true);
    }
  };

  const handlePrev = () => {
    if (showRoleSelection) {
      setShowRoleSelection(false);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0B0C0E] text-white p-6 md:p-12 max-w-xl mx-auto overflow-y-auto bg-grid-industrial">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        {(currentIndex > 0 || showRoleSelection) ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/constrora-logo.svg"
              alt="CONSTRORA Logo"
              className="h-8 w-8 rounded-lg object-contain shadow-sm"
            />
          </div>
        )}

        <div className="font-['Cabinet_Grotesk'] text-xl font-black tracking-wider text-white">
          CONSTR<span className="text-amber-500">ORA</span>
        </div>

        {!showRoleSelection && !isFinalSlide && (
          <button
            onClick={() => setCurrentIndex(SCREENS.length)}
            className="text-xs font-black text-slate-400 hover:text-amber-500 transition-colors cursor-pointer uppercase tracking-wider"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content Area with Large Bold Typography */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          {showRoleSelection ? (
            <motion.div
              key="role_selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
                  ACCOUNT ROLE
                </span>
                <h2 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-white leading-tight uppercase">
                  HOW WILL YOU USE CONSTRORA?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Select your platform workflow. You can switch modes anytime.
                </p>
              </div>

              {/* Two Large Visual Cards */}
              <div className="space-y-4 pt-2">
                {/* CLIENT CARD */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    selectedRole === 'client'
                      ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === 'client' ? 'bg-amber-500 text-black font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <UserCheck className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-white uppercase">CLIENT / BUILDER</h3>
                      {selectedRole === 'client' && (
                        <span className="text-[10px] bg-amber-500 text-black font-black px-2.5 py-1 rounded uppercase">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium leading-relaxed">
                      "I’m looking for construction materials, equipment rentals, tipper transport or verified suppliers around my site."
                    </p>
                  </div>
                </button>

                {/* SUPPLIER CARD */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('supplier')}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    selectedRole === 'supplier'
                      ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === 'supplier' ? 'bg-amber-500 text-black font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-white uppercase">SUPPLIER / FLEET OWNER</h3>
                      {selectedRole === 'supplier' && (
                        <span className="text-[10px] bg-amber-500 text-black font-black px-2.5 py-1 rounded uppercase">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium leading-relaxed">
                      "I provide construction materials, machinery rentals, haulage logistics or site services."
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => onComplete(selectedRole)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-sm font-black text-black hover:bg-amber-400 transition-all cursor-pointer shadow-xl shadow-amber-500/20 uppercase tracking-wider"
              >
                CONTINUE TO PLATFORM <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          ) : !isFinalSlide ? (
            <motion.div
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-500 border border-amber-500/30 uppercase tracking-widest">
                <span>{SCREENS[currentIndex].badge}</span>
              </div>

              <h2 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                {SCREENS[currentIndex].title}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                {SCREENS[currentIndex].description}
              </p>

              <div className="pt-2">{SCREENS[currentIndex].mockup}</div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-black font-black">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-2">
                <h2 className="font-['Cabinet_Grotesk'] text-3xl sm:text-5xl font-black text-white leading-tight uppercase">
                  EVERYTHING YOU NEED TO BUILD, CLOSER TO YOU.
                </h2>
                <p className="text-xs uppercase tracking-widest text-amber-500 font-black">
                  DISCOVER · COMPARE · CONNECT
                </p>
              </div>

              <p className="text-sm text-slate-300 max-w-sm mx-auto font-medium">
                Find actual construction resources around your project and connect directly with verified suppliers.
              </p>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => setShowRoleSelection(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-sm font-black text-black hover:bg-amber-400 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/20 cursor-pointer uppercase tracking-wider"
                >
                  GET STARTED NOW <ArrowRight className="h-5 w-5" />
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                  <button
                    onClick={onSignInClick}
                    className="w-full sm:w-auto text-xs font-bold text-slate-400 hover:text-white transition-colors py-2 cursor-pointer uppercase tracking-wider"
                  >
                    Already have an account? <span className="text-amber-500 underline">Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onAdminClick) {
                        onAdminClick();
                      } else {
                        onSignInClick();
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>ADMIN PORTAL</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      {!showRoleSelection && !isFinalSlide && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {SCREENS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-sm font-black text-black hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider"
          >
            NEXT <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
