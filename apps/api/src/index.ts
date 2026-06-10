import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import apiRouter from './routes/index.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'devboard-api' });
});

app.use('/api/v1', apiRouter);
// app.get('/api/v1/health', (_req, res) => {
//   res.status(200).json({ status: 'ok', service: 'devboard-api', version: 'v1' });
// });

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
