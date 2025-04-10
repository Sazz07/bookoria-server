import mongoose from 'mongoose';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { TUserUpdatePayload } from './admin.interface';
import { USER_ROLE } from '../user/user.constant';

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find({ isDeleted: false }), query)
    .search(['email', 'name.firstName', 'name.lastName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery.select('-password');
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getUserById = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false }).select(
    '-password',
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (id: string, payload: TUserUpdatePayload) => {
  const user = await User.findOne({ _id: id, isDeleted: false });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { ...payload },
    { new: true, runValidators: true },
  ).select('-password');

  return result;
};

const blockUser = async (targetUserId: string, adminId: string) => {
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (targetUser._id?.toString() === adminId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You cannot block yourself');
  }

  const result = await User.findByIdAndUpdate(
    targetUserId,
    { isBlocked: !targetUser.isBlocked },
    { new: true, runValidators: true },
  ).select('-password');

  return result;
};

const deleteUser = async (id: string, adminId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User is already deleted');
    }

    if (user._id.toString() === adminId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You cannot delete yourself');
    }

    if (user.role === USER_ROLE.ADMIN) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Admin cannot delete another admin',
      );
    }

    const result = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, runValidators: true },
    ).select('-password');

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const AdminService = {
  getAllUsers,
  getUserById,
  updateUser,
  blockUser,
  deleteUser,
};
