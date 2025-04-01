import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { BookRoutes } from '../modules/book/book.route';
import { OrderRoutes } from '../modules/order/order.route';
import { ReviewRoutes } from '../modules/review/review.route';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/books',
    route: BookRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
