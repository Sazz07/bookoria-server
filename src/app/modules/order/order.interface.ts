import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';
import { orderStatus, paymentMethod, paymentStatus } from './order.constant';

export type TOrderItem = {
  book: Types.ObjectId;
  price: number;
  quantity: number;
  discount?: number;
};

export type TShippingAddress = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type TPaymentMethod = (typeof paymentMethod)[number];
export type TPaymentStatus = (typeof paymentStatus)[number];

export type TPaymentInfo = {
  method: TPaymentMethod;
  transactionId?: string;
  status: TPaymentStatus;
  paidAt?: Date;
};

export type TOrderStatus = (typeof orderStatus)[number];

export type TOrder = {
  _id?: string;
  user: Types.ObjectId | TUser;
  orderItems: TOrderItem[];
  shippingAddress: TShippingAddress;
  paymentInfo: TPaymentInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: TOrderStatus;
  notes?: string;
  deliveredAt?: Date;
  isDeleted?: boolean;
};
