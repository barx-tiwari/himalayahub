import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);
const password = z.string().min(1, 'Enter your password.').max(128);

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email,
  password: z.string().min(10, 'Use at least 10 characters.').max(128),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue.' }) }),
});
export const loginSchema = z.object({ email, password });
export const tokenSchema = z.object({ token: z.string().min(20).max(100) });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(20).max(100), password: z.string().min(10).max(128) });
export const changePasswordSchema = z.object({ currentPassword: password, newPassword: z.string().min(10).max(128) });

export const otpSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code from the email.') });
