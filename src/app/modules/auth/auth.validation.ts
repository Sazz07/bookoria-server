import { z } from 'zod';

const loginValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(32, 'Password must be at most 32 characters long'),
  }),
});

const registerValidation = z.object({
  body: z.object({
    name: z.object({
      firstName: z
        .string({ required_error: 'First name is required' })
        .trim()
        .min(3, 'First name must be at least 3 characters long')
        .max(30, 'First name cannot be more than 30 characters'),
      middleName: z
        .string()
        .trim()
        .max(30, 'Middle name cannot be more than 30 characters')
        .optional(),
      lastName: z
        .string({ required_error: 'Last name is required' })
        .trim()
        .max(30, 'Last name cannot be more than 30 characters'),
    }),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long')
      .max(32, 'Password must be at most 32 characters long'),
  }),
  image: z.string().optional(),
});

const updateValidation = z.object({
  body: z.object({
    name: z.object({
      firstName: z
        .string({ required_error: 'First name is required' })
        .trim()
        .min(3, 'First name must be at least 3 characters long')
        .max(30, 'First name cannot be more than 30 characters'),
      middleName: z
        .string()
        .trim()
        .max(30, 'Middle name cannot be more than 30 characters')
        .optional(),
      lastName: z
        .string({ required_error: 'Last name is required' })
        .trim()
        .max(30, 'Last name cannot be more than 30 characters'),
    }),
    image: z.string().optional(),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    oldPassword: z
      .string({ required_error: 'Old password is required' })
      .min(6, 'Old password must be at least 6 characters long')
      .max(32, 'Old password must be at most 32 characters long'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters long')
      .max(32, 'New password must be at most 32 characters long'),
  }),
});

const resetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email format'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters long')
      .max(32, 'New password must be at most 32 characters long'),
  }),
});

const forgetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email format'),
  }),
});

const refreshTokenValidation = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

export const authValidation = {
  loginValidation,
  registerValidation,
  updateValidation,
  changePasswordValidation,
  resetPasswordValidation,
  forgetPasswordValidation,
  refreshTokenValidation,
};
