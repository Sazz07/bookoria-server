import { JwtPayload } from 'jsonwebtoken';
import { User } from './user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { TUser } from './user.interface';
import mongoose from 'mongoose';

const getMyProfile = async (user: JwtPayload) => {
  const result = await User.findOne({
    email: user.email,
    isBlocked: false,
  }).select('-isBlocked -createdAt -updatedAt -password');

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

  const result = await User.findByIdAndUpdate(
    userId,
    { ...payload },
    { new: true, runValidators: true },
  ).select('-password');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder
    .search(['name.firstName', 'name.lastName', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.select('-password');

  const meta = await queryBuilder.countTotal();

  return {
    meta,
    data: users,
  };
};

const getUserById = async (id: string) => {
  const user = await User.findById(id).select('-password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (id: string, payload: Pick<TUser, 'role'>) => {
  const result = await User.findByIdAndUpdate(
    id,
    { ...payload },
    { new: true, runValidators: true },
  ).select('-password');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const blockUser = async (targetUserId: string, adminId: string) => {
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (targetUser._id.toString() === adminId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot block yourself');
  }

  const result = await User.findByIdAndUpdate(
    targetUserId,
    { isBlocked: !targetUser.isBlocked },
    { new: true },
  ).select('-password');

  return result;
};

const deleteUser = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const result = await User.findByIdAndDelete(id);

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUser,
  blockUser,
  deleteUser,
};
