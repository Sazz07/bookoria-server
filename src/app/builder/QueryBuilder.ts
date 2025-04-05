import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query };

    // Exclude fields that are not for filtering
    const excludedFields = ['page', 'searchTerm', 'sort', 'limit', 'fields'];

    excludedFields.forEach((field) => delete queryObj[field]);

    let discountFilter: { discount: Record<string, number> } | null = null;
    if (queryObj.discount !== undefined) {
      if (queryObj.discount === 'true') {
        discountFilter = { discount: { $gt: 0 } };
      }

      delete queryObj.discount;
    }

    // Handle genre filter
    let genreFilter: { genre: { $in: string[] } } | null = null;
    if (
      queryObj.genre &&
      typeof queryObj.genre === 'string' &&
      queryObj.genre.includes(',')
    ) {
      const genreArray = queryObj.genre.split(',');
      genreFilter = { genre: { $in: genreArray } };
      delete queryObj.genre;
    }

    // Handle price range filters
    let priceFilter: { price: Record<string, number> } | null = null;

    if (queryObj.minPrice !== undefined || queryObj.maxPrice !== undefined) {
      priceFilter = { price: {} };

      if (queryObj.minPrice !== undefined) {
        priceFilter.price.$gte = Number(queryObj.minPrice);
        delete queryObj.minPrice;
      }

      if (queryObj.maxPrice !== undefined) {
        priceFilter.price.$lte = Number(queryObj.maxPrice);
        delete queryObj.maxPrice;
      }
    }

    // Handle featured filter
    if (queryObj.featured === 'true') {
      queryObj.featured = true;
    }

    // Process operators ($gt, $lt, etc.)
    const filterString = JSON.stringify(queryObj);
    const modifiedQuery = filterString.replace(
      /\b(gt|gte|lt|lte|eq|ne|in)\b/g,
      (match) => `$${match}`,
    );

    // Parse the modified query
    const parsedQuery = JSON.parse(modifiedQuery);

    if (genreFilter) {
      Object.assign(parsedQuery, genreFilter);
    }

    if (priceFilter) {
      Object.assign(parsedQuery, priceFilter);
    }

    if (discountFilter) {
      Object.assign(parsedQuery, discountFilter);
    }

    this.modelQuery = this.modelQuery.find(parsedQuery);

    return this;
  }

  sort() {
    if (!this.query.sort) {
      // Default sort by createdAt descending if no sort parameter
      this.modelQuery = this.modelQuery.sort('-createdAt');
      return this;
    }

    const sortParam = this.query.sort as string;

    // Special case for discountedPrice sorting
    if (sortParam.startsWith('discountedPrice')) {
      const order = sortParam.includes('desc') ? -1 : 1;

      if (order === 1) {
        this.modelQuery = this.modelQuery.sort({ discount: -1, price: 1 });
      } else {
        this.modelQuery = this.modelQuery.sort({ discount: 1, price: -1 });
      }

      return this;
    }

    // Handle other sort parameters
    if (sortParam.includes(',')) {
      const [field, order] = sortParam.split(',');
      const sortOrder = order === 'desc' ? -1 : 1;

      const sortObj: Record<string, 1 | -1> = { [field]: sortOrder };
      this.modelQuery = this.modelQuery.sort(sortObj);
    } else {
      this.modelQuery = this.modelQuery.sort(sortParam);
    }

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
