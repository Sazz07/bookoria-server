import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    book: z.string({
      required_error: 'Book ID is required',
    }),
    rating: z.number({
      required_error: 'Rating is required',
    }).min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5'),
    comment: z.string({
      required_error: 'Review comment is required',
    }).min(3, 'Comment must be at least 3 characters long'),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z.number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot be more than 5')
      .optional(),
    comment: z.string()
      .min(3, 'Comment must be at least 3 characters long')
      .optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};