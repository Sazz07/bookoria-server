import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { bookId } = req.params;
  const reviewData = {
    ...req.body,
    book: bookId,
  };

  const result = await ReviewService.createReview(userId, reviewData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getReviewsByBook = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  const result = await ReviewService.getReviewsByBook(bookId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getReviewsByUser = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await ReviewService.getReviewsByUser(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await ReviewService.updateReview(userId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await ReviewService.deleteReview(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByBook,
  getReviewsByUser,
  updateReview,
  deleteReview,
};
