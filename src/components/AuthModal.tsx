import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, MapPin, Building2, HardHat, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminMode?: boolean;
  initialRole?: UserRole;
  initialIsSignUp?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isAdminMode = false,
  initialRole = 'client',
  initialIsSignUp = false,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('Osogbo, Osun State');
  const [businessCategory, setBusinessCategory] = useState('Equipment Rental');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setIsSignUp(initialIsSignUp);
    }
  }, [isOpen, initialRole, initialIsSignUp]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName, role, {
          phoneNumber,
          location,
          businessName: role === 'supplier' ? displayName : undefined,
          businessCategory: role === 'supplier' ? businessCategory : undefined,
        });
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (demoRole: UserRole) => {
    signInAsDemoUser(demoRole);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#121418] border border-slate-800 p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 mb-3">
              <HardHat className="h-6 w-6" />
            </div>
            <h3 className="font-['Cabinet_Grotesk'] text-2xl font-black uppercase tracking-tight">
              {isAdminMode
                ? 'BUILDORA ADMIN ACCESS'
                : isSignUp
                ? `CREATE ${role.toUpperCase()} ACCOUNT`
                : 'BUILDORA SIGN IN'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
              {isAdminMode
                ? 'Sign in with buildsafe247@gmail.com'
                : isSignUp
                ? 'Fill details below to activate your account & receive verification link'
                : 'Enter your email & password to log in'}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Mode Google SSO */}
          {isAdminMode ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-black font-extrabold py-3.5 px-4 hover:bg-slate-100 transition-all cursor-pointer shadow-md mb-4 text-xs uppercase"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>SIGN IN WITH GOOGLE ADMIN</span>
            </button>
          ) : null}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Account Role Selector on Sign Up */}
            {isSignUp && (
              <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 text-xs font-black rounded-lg uppercase transition-all cursor-pointer ${
                    role === 'client'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Client / Builder
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`py-2 text-xs font-black rounded-lg uppercase transition-all cursor-pointer ${
                    role === 'supplier'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Supplier / Fleet
                </button>
              </div>
            )}

            {isSignUp && (
              <>
                {/* Name / Business Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {role === 'supplier' ? 'Company / Business Name' : 'Full Name / Organization'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={role === 'supplier' ? 'e.g. Osun Heavy Rentals Ltd' : 'e.g. Engr. David Adeleke'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Osogbo, Osun State"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Supplier Category */}
                {role === 'supplier' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Primary Business Offerings
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <select
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold appearance-none cursor-pointer"
                      >
                        <option value="Equipment Rental">Heavy Equipment Rentals</option>
                        <option value="Construction Materials">Building & Construction Materials</option>
                        <option value="Construction Logistics">Haulage & Tipper Logistics</option>
                        <option value="Construction Services">Site Contracting & Services</option>
                        <option value="Block Factory">Block & Concrete Production</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@buildora.ng"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            {/* SPAM Folder Notice for Sign Up */}
            {isSignUp && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-medium leading-relaxed space-y-1">
                <div className="font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> Check Your SPAM Folder!
                </div>
                <p>
                  A verification link will be sent to your email immediately. If you don't see it in your inbox, <strong>please check your SPAM or Junk folder</strong>.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 text-black font-black py-3.5 text-xs hover:bg-amber-400 transition-all cursor-pointer uppercase tracking-wider mt-2 shadow-lg shadow-amber-500/20"
            >
              {loading
                ? 'PROCESSING...'
                : isSignUp
                ? `CREATE ${role.toUpperCase()} ACCOUNT & VERIFY EMAIL`
                : 'SIGN IN WITH EMAIL'}
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create One Now"}
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center font-bold mb-2">
              Instant Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoSignIn('client')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 font-extrabold text-center hover:text-amber-400 transition-all cursor-pointer uppercase"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('supplier')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 font-extrabold text-center hover:text-amber-400 transition-all cursor-pointer uppercase"
              >
                Supplier Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
