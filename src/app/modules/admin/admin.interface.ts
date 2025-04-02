import { TUser } from '../user/user.interface';

export type TUserUpdatePayload = Pick<TUser, 'role'>;
