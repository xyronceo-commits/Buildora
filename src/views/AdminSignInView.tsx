import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSignInViewProps {
  onSuccess?: () => void;
  onReturnHome?: () => void;
  initialError?: string | null;
}

export const AdminSignInView: React.FC<AdminSignInViewProps> = ({
  onSuccess,
  onReturnHome,
  initialError,
}) => {
  const { signInWithGoogleAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogleAdmin();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error('Admin Google sign in error:', err);
      const errObj = err as { message?: string };
      const msg = errObj?.message || 'Authentication failed. Please sign in with the authorized Google account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#121418] border border-[#E5E5E5] dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FBBF24]" />

        {/* Top Navigation Back */}
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-slate-400 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer font-bold mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Main Portal
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center text-[#B45309] dark:text-[#FBBF24] shadow-xs">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h1 className="font-['Cabinet_Grotesk'] text-2xl sm:text-3xl font-black text-[#111111] dark:text-white tracking-tight">
              Constrora Admin
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Sign in with your authorized Google account to continue.
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs leading-relaxed animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-rose-700 dark:text-rose-300">Access Restricted</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Authentication Form Box */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#F7F7F5] hover:bg-slate-200 dark:bg-white dark:hover:bg-slate-100 text-[#111111] border border-[#E5E5E5] dark:border-transparent font-extrabold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span className="group-hover:scale-[1.01] transition-transform">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[#6B7280] dark:text-slate-500 leading-snug pt-2">
            Only authorized administrator accounts can access the Constrora control system. Unauthorized access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};
