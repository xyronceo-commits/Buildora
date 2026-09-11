import React, { useState, useEffect } from 'react';
import { Mail, AlertTriangle, RefreshCw, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { currentUser, checkEmailVerification, sendVerificationEmail } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Do not show banner for unauthenticated users, verified users, or admins
  useEffect(() => {
    if (!currentUser || currentUser.emailVerified || currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'buildsafe247@gmail.com') return;

    const silentCheck = async () => {
      try {
        await checkEmailVerification();
      } catch (e) {
        // ignore background errors
      }
    };

    // Check when window regains focus (e.g. user returns from email client)
    const handleFocus = () => {
      silentCheck();
    };

    window.addEventListener('focus', handleFocus);
    const interval = setInterval(silentCheck, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [currentUser, checkEmailVerification]);

  if (!currentUser || currentUser.emailVerified || currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'buildsafe247@gmail.com') {
    return null;
  }

  const handleManualCheck = async () => {
    setChecking(true);
    setStatusMessage(null);
    setIsError(false);
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setStatusMessage('Email confirmed successfully!');
      } else {
        setIsError(true);
        setStatusMessage('Email not confirmed yet. Please check your inbox/SPAM or click Resend Link.');
      }
    } catch (e) {
      setIsError(true);
      setStatusMessage('Unable to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setStatusMessage(null);
    setIsError(false);
    try {
      await sendVerificationEmail();
      setStatusMessage('New verification link sent! Please check your Inbox and SPAM folder.');
    } catch (e) {
      setIsError(true);
      setStatusMessage('Failed to resend email. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#FBBF24]/15 dark:bg-[#1F2937] border-b border-[#FBBF24]/40 dark:border-[#374151] px-4 py-3 text-xs font-medium relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-[#FBBF24]/30 text-[#111111] dark:text-[#FBBF24] rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Mail className="h-4 w-4 animate-pulse text-[#111111] dark:text-[#FBBF24]" />
          </div>
          <div>
            <div className="font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
              <span>EMAIL NOT CONFIRMED YET</span>
              <span className="text-[10px] bg-[#FBBF24] text-[#111111] font-black px-2 py-0.5 rounded uppercase">
                ACTION REQUIRED
              </span>
            </div>
            <p className="text-[#6B7280] dark:text-slate-300 text-[11px] mt-0.5">
              Verification link sent to <strong className="text-[#111111] dark:text-[#FBBF24]">{currentUser.email}</strong>. Check your <strong className="text-[#111111] dark:text-white underline uppercase">Inbox & SPAM folder</strong>. The system will detect confirmation automatically once clicked.
            </p>
            {statusMessage && (
              <div className={`mt-1.5 text-[11px] font-bold flex items-center gap-1 ${isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isError ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#111111] dark:text-slate-200 border border-[#E5E5E5] dark:border-slate-700 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#F59E0B] ${checking ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111111] font-black text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs uppercase cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-[#111111]" />
            <span>Resend Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
