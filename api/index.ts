import express from 'express';
import { apiRouter } from '../server/api.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use('/api', apiRouter);

// Export express app as default for Vercel Serverless Function
export default app;
