import mongoose, { model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import { USER_ROLE, userRole } from './user.constant';
import bcrypt from 'bcrypt';
import config from '../../config';

const UserSchema = new mongoose.Schema<TUser, UserModel>(
  {
    name: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [30, 'First name cannot be more than 30 characters'],
      },
      middleName: {
        type: String,
        trim: true,
        maxlength: [30, 'Middle name cannot be more than 30 characters'],
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [30, 'Last name cannot be more than 30 characters'],
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: userRole,
      default: USER_ROLE.USER,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

// Remove password from response
UserSchema.post('save', async function (doc, next) {
  doc.password = '';
  next();
});

// virtual fullName
UserSchema.virtual('fullName').get(function () {
  return `${this.name?.firstName} ${this.name?.middleName} ${this.name?.lastName}`;
});

// Check user exist
UserSchema.methods.isUserExist = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

// Check password
UserSchema.methods.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', UserSchema);
