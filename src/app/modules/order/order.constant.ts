export const paymentMethod = [
  'Credit Card',
  'Debit Card',
  'Mobile Banking',
  'Cash On Delivery',
] as const;

export const paymentStatus = ['Pending', 'Completed', 'Failed'] as const;

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const orderStatus = Object.values(ORDER_STATUS);
