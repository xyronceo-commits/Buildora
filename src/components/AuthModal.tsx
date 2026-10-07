import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, MapPin, Building2, HardHat, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialIsSignUp?: boolean;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'client',
  initialIsSignUp = false,
  initialMode,
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    sendVerificationEmail,
    checkEmailVerification,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>(
    initialMode || (initialIsSignUp ? 'signup' : 'signin')
  );
  const [role, setRole] = useState<UserRole>(initialRole);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Supplier Specific Fields (Only used during Supplier Sign Up)
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Osogbo');
  const [state, setState] = useState('Osun State');
  const [businessCategory, setBusinessCategory] = useState<string>('Equipment Rental');
  const [description, setDescription] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const interval = setInterval(() => {
      setResetCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resetCooldown]);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode || (initialIsSignUp ? 'signup' : 'signin'));
      setError(null);
      setSuccessMsg(null);
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setBusinessName('');
      setPhoneNumber('');
      setAddress('');
      setCity('Osogbo');
      setState('Osun State');
      setBusinessCategory('Equipment Rental');
      setDescription('');
    }
  }, [isOpen, initialRole, initialIsSignUp]);

  if (!isOpen) return null;

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('constrora_temp_role', newRole);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      localStorage.setItem('constrora_temp_role', role);
      await signInWithGoogle(role);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Form validations
    if (mode === 'signup') {
      if (role === 'supplier') {
        if (!businessName.trim()) {
          setError('Please enter your Company / Business Name.');
          return;
        }
        if (!displayName.trim()) {
          setError('Please enter the Manager / Contact Person Name.');
          return;
        }
        if (!phoneNumber.trim()) {
          setError('Please enter your Phone Number / WhatsApp contact.');
          return;
        }
        if (!address.trim()) {
          setError('Please enter your Company Physical Address.');
          return;
        }
      } else {
        if (!displayName.trim()) {
          setError('Please enter your Full Name.');
          return;
        }
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      localStorage.setItem('constrora_temp_role', role);

      if (mode === 'signup') {
        await signUpWithEmail(
          email,
          password,
          displayName,
          role,
          role === 'supplier'
            ? {
                businessName,
                phoneNumber,
                address,
                city,
                state,
                location: `${address}, ${city}, ${state}`,
                businessCategory,
                description,
              }
            : undefined
        );
        onClose();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'forgot') {
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
          setError('The email address format is invalid.');
          return;
        }
        await sendPasswordReset(trimmedEmail);
        setSuccessMsg('If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.');
        setResetCooldown(60);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isWorking = loading || googleLoading;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  overflow-y-auto">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] p-6 sm:p-8 text-[#111111] dark:text-white my-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            disabled={isWorking}
            className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111111] dark:text-[#9CA3AF] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Role Switcher (Client vs Supplier) - Only for Signup/Signin */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mb-6 p-1 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl grid grid-cols-2 gap-1">
              <button
                type="button"
                disabled={isWorking}
                onClick={() => handleRoleSwitch('client')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-[#FBBF24] text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <HardHat className="h-4 w-4 shrink-0" />
                <span>CLIENT PORTAL</span>
              </button>
              <button
                type="button"
                disabled={isWorking}
                onClick={() => handleRoleSwitch('supplier')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'supplier'
                    ? 'bg-[#FBBF24] text-[#111111]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span>SUPPLIER PORTAL</span>
              </button>
            </div>
          )}

          {/* Logo & Brand Header */}
          <div className="text-center mb-6 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/constrora-logo.svg"
                alt="CONSTRORA Logo"
                className="h-9 w-9 rounded-xl object-contain"
              />
              <span className="font-['Cabinet_Grotesk'] text-2xl font-black text-[#111111] dark:text-white tracking-tight">
                CONSTR<span className="text-[#FBBF24]">ORA</span>
              </span>
            </div>
            <p className="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
              {mode === 'signup'
                ? role === 'supplier'
                  ? 'Register Your Trade Business & Fleet'
                  : 'Create Your Client Account'
                : mode === 'forgot'
                ? 'Reset Account Password'
                : 'Sign in to Your Account'}
            </p>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="space-y-4 mb-5">
              <button
                type="button"
                disabled={isWorking}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#111111] hover:bg-slate-50 dark:hover:bg-[#111111]/80 text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.94H1.28v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.32 14.26c-.24-.73-.38-1.5-.38-2.26s.14-1.53.38-2.26V6.59H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.41l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.59l4.04 3.15c.94-2.84 3.58-4.99 6.68-4.99z"
                    />
                  </svg>
                )}
                <span>
                  {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E5E5E5] dark:border-[#27272A] w-full" />
                <span className="bg-white dark:bg-[#18181B] px-3 text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#9CA3AF] tracking-widest absolute">
                  OR WITH EMAIL
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <>
                {role === 'supplier' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                      Business / Trade Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <input
                        type="text"
                        required
                        disabled={isWorking}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Osogbo Plant Rentals Ltd"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                    {role === 'supplier' ? 'Contact Person / Manager Name *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      disabled={isWorking}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Babatunde Adeleke"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>
                </div>

                {role === 'supplier' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                      Business Category
                    </label>
                    <select
                      disabled={isWorking}
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                    >
                      <option value="Equipment Rental">Plant & Heavy Machinery Rental</option>
                      <option value="Construction Materials">Building Materials & Aggregates</option>
                      <option value="Construction Logistics">Tipper Haulage & Site Logistics</option>
                      <option value="Block Factory">Block Factory & Prefab Concrete</option>
                      <option value="Construction Services">Specialist Trade Contracting</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                <input
                  type="email"
                  required
                  disabled={isWorking}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                />
              </div>
            </div>

            {mode === 'signup' && role === 'supplier' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <input
                      type="tel"
                      required
                      disabled={isWorking}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                    Depot Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      disabled={isWorking}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. KM 4 Old Ikirun Road"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>
                </div>
              </>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  <input
                    type="password"
                    required
                    disabled={isWorking}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
                {mode === 'signin' && (
                  <div className="flex justify-end pt-1.5">
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-[#F59E0B] hover:text-[#D97706] font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#111111] dark:text-white mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  <input
                    type="password"
                    required
                    disabled={isWorking}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl text-xs text-[#111111] dark:text-white font-semibold focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isWorking || (mode === 'forgot' && resetCooldown > 0)}
              className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin text-[#111111]" />}
              <span>
                {mode === 'signup'
                  ? 'Create Constrora Account'
                  : mode === 'forgot'
                  ? loading
                    ? 'Sending reset link...'
                    : resetCooldown > 0
                    ? `Send reset link (${resetCooldown}s)`
                    : 'Send reset link'
                  : 'Sign In with Email'}
              </span>
            </button>

            {/* Switch Mode Links */}
            <div className="text-center pt-3 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
              {mode === 'signin' && (
                <div>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#111111] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold"
                  >
                    Register here
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  Already have an account?{' '}
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#111111] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <div>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#111111] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold inline-flex items-center gap-1"
                  >
                    &larr; Back to sign in
                  </button>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
