export const paymentMethod = [
  'Credit Card',
  'Debit Card',
  'Mobile Banking',
  'Cash On Delivery',
] as const;

export const paymentStatus = ['Pending', 'Completed', 'Failed'] as const;

export const orderStatus = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;
