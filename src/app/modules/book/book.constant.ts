export const bookFormat = [
  'Hardcover',
  'Paperback',
  'Ebook',
  'Audiobook',
] as const;

export const BOOK_GENRE = {
  FICTION: 'Fiction',
  NON_FICTION: 'Non-Fiction',
  MYSTERY: 'Mystery',
  THRILLER: 'Thriller',
  ROMANCE: 'Romance',
  SCIENCE_FICTION: 'Science Fiction',
  FANTASY: 'Fantasy',
  HORROR: 'Horror',
  BIOGRAPHY: 'Biography',
  AUTOBIOGRAPHY: 'Autobiography',
  HISTORY: 'History',
  SELF_HELP: 'Self-Help',
  BUSINESS: 'Business',
  CHILDREN: 'Children',
  YOUNG_ADULT: 'Young Adult',
  POETRY: 'Poetry',
  DRAMA: 'Drama',
  RELIGION: 'Religion',
  PHILOSOPHY: 'Philosophy',
  SCIENCE: 'Science',
  TRAVEL: 'Travel',
  COOKBOOK: 'Cookbook',
  ART: 'Art',
  EDUCATION: 'Education',
} as const;

export const bookGenres = Object.values(BOOK_GENRE);
