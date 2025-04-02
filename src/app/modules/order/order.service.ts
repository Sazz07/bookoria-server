import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { TOrder, TOrderStatus } from './order.interface';
import { Order } from './order.model';
import { Book } from '../book/book.model';
import AppError from '../../errors/AppError';
import { ORDER_STATUS } from './order.constant';
import { orderUtils } from './order.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';

const createOrder = async (
  user: JwtPayload,
  payload: Partial<TOrder>,
  clientIp: string,
) => {
  const { userId, email } = user;
  if (payload.user && payload.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to create order for another user',
    );
  }

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payload.user = userId;

    let subtotal = 0;
    const enrichedOrderItems = [];

    // Check if all books exist and have enough stock
    for (const item of payload.orderItems || []) {
      const book = await Book.findById(item.book);

      if (!book) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Book with ID ${item.book} not found`,
        );
      }

      if (book.stock < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Not enough stock for book: ${book.title}. Available: ${book.stock}`,
        );
      }
      const price = book.price;

      // Calculate item total with discount
      const discount = item.discount || 0;
      const itemTotal = price * item.quantity * (1 - discount / 100);
      subtotal += itemTotal;

      // Add price to order item
      enrichedOrderItems.push({
        ...item,
        price,
      });

      // Update book stock
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    // Replace order items with enriched ones
    payload.orderItems = enrichedOrderItems;

    // Calculate tax and total
    const shippingCost = payload.shippingCost || 0;
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + shippingCost + tax;

    payload.subtotal = subtotal;
    payload.tax = tax;
    payload.total = total;
    payload.status = ORDER_STATUS.PENDING;

    const order = await Order.create([payload], { session });
    const createdOrder = order[0];

    if (payload.paymentInfo?.method !== 'Cash On Delivery') {
      try {
        const paymentPayload = {
          amount: total,
          order_id: createdOrder._id.toString(),
          currency: 'BDT',
          customer_name: payload.shippingAddress?.name || '',
          customer_address: payload.shippingAddress?.address || '',
          customer_phone: payload.shippingAddress?.phone || '',
          customer_city: payload.shippingAddress?.city || '',
          customer_email: email,
          client_ip: clientIp,
        };

        // Make payment
        const payment = await orderUtils.makePaymentAsync(paymentPayload);

        if (payment?.sp_order_id) {
          await Order.findByIdAndUpdate(
            createdOrder._id,
            {
              transaction: {
                id: payment.sp_order_id,
                transactionStatus: payment.transactionStatus,
              },
            },
            { session },
          );
        }

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return {
          order: createdOrder,
          paymentUrl: payment.checkout_url,
        };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }
    await session.commitTransaction();
    session.endSession();

    return { order: createdOrder };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const verifyPayment = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (!order.transaction?.id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No transaction found for this order',
    );
  }

  const verifiedPayment = await orderUtils.verifyPaymentAsync(
    order.transaction.id,
  );

  if (verifiedPayment.length) {
    const paymentData = verifiedPayment[0];

    // Update order with payment verification details
    await Order.findByIdAndUpdate(orderId, {
      'transaction.bank_status': paymentData.bank_status,
      'transaction.sp_code': paymentData.sp_code.toString(),
      'transaction.sp_message': paymentData.sp_message,
      'transaction.transactionStatus': paymentData.transaction_status,
      'transaction.method': paymentData.method,
      'transaction.date_time': paymentData.date_time,
      status:
        paymentData.bank_status === 'Success'
          ? ORDER_STATUS.PROCESSING
          : paymentData.bank_status === 'Failed'
            ? ORDER_STATUS.PENDING
            : paymentData.bank_status === 'Cancel'
              ? ORDER_STATUS.CANCELLED
              : order.status,
      'paymentInfo.status':
        paymentData.bank_status === 'Success'
          ? 'Completed'
          : paymentData.bank_status === 'Failed'
            ? 'Failed'
            : 'Pending',
      'paymentInfo.paidAt':
        paymentData.bank_status === 'Success' ? new Date() : undefined,
    });
  }

  return verifiedPayment;
};

const getAllOrders = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(
    Order.find().populate('user', 'name email'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getOrdersByUser = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const orderQuery = new QueryBuilder(Order.find({ user: userId }), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getOrderById = async (id: string, userId?: string) => {
  const result = await Order.findById(id).populate('user', 'name email');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Check if user is authorized to view this order
  if (userId && result.user._id.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to view this order',
    );
  }

  return result;
};

const updateOrderStatus = async (
  id: string,
  status: TOrderStatus,
  userId?: string,
) => {
  const isOrderExist = await Order.findById(id);

  if (!isOrderExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Only allow users to cancel their own orders
  if (userId && isOrderExist.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to modify this order',
    );
  }

  // If user is not admin, they can only cancel orders
  if (userId && status !== ORDER_STATUS.CANCELLED) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only cancel orders');
  }

  // check if order is already delivered
  if (
    isOrderExist.status === ORDER_STATUS.DELIVERED &&
    status === ORDER_STATUS.CANCELLED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot cancel an order that has already been delivered or cancelled',
    );
  }

  const updateData = {
    status,
    ...(status === ORDER_STATUS.DELIVERED ? { deliveredAt: new Date() } : {}),
  };

  // If order is being cancelled and was not already cancelled, restore stock
  if (
    status === ORDER_STATUS.CANCELLED &&
    isOrderExist.status !== ORDER_STATUS.CANCELLED
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Restore stock for each book
      for (const item of isOrderExist.orderItems) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { stock: item.quantity } },
          { session },
        );
      }

      // Update order status
      const result = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        session,
      });

      await session.commitTransaction();
      session.endSession();

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  // For other status updates
  const result = await Order.findByIdAndUpdate(id, updateData, { new: true });
  return result;
};

const deleteOrder = async (id: string, userId?: string) => {
  const isOrderExist = await Order.findById(id);

  if (!isOrderExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Check if user is authorized to delete this order
  if (userId && isOrderExist.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this order',
    );
  }

  const result = await Order.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  verifyPayment,
};
