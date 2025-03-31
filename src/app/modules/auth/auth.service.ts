import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { User } from '../user/user.model';
import {
  TLogin,
  TJwtPayload,
  TRegister,
  TChangePassword,
} from './auth.interface';
import AppError from '../../errors/AppError';
import { USER_ROLE } from '../user/user.constant';
import { createToken, verifyToken } from './auth.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';

const userRegister = async (payload: TRegister) => {
  const isUserExist = await User.isUserExist(payload.email);

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const user = await User.create({ ...payload, role: USER_ROLE.USER });
  const JwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    JwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    JwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken };
};

const userLogin = async (payload: TLogin) => {
  const user = await User.isUserExist(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password not matched');
  }

  const JwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    JwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    JwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return { accessToken, refreshToken };
};

const changePassword = async (
  userData: JwtPayload,
  payload: TChangePassword,
) => {
  const user = await User.isUserExist(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.oldPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password not matched');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findByIdAndUpdate(user._id, {
    password: hashedNewPassword,
    passwordChangedAt: new Date(),
  });

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, email, role } = decoded;

  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTissuedBeforePasswordChange(
      user.passwordChangedAt,
      decoded.iat as number,
    )
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Password changed after token issue',
    );
  }

  const JwtPayload: TJwtPayload = {
    userId,
    email,
    role,
  };

  const accessToken = createToken(
    JwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken };
};

const forgetPassword = async (email: string) => {
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const JwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    JwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );
  const resetUILink = `${config.reset_pass_ui_link}?id=${user._id}&token=${resetToken} `;

  return { resetUILink };
};

const resetPassword = async (
  payload: {
    email: string;
    newPassword: string;
  },
  token: string,
) => {
  const user = await User.isUserExist(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isBlocked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is blocked');
  }

  const decoded = verifyToken(
    token,
    config.jwt_access_secret as string,
  ) as TJwtPayload;

  if (decoded.email !== payload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findByIdAndUpdate(decoded.userId, {
    password: hashedNewPassword,
    passwordChangedAt: new Date(),
  });
};

export const authService = {
  userRegister,
  userLogin,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
