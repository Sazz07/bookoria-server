import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { OrderService } from './order.service';
import { USER_ROLE } from '../user/user.constant';

const createOrder = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await OrderService.createOrder(
    user,
    req.body,
    req.ip || '127.0.0.1',
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order placed successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getAllOrders(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getOrdersByUser = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await OrderService.getOrdersByUser(user.userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await OrderService.getOrderById(
    req.params.id,
    user.role === USER_ROLE.USER ? user.userId : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await OrderService.updateOrderStatus(
    req.params.id,
    req.body.status,
    user.role === USER_ROLE.USER ? user.userId : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await OrderService.deleteOrder(
    req.params.id,
    user.role === USER_ROLE.USER ? user.userId : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const result = await OrderService.verifyPayment(req.query.order_id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment verified successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  verifyPayment,
};
