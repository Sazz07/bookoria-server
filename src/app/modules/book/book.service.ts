import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TBook } from './book.interface';
import { Book } from './book.model';
import { Order } from '../order/order.model';

const createBook = async (payload: TBook) => {
  // Check if ISBN exists and is unique
  if (payload.isbn) {
    const existingBook = await Book.findOne({ isbn: payload.isbn });
    if (existingBook) {
      throw new AppError(
        httpStatus.CONFLICT,
        'A book with this ISBN already exists',
      );
    }
  }

  const result = await Book.create(payload);
  return result;
};

const createBulkBooks = async (payload: TBook[]) => {
  // Check for duplicate ISBNs within the payload
  const isbns = payload.filter((book) => book.isbn).map((book) => book.isbn);

  if (isbns.length !== new Set(isbns).size) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Duplicate ISBNs found in the payload',
    );
  }

  // Check for existing ISBNs in the database
  if (isbns.length > 0) {
    const existingBooks = await Book.find({ isbn: { $in: isbns } });
    if (existingBooks.length > 0) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Books with these ISBNs already exist: ${existingBooks
          .map((book) => book.isbn)
          .join(', ')}`,
      );
    }
  }

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

  // Check if stock is being updated to a lower value
  if (payload.stock !== undefined && payload.stock < isBookExist.stock) {
    // Check if there are pending orders for this book
    const pendingOrders = await Order.countDocuments({
      'orderItems.book': id,
      status: { $nin: ['Delivered', 'Cancelled'] },
      isDeleted: false,
    });
    //
    if (pendingOrders > 0 && payload.stock < pendingOrders) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot reduce stock below ${pendingOrders} as there are pending orders`,
      );
    }
  }

  // Check if ISBN is being updated and is unique
  if (payload.isbn && payload.isbn !== isBookExist.isbn) {
    const existingBook = await Book.findOne({ isbn: payload.isbn });
    if (existingBook) {
      throw new AppError(
        httpStatus.CONFLICT,
        'A book with this ISBN already exists',
      );
    }
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
