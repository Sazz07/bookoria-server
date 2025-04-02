import { TRegister } from '../modules/auth/auth.interface';
import { USER_ROLE } from '../modules/user/user.constant';
import { User } from '../modules/user/user.model';

const admin: TRegister = {
  name: {
    firstName: 'Admin',
    middleName: '',
    lastName: 'Bookoria',
  },
  email: 'admin@bookoria.com',
  password: 'Admin123!',
  role: USER_ROLE.ADMIN,
};

const seedAdmin = async () => {
  const isAdminExits = await User.findOne({ role: USER_ROLE.ADMIN });

  if (!isAdminExits) {
    await User.create(admin);
  }
};

export default seedAdmin;
