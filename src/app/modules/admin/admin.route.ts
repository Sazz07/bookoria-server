import express from 'express';
import { AdminController } from './admin.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from '../user/user.validation';

const router = express.Router();

// Admin User Management Routes
router.get('/', auth(USER_ROLE.ADMIN), AdminController.getAllUsers);
router.get('/:id', auth(USER_ROLE.ADMIN), AdminController.getUserById);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  AdminController.updateUser,
);

router.patch('/:id/block', auth(USER_ROLE.ADMIN), AdminController.blockUser);
router.delete('/:id', auth(USER_ROLE.ADMIN), AdminController.deleteUser);

export const AdminRoutes = router;
