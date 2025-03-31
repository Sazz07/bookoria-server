import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/register',
  validateRequest(authValidation.registerValidation),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(authValidation.loginValidation),
  AuthController.userLogin,
);

router.post('/logout', AuthController.userLogout);

router.post(
  '/change-password',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(authValidation.changePasswordValidation),
  AuthController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshTokenValidation),
  AuthController.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(authValidation.forgetPasswordValidation),
  AuthController.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPasswordValidation),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
