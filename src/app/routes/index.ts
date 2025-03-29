import { Router } from 'express';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  // Will add routes here as we develop them
  // {
  //   path: '/auth',
  //   route: AuthRoutes,
  // },
  // {
  //   path: '/books',
  //   route: BookRoutes,
  // },
  // {
  //   path: '/admin',
  //   route: AdminRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
