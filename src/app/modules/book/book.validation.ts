import { z } from 'zod';
import { bookFormat, bookGenres } from './book.constant';

const createBookValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    author: z.string({
      required_error: 'Author is required',
    }),
    genre: z.enum([...bookGenres] as [string, ...string[]], {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be a valid book genre',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    price: z
      .number({
        required_error: 'Price is required',
      })
      .min(0, 'Price cannot be negative'),
    stock: z
      .number({
        required_error: 'Stock is required',
      })
      .min(0, 'Stock cannot be negative'),
    publicationDate: z.string().optional(),
    publisher: z.string().optional(),
    isbn: z.string().optional(),
    language: z.string().optional(),
    pageCount: z.number().min(1, 'Page count must be at least 1').optional(),
    coverImage: z.string().optional(),
    format: z.enum(bookFormat).optional(),
    rating: z.number().min(0).max(5).optional(),
    featured: z.boolean().optional(),
    discount: z.number().min(0).max(100).optional(),
  }),
});

const updateBookValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.enum([...bookGenres] as [string, ...string[]]).optional(),
    description: z.string().optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    stock: z.number().min(0, 'Stock cannot be negative').optional(),
    publicationDate: z.string().optional(),
    publisher: z.string().optional(),
    isbn: z.string().optional(),
    language: z.string().optional(),
    pageCount: z.number().min(1, 'Page count must be at least 1').optional(),
    coverImage: z.string().optional(),
    format: z
      .enum(['Hardcover', 'Paperback', 'E-book', 'Audiobook'])
      .optional(),
    rating: z.number().min(0).max(5).optional(),
    featured: z.boolean().optional(),
    discount: z.number().min(0).max(100).optional(),
  }),
});

export const BookValidation = {
  createBookValidationSchema,
  updateBookValidationSchema,
};
