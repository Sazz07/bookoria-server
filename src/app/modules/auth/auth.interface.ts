import { TUserName, TUserRole } from '../user/user.interface';

export type TLogin = {
  email: string;
  password: string;
};

export type TRegister = {
  name: TUserName;
  email: string;
  password: string;
  image?: string;
  role?: TUserRole;
  isBlocked?: boolean;
  passwordChangedAt?: Date;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type TJwtPayload = {
  userId: string;
  email: string;
  role: TUserRole;
};
