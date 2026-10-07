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
 className={`inline-flex items-center gap-1 bg-[#FBBF24]/15 border border-[#FBBF24]/50 text-[#F59E0B] dark:text-[#FBBF24] font-black rounded-lg ${
 size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
 }`}
 >
 <ShieldCheck className={size === 'sm' ? 'h-3.5 w-3.5 text-[#F59E0B]' : 'h-4 w-4 text-[#F59E0B]'} />
 <span>✓ VERIFIED SUPPLIER</span>
 </span>
 );
 }

 if (normStatus === 'VERIFICATION_PENDING') {
 return (
 <span
 className={`inline-flex items-center gap-1 bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#F59E0B] dark:text-[#FBBF24] font-bold rounded-lg ${
 size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
 }`}
 >
 <Clock className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
 <span>VERIFICATION PENDING</span>
 </span>
 );
 }

 if (normStatus === 'REJECTED') {
 return (
 <span
 className={`inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold rounded-lg ${
 size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
 }`}
 >
 <ShieldAlert className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
 <span>REJECTED</span>
 </span>
 );
 }

 return (
 <span
 className={`inline-flex items-center gap-1 bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] text-zinc-600 dark:text-zinc-400 font-bold rounded-lg ${
 size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
 }`}
 >
 <Building className={size === 'sm' ? 'h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400' : 'h-4 w-4 text-zinc-600 dark:text-zinc-400'} />
 <span>LISTED SUPPLIER</span>
 </span>
 );
};
