import { z } from 'zod';

export const registrationSchema = z.object({
  email: z
    .email('Invalid email address')
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters long')
    .max(50, 'Display name must be at most 50 characters long')
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
