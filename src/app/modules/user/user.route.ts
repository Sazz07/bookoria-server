import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

// User routes (accessible by both user and admin)
router.get(
  '/my-profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserController.getMyProfile,
);

router.patch(
  '/my-profile',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateMyProfile,
);

// Admin only routes
router.get('/', auth(USER_ROLE.ADMIN), UserController.getAllUsers);
router.get('/:id', auth(USER_ROLE.ADMIN), UserController.getUserById);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser,
);

router.patch('/:id/block', auth(USER_ROLE.ADMIN), UserController.blockUser);
router.delete('/:id', auth(USER_ROLE.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
