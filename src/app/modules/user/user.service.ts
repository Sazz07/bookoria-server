import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import { User } from './user.model';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';

const getMyProfile = async (user: JwtPayload) => {
  const result = await User.findOne({
    email: user.email,
    isBlocked: false,
    isDeleted: false,
  }).select('-isBlocked -isDeleted -createdAt -updatedAt -password');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const updateMyProfile = async (userId: string, payload: Partial<TUser>) => {
  if (payload.role) {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot update your role');
  }

  if (payload.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please use the change password endpoint',
    );
  }

  const user = await User.findOne({ _id: userId, isDeleted: false });
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { ...payload },
    { new: true, runValidators: true },
  ).select('-password');

  return result;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
};
