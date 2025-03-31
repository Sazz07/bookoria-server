import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';
import AppError from '../../errors/AppError';

const register = catchAsync(async (req, res) => {
  const result = await authService.userRegister(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: { accessToken },
  });
});

const userLogin = catchAsync(async (req, res) => {
  const result = await authService.userLogin(req.body);

  const { accessToken, refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: { accessToken },
  });
});

const userLogout = catchAsync(async (req, res) => {
  res.clearCookie('refreshToken');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully',
  });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const result = await authService.refreshToken(req.cookies?.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  await authService.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset link sent successfully',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  await authService.resetPassword(req.body, token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
  });
});

export const AuthController = {
  register,
  userLogin,
  userLogout,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
