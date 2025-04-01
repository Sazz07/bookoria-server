import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookService } from './book.service';

const createBook = catchAsync(async (req, res) => {
  const result = await BookService.createBook(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Book created successfully',
    data: result,
  });
});

const createBulkBooks = catchAsync(async (req, res) => {
  const result = await BookService.createBulkBooks(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Books created successfully',
    data: result,
  });
});

const getAllBooks = catchAsync(async (req, res) => {
  const result = await BookService.getAllBooks(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Books retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getBookById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookService.getBookById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book retrieved successfully',
    data: result,
  });
});

const updateBook = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookService.updateBook(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book updated successfully',
    data: result,
  });
});

const deleteBook = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookService.deleteBook(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book deleted successfully',
    data: result,
  });
});

export const BookController = {
  createBook,
  createBulkBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
