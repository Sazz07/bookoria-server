import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';

const router = express.Router();

router.get('/verify', auth(USER_ROLE.USER), OrderController.verifyPayment);

router.post(
  '/create-order',
  auth(USER_ROLE.USER),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrder,
);

router.get('/my-orders', auth(USER_ROLE.USER), OrderController.getOrdersByUser);

router.get('/', auth(USER_ROLE.ADMIN), OrderController.getAllOrders);

router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  OrderController.getOrderById,
);

router.patch(
  '/:id/status',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(OrderValidation.updateOrderStatusValidationSchema),
  OrderController.updateOrderStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  OrderController.deleteOrder,
);

export const OrderRoutes = router;
