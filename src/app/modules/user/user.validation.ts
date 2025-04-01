import { z } from 'zod';
import { userRole } from './user.constant';

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z
      .object({
        firstName: z
          .string()
          .max(30, 'First name cannot be more than 30 characters')
          .optional(),
        middleName: z
          .string()
          .max(30, 'Middle name cannot be more than 30 characters')
          .optional(),
        lastName: z
          .string()
          .max(30, 'Last name cannot be more than 30 characters')
          .optional(),
      })
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    image: z.string().optional(),
    role: z.enum(userRole as [string, ...string[]]).optional(),
  }),
});

export const UserValidation = {
  updateUserValidationSchema,
};
