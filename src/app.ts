import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// cài đặt cần thiết
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',
  })
);
app.use(cookieParser());
app.use(passport.initialize());

app.use('/', routes); // setup routes

app.use(errorHandler); // để cuối cùng

export default app;
