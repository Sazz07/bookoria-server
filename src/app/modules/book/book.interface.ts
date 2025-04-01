import { BOOK_GENRE } from './book.constant';

export type TFormat = 'Hardcover' | 'Paperback' | 'E-book' | 'Audiobook';

export type TBookGenre = (typeof BOOK_GENRE)[keyof typeof BOOK_GENRE];

export type TBook = {
  _id?: string;
  title: string;
  author: string;
  genre: TBookGenre;
  description: string;
  price: number;
  stock: number;
  publicationDate?: Date;
  publisher?: string;
  isbn?: string;
  language?: string;
  pageCount?: number;
  coverImage?: string;
  format?: TFormat;
  rating?: number;
  featured?: boolean;
  discount?: number;
  isDeleted?: boolean;
};

export type TBookFilters = {
  searchTerm?: string;
  title?: string;
  author?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
};
