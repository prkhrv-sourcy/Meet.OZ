import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.clientUrl.includes(',')
    ? env.clientUrl.split(',').map(u => u.trim())
    : env.clientUrl,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.use('/api', routes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
});
