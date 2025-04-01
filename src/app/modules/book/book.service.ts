import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TBook } from './book.interface';
import { Book } from './book.model';

const createBook = async (payload: TBook) => {
  const result = await Book.create(payload);
  return result;
};

const createBulkBooks = async (payload: TBook[]) => {
  const result = await Book.insertMany(payload);
  return result;
};

const getAllBooks = async (query: Record<string, unknown>) => {
  const bookQuery = new QueryBuilder(Book.find(), query)
    .search(['title', 'author', 'genre'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await bookQuery.modelQuery;
  const meta = await bookQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getBookById = async (id: string) => {
  const result = await Book.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (result.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'Book is already deleted');
  }

  return result;
};

const updateBook = async (id: string, payload: Partial<TBook>) => {
  const isBookExist = await Book.findById(id);

  if (!isBookExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (isBookExist.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'Book is already deleted');
  }

  const result = await Book.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteBook = async (id: string) => {
  const isBookExist = await Book.findById(id);

  if (!isBookExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (isBookExist.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'Book is already deleted');
  }

  const result = await Book.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  return result;
};

export const BookService = {
  createBook,
  createBulkBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
