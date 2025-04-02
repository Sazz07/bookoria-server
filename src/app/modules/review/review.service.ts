import httpStatus from 'http-status';
import { TReview } from './review.interface';
import { Book } from '../book/book.model';
import AppError from '../../errors/AppError';
import { Review } from './review.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';

const createReview = async (userId: string, payload: TReview) => {
  // Check if user exists and is not deleted
  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const book = await Book.findById(payload.book);
  if (!book) {
    throw new AppError(httpStatus.NOT_FOUND, 'Book not found');
  }

  // Check if user has already reviewed this book
  const existingReview = await Review.findOne({
    user: userId,
    book: payload.book,
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already reviewed this book',
    );
  }

  payload.user = new mongoose.Types.ObjectId(userId);

  const result = await Review.create(payload);
  return result;
};

const getReviewsByBook = async (
  bookId: string,
  query: Record<string, unknown>,
) => {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError(httpStatus.NOT_FOUND, 'Book not found');
  }

  const reviewQuery = new QueryBuilder(
    Review.find({ book: bookId }).populate('user', 'name image'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getReviewsByUser = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ user: userId }).populate('book', 'title author coverImage'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    data,
  };
};

const updateReview = async (
  userId: string,
  reviewId: string,
  payload: Partial<TReview>,
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Check if the review belongs to the user
  if (review.user?.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this review',
    );
  }

  const result = await Review.findByIdAndUpdate(reviewId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteReview = async (userId: string, reviewId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (review.user?.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this review',
    );
  }

  const result = await Review.findByIdAndDelete(reviewId);
  return result;
};

export const ReviewService = {
  createReview,
  getReviewsByBook,
  getReviewsByUser,
  updateReview,
  deleteReview,
};
