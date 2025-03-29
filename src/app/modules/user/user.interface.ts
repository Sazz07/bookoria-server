/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUserName = {
  firstName: string;
  middleName: string;
  lastName: string;
};

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type TUser = {
  id: string;
  name: TUserName;
  email: string;
  password: string;
  image?: string;
  role: TUserRole;
  isBlocked?: boolean;
  passwordChangedAt?: Date;
};

export interface UserModel extends Model<TUser> {
  isUserExist: (email: string) => Promise<TUser | null>;

  isPasswordMatched: (
    plainTextPassword: string,
    hashedPassword: string,
  ) => Promise<boolean>;

  isJWTissuedBeforePasswordChange: (
    passwordChangedAt: Date,
    jwtIssuedTimestamp: number,
  ) => boolean;
}
