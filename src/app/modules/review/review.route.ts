import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

router.get('/book/:bookId', ReviewController.getReviewsByBook);

router.get(
  '/my-reviews',
  auth(USER_ROLE.USER),
  ReviewController.getReviewsByUser,
);

router.patch(
  '/:id',
  auth(USER_ROLE.USER),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview,
);

router.delete('/:id', auth(USER_ROLE.USER), ReviewController.deleteReview);

export const ReviewRoutes = router;
