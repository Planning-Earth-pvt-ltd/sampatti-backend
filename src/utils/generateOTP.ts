const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const saveOTP = (email: string, otp: string, ttlMinutes = 10) => {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  otpStore.set(email, { otp, expiresAt });
};

export const verifyStoredOTP = (email: string, inputOtp: string): boolean => {
  const entry = otpStore.get(email);
  if (!entry) return false;
  const { otp, expiresAt } = entry;
  const isValid = otp === inputOtp && Date.now() < expiresAt;
  if (isValid) otpStore.delete(email); // Remove after successful match
  return isValid;
};