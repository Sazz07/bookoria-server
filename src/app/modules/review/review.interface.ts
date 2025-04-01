import { Model, Types } from 'mongoose';
import { TUser } from '../user/user.interface';
import { TBook } from '../book/book.interface';

export type TReview = {
  _id?: string;
  user: Types.ObjectId | TUser;
  book: Types.ObjectId | TBook;
  rating: number;
  comment: string;
};

export interface ReviewModel extends Model<TReview> {
  // eslint-disable-next-line no-unused-vars
  calculateAverageRating(bookId: Types.ObjectId): Promise<void>;
}
