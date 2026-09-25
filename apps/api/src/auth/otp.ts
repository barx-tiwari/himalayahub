import { randomInt } from 'node:crypto';
import { hashToken } from './tokens.js';

/** 6-digit one-time code from a CSPRNG (uniform, leading zeros kept). */
export const newOtp = () => String(randomInt(0, 1_000_000)).padStart(6, '0');
/** Stored like every other token: only a hash, bound to the user id so codes never collide across users. */
export const otpHash = (userId: string, code: string) => hashToken(`otp:v1:${userId}:${code}`);
