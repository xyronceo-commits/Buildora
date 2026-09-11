import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, MapPin, Building2, HardHat, AlertCircle, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminMode?: boolean;
  initialRole?: UserRole;
  initialIsSignUp?: boolean;
  onOpenAdminPortal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isAdminMode = false,
  initialRole = 'client',
  initialIsSignUp = false,
  onOpenAdminPortal,
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    sendVerificationEmail,
    checkEmailVerification,
    firebaseUser,
    currentUser,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>(
    initialIsSignUp ? 'signup' : 'signin'
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
  const [verificationChecked, setVerificationChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialIsSignUp ? 'signup' : 'signin');
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
          role === 'supplier' ? displayName : displayName,
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
        await sendPasswordReset(email);
        setSuccessMsg(`Password reset link sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        setSuccessMsg('Email successfully verified!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setVerificationChecked(true);
        setError('Email not verified yet. Please click the link in your email and click Check Verification again.');
      }
    } catch (err: any) {
      setError('Could not verify status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setSuccessMsg('A new verification link has been sent to your email address.');
    } catch (err: any) {
      setError('Failed to resend email. Please try again in a few moments.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-[#111111] dark:text-white my-8 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111111] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Role Switcher (Client vs Supplier) - Only for Signup/Signin */}
          {!isAdminMode && (mode === 'signin' || mode === 'signup') && (
            <div className="mb-6 p-1 bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch('client')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                    : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <HardHat className="h-4 w-4 shrink-0" />
                <span>CLIENT / BUILDER</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('supplier')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                  role === 'supplier'
                    ? 'bg-[#FBBF24] text-[#111111] shadow-xs'
                    : 'text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span>SUPPLIER / FLEET</span>
              </button>
            </div>
          )}

          {/* Logo & Brand Header */}
          <div className="text-center mb-6 space-y-2">
            <div className="flex items-center justify-center gap-2.5">
              <img
                src="/constrora-logo.svg"
                alt="CONSTRORA Logo"
                className="h-10 w-10 rounded-xl object-contain shadow-xs"
              />
              <span className="font-['Cabinet_Grotesk'] text-2xl font-black text-[#111111] dark:text-white tracking-tight">
                CONSTR<span className="text-[#F59E0B]">ORA</span>
              </span>
            </div>
            <p className="text-xs text-[#F59E0B] font-extrabold uppercase tracking-wider">
              Find what you need to build.
            </p>
          </div>

          {/* Subtitle / Mode Title */}
          <div className="text-center mb-5">
            <h3 className="font-['Cabinet_Grotesk'] text-lg font-black text-[#111111] dark:text-white uppercase tracking-wider">
              {mode === 'verify'
                ? 'VERIFY YOUR EMAIL'
                : mode === 'forgot'
                ? 'RESET YOUR PASSWORD'
                : mode === 'signup'
                ? `CREATE ${role.toUpperCase()} ACCOUNT`
                : `${role.toUpperCase()} SIGN IN`}
            </h3>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* EMAIL VERIFICATION SCREEN (Section 3 Requirement) */}
          {mode === 'verify' ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl space-y-2 text-xs">
                <p className="text-[#6B7280] dark:text-slate-300 leading-relaxed font-medium">
                  We've sent a verification link to your email address:
                </p>
                <div className="font-bold text-[#111111] dark:text-[#FBBF24] font-mono text-sm break-all">
                  {email || firebaseUser?.email || 'your email address'}
                </div>
                <p className="text-[#6B7280] dark:text-slate-400 text-[11px] pt-1">
                  Click the link in the email to activate your CONSTRORA account. (Be sure to check your SPAM folder).
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black py-3.5 text-xs transition-all cursor-pointer uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'CHECKING...' : 'CHECK VERIFICATION'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#F7F7F5] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#111111] dark:text-slate-200 border border-[#E5E5E5] dark:border-slate-700 font-bold py-3 text-xs transition-all cursor-pointer uppercase tracking-wider"
                >
                  RESEND EMAIL
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setMode('signin')}
                  className="text-xs text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* EMAIL SIGN IN / SIGN UP / FORGOT PASSWORD FORMS */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* SUPPLIER SIGN UP SPECIFIC FIELDS */}
              {mode === 'signup' && role === 'supplier' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Company / Business Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. BuildPro Heavy Fleet & Materials Ltd"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Manager / Contact Person Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Adeyemi Johnson"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +234 803 123 4567"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Primary Business Category *
                    </label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#FBBF24] font-bold cursor-pointer"
                    >
                      <option value="Equipment Rental">Equipment Rental (Heavy Machinery & Fleet)</option>
                      <option value="Building Materials">Building Materials (Cement, Granite, Sand, Rebar)</option>
                      <option value="Logistics & Haulage">Logistics & Haulage (Tipper & Truck Transport)</option>
                      <option value="Construction Services">Construction Services (Site Survey, Workmanship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Company Physical Depot Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Km 4, Osogbo-Ilesa Expressway"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Osogbo"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Osun State"
                        className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Company Description / Services (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Certified supplier providing excavators, 20-ton tippers, and site delivery."
                      className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold resize-none"
                    />
                  </div>
                </>
              )}

              {/* CLIENT SIGN UP NAME FIELD */}
              {mode === 'signup' && role === 'client' && (
                <div>
                  <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (At least 6 characters)"
                      className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="text-[10px] font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280] dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full bg-[#F7F7F5] dark:bg-slate-900 border border-[#E5E5E5] dark:border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:border-[#FBBF24] font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Forgot password link on Sign In mode */}
              {mode === 'signin' && (
                <div className="flex justify-end text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#111111] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black py-3.5 text-xs transition-all cursor-pointer uppercase tracking-wider mt-2 shadow-xs"
              >
                {loading
                  ? 'PROCESSING...'
                  : mode === 'forgot'
                  ? 'SEND RESET LINK'
                  : mode === 'signup'
                  ? 'CREATE ACCOUNT'
                  : 'SIGN IN'}
              </button>

              {/* Account Toggle Link */}
              <div className="mt-4 text-center text-xs font-bold text-[#6B7280] dark:text-slate-400 space-y-3">
                {mode === 'signin' && (
                  <div>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#111111] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold"
                    >
                      Create account
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    Already have an account?{' '}
                    <button
                      type="button"
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
                    Remembered your password?{' '}
                    <button
                      type="button"
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

                {onOpenAdminPortal && (
                  <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#374151]">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminPortal();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 text-[#111111] dark:text-[#FBBF24] border border-[#FBBF24]/40 text-xs font-black transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#F59E0B] shrink-0" />
                      <span>ADMIN PORTAL SIGN IN</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
