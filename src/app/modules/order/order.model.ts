import { Schema, model } from 'mongoose';
import {
  TOrder,
  TOrderItem,
  TPaymentInfo,
  TShippingAddress,
} from './order.interface';
import { orderStatus, paymentMethod, paymentStatus } from './order.constant';

const orderItemSchema = new Schema<TOrderItem>({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const shippingAddressSchema = new Schema<TShippingAddress>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
});

const paymentInfoSchema = new Schema<TPaymentInfo>({
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: [...paymentMethod],
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: [...paymentStatus],
    default: 'Pending',
  },
  paidAt: {
    type: Date,
  },
});

const orderSchema = new Schema<TOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    orderItems: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items: TOrderItem[]) {
          return items.length > 0;
        },
        message: 'At least one order item is required',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    paymentInfo: {
      type: paymentInfoSchema,
      required: [true, 'Payment information is required'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    shippingCost: {
      type: Number,
      required: [true, 'Shipping cost is required'],
      min: [0, 'Shipping cost cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
      min: [0, 'Tax cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Order status is required'],
      enum: [...orderStatus],
      default: 'Pending',
    },
    notes: {
      type: String,
    },
    deliveredAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
);

// Query middleware to exclude deleted orders
orderSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

orderSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Order = model<TOrder>('Order', orderSchema);
