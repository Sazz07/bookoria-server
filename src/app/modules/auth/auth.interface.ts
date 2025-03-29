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
