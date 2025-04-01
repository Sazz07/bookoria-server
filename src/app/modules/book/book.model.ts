import { Schema, model } from 'mongoose';
import { TBook } from './book.interface';
import { bookFormat, bookGenres } from './book.constant';

const bookSchema = new Schema<TBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: bookGenres,
        message: '{VALUE} is not a valid genre',
      },
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },
    publicationDate: {
      type: Date,
    },
    publisher: {
      type: String,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    pageCount: {
      type: Number,
      min: [1, 'Page count must be at least 1'],
    },
    coverImage: {
      type: String,
    },
    format: {
      type: String,
      enum: bookFormat,
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%'],
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
  },
);

// Virtual for discounted price
bookSchema.virtual('discountedPrice').get(function () {
  return this.price - (this.price * (this.discount || 0)) / 100;
});

// Query middleware to exclude deleted books
bookSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

bookSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Book = model<TBook>('Book', bookSchema);
