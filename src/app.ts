import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://bookoria.vercel.app'],
    credentials: true,
  }),
);

// application routes
app.use('/api/v1', router);

// home route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our book-shop !');
});

// global Error Handler
app.use(globalErrorHandler);

//not found routes
app.use(notFound);

export default app;
