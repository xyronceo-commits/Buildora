import React from 'react';
import { ShieldCheck, Clock, ShieldAlert, Building } from 'lucide-react';
import { VerificationStatus } from '../types';
import { normalizeVerificationStatus } from '../utils/verification';

interface VerificationBadgeProps {
  status?: VerificationStatus | string | boolean | null;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const normStatus = normalizeVerificationStatus(status);

  if (normStatus === 'VERIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold rounded ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <ShieldCheck className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>✓ VERIFIED SUPPLIER</span>
      </span>
    );
  }

  if (normStatus === 'VERIFICATION_PENDING') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>VERIFICATION PENDING</span>
      </span>
    );
  }

  if (normStatus === 'REJECTED') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <ShieldAlert className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>REJECTED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-slate-800 text-slate-300 font-medium rounded ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Building className={size === 'sm' ? 'h-3 w-3 text-slate-400' : 'h-4 w-4 text-slate-400'} />
      <span>LISTED SUPPLIER</span>
    </span>
  );
};
