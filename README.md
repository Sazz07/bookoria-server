# Bookoria Backend

Welcome to the Book Shop Backend ! This robust system provides a comprehensive foundation for an online bookstore, enabling users to browse, purchase books, and leave reviews while ensuring secure authentication and role-based access control.

## 🌐 LIVE LINK

```
https://bookoria-backend.vercel.app
```

## 🚀 Features

- User Authentication & Authorization : Secure login and registration system.
- Role-Based Access Control : Admin and User roles with distinct permissions.
- Admin Privileges :
  - Manage users (block/unblock, delete).
  - Manage book inventory.
  - Process and track orders.
- User Privileges :
  - Browse and purchase books.
  - Create, update, and delete their own reviews.
  - Track order history and status.
- Public Access : View books with search, sort, and filter functionalities.
- Payment Integration : Secure payment processing with ShurjoPay.
- Order Management : Complete order lifecycle from creation to delivery.

## 🛠️ Technologies Used

- TypeScript
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Zod Validation
- ShurjoPay Payment Gateway

## 📌 Getting Started

Follow these steps to set up the project locally:

### 1️⃣ Clone Repository

```sh
git clone  https://github.com/Sazz07/bookoria-server.git
cd bookoria-server
```

````

### 2️⃣ Install Dependencies
```sh
yarn install
````

### 3️⃣ Set Up Environment Variables

- Rename .env.example to .env
- Update the environment variables with your configuration:
  - DATABASE_URL : MongoDB connection URI
  - JWT_ACCESS_SECRET and JWT_REFRESH_SECRET : Secret keys for JWT
  - PORT : Server port (default: 5000)
  - ShurjoPay credentials if using payment features

### 4️⃣ Start the Server

````sh
# Development mode
yarn start:dev


## 🌐 API Endpoints

### Authentication

- Register User : POST /api/auth/register
- Login User : POST /api/auth/login
- Refresh Token : POST /api/auth/refresh-token

### User Management

- Get User Profile : GET /api/users/my-profile
- Update User Profile : PATCH /api/users/my-profile
- Change Password : PATCH /api/users/change-password

### Book Management

- Get All Books : GET /api/books
- Get Book by ID : GET /api/books/:id
- Create Book (Admin) : POST /api/books
- Update Book (Admin) : PATCH /api/books/:id
- Delete Book (Admin) : DELETE /api/books/:id

### Review System

- Get Reviews by Book : GET /api/reviews/book/:bookId
- Get User's Reviews : GET /api/reviews/my-reviews
- Create Review : POST /api/reviews/book/:bookId
- Update Review : PATCH /api/reviews/:id
- Delete Review : DELETE /api/reviews/:id

### Order Management

- Create Order : POST /api/orders/create-order
- Get User's Orders : GET /api/orders/my-orders
- Get Order by ID : GET /api/orders/:id
- Update Order Status : PATCH /api/orders/:id/status
- Delete Order : DELETE /api/orders/:id
- Verify Payment : GET /api/orders/verify-payment/:orderId

### Admin Operations

- Get All Users : GET /api/admin
- Get User by ID : GET /api/admin/:id
- Update User : PATCH /api/admin/:id
- Block/Unblock User : PATCH /api/admin/:id/block
- Delete User : DELETE /api/admin/:id
- Get All Orders : GET /api/orders (Admin access)

## 🔍 Query Parameters

Most GET endpoints support the following query parameters:

- Search : ?search=keyword - Search by relevant fields
- Pagination : ?page=1&limit=10 - Control result pagination
- Sorting : ?sortBy=field&sortOrder=asc - Sort results
- Filtering : ?filter[field]=value - Filter by specific fields

## 🔐 Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin and User roles)
- Protected routes require authentication header:

```sh
Authorization: Bearer <token>
````

## 🏗️ Data Models

### User Model

```ts
{
  name: {
    firstName: string;
    lastName: string;
  }
  email: string;
  password: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Book Model

```ts
{
  title: string;
  author: string;
  genre: string;
  description: string;
  price: number;
  stock: number;
  publicationDate: Date;
  publisher: string;
  isbn: string;
  language: string;
  pageCount: number;
  coverImage: string;
  format: 'Hardcover' | 'Paperback' | 'Ebook' | 'Audiobook';
  rating: number;
  featured: boolean;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

````

### Review Model
```ts
{
  user: ObjectId;
  book: ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
````

### Order Model

```ts
{
  user: ObjectId;
  orderItems: [{
    book: ObjectId;
    price: number;
    quantity: number;
    discount?: number;
  }];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentInfo: {
    method: string;
    status: string;
  };
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

````

## 🛠️ Error Handling
The API provides consistent error responses with appropriate HTTP status codes:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": "Error details"
}
````

## 💻 Development

- TypeScript : Strongly typed codebase
- ESLint & Prettier : Code quality and formatting
- Modular Architecture : Organized by feature modules
- Error Handling : Centralized error management
- Validation : Request validation with Zod

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Protection against common web vulnerabilities
