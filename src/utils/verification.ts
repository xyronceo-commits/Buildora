import { VerificationStatus } from '../types';

/**
 * Single source of truth for normalizing business and supplier verification status values.
 * Handles strings like "VERIFIED", "verified", "Approved", "VERIFICATION_PENDING", "PENDING", true, etc.
 */
export function normalizeVerificationStatus(status: unknown, isVerified?: boolean): VerificationStatus {
  if (isVerified === true) {
    return 'VERIFIED';
  }
  if (status === null || status === undefined) {
    return 'LISTED';
  }
  if (status === true) {
    return 'VERIFIED';
  }
  const str = String(status).trim().toUpperCase();
  if (str === 'VERIFIED' || str === 'APPROVED' || str === 'CONFIRMED') {
    return 'VERIFIED';
  }
  if (str === 'VERIFICATION_PENDING' || str === 'PENDING' || str === 'UNDER_REVIEW') {
    return 'VERIFICATION_PENDING';
  }
  if (str === 'REJECTED' || str === 'DECLINED' || str === 'DENIED') {
    return 'REJECTED';
  }
  return 'LISTED';
}
