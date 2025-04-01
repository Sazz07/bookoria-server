import { z } from 'zod';
import { orderStatus, paymentMethod, paymentStatus } from './order.constant';

const orderItemValidationSchema = z.object({
  book: z.string({
    required_error: 'Book ID is required',
  }),
  price: z
    .number({
      required_error: 'Book price is required',
    })
    .min(0, 'Price cannot be negative'),
  quantity: z
    .number({
      required_error: 'Quantity is required',
    })
    .min(1, 'Quantity must be at least 1'),
  discount: z.number().min(0).max(100).optional(),
});

const shippingAddressValidationSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
  }),
  address: z.string({
    required_error: 'Address is required',
  }),
  city: z.string({
    required_error: 'City is required',
  }),
  postalCode: z.string({
    required_error: 'Postal code is required',
  }),
  country: z.string({
    required_error: 'Country is required',
  }),
  phone: z.string({
    required_error: 'Phone number is required',
  }),
});

const paymentInfoValidationSchema = z.object({
  method: z.enum([...paymentMethod], {
    required_error: 'Payment method is required',
  }),
  transactionId: z.string().optional(),
  status: z.enum([...paymentStatus]).default('Pending'),
  paidAt: z.string().optional(),
});

const createOrderValidationSchema = z.object({
  body: z.object({
    orderItems: z
      .array(orderItemValidationSchema, {
        required_error: 'Order items are required',
      })
      .min(1, 'At least one order item is required'),
    shippingAddress: shippingAddressValidationSchema,
    paymentInfo: paymentInfoValidationSchema,
    subtotal: z
      .number({
        required_error: 'Subtotal is required',
      })
      .min(0, 'Subtotal cannot be negative'),
    shippingCost: z
      .number({
        required_error: 'Shipping cost is required',
      })
      .min(0, 'Shipping cost cannot be negative'),
    tax: z
      .number({
        required_error: 'Tax is required',
      })
      .min(0, 'Tax cannot be negative'),
    total: z
      .number({
        required_error: 'Total is required',
      })
      .min(0, 'Total cannot be negative'),
    notes: z.string().optional(),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...orderStatus], {
      required_error: 'Order status is required',
    }),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
};
