import express from 'express';
import { BookController } from './book.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BookValidation } from './book.validation';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN),
  validateRequest(BookValidation.createBookValidationSchema),
  BookController.createBook,
);

router.post('/bulk', auth(USER_ROLE.ADMIN), BookController.createBulkBooks);

router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getBookById);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(BookValidation.updateBookValidationSchema),
  BookController.updateBook,
);

router.delete('/:id', auth(USER_ROLE.ADMIN), BookController.deleteBook);

export const BookRoutes = router;
