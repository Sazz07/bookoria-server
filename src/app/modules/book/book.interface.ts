export type TFormat = 'Hardcover' | 'Paperback' | 'E-book' | 'Audiobook';

export type TBook = {
  _id?: string;
  title: string;
  author: string;
  genre: string;
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
