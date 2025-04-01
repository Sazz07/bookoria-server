/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Schema, model } from 'mongoose';
import { ReviewModel, TReview } from './review.interface';

const reviewSchema = new Schema<TReview, ReviewModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
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

// Static method to calculate average rating for a book
reviewSchema.statics.calculateAverageRating = async function (bookId) {
  const result = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  // Update book with new average rating
  if (result.length > 0) {
    await model('Book').findByIdAndUpdate(bookId, {
      rating: result[0].averageRating,
    });
  } else {
    // If no reviews, set rating to 0
    await model('Book').findByIdAndUpdate(bookId, {
      rating: 0,
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function (this: any) {
  await (this.constructor as ReviewModel).calculateAverageRating(this.book);
});

// Call calculateAverageRating after update
reviewSchema.post('findOneAndUpdate', async function (doc) {
  await doc.constructor.calculateAverageRating(doc.book);
});

// Call calculateAverageRating after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.book);
  }
});

export const Review = model<TReview, ReviewModel>('Review', reviewSchema);
