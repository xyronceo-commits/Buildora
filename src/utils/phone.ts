/**
 * Clean and normalize phone numbers for WhatsApp integration (e.g., Nigerian format).
 * Converts "08012345678" -> "2348012345678", "+234 801 234 5678" -> "2348012345678"
 */
export function normalizePhoneForWhatsApp(phone: string | undefined | null): string {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  
  // Handle Nigerian local format starting with '0'
  if (clean.startsWith('0')) {
    clean = '234' + clean.substring(1);
  }
  // If 10 digits without leading zero (e.g. 8031234567)
  if (!clean.startsWith('234') && clean.length === 10) {
    clean = '234' + clean;
  }
  return clean;
}

/**
 * Format phone for tel: link
 */
export function formatPhoneForCall(phone: string | undefined | null): string {
  if (!phone) return '';
  return String(phone).trim();
}
