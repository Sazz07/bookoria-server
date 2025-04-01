import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Book } from '../book/book.model';
import { TOrder, TOrderStatus } from './order.interface';
import { Order } from './order.model';
import { ORDER_STATUS } from './order.constant';

const createOrder = async (userId: string, payload: TOrder) => {
  // Ensure user can only order for themselves
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
    // Set the user ID
    payload.user = new mongoose.Types.ObjectId(userId);

    // Check if all books exist and have enough stock
    for (const item of payload.orderItems) {
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

      // Validate price matches the book price
      if (item.price !== book.price) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid price for book: ${book.title}. Expected: ${book.price}`,
        );
      }

      // Update book stock
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    // Create the order
    const result = await Order.create([payload], { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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
};
