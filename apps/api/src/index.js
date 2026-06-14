import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth/sync-user.route.js';
import escrowRouter from './routes/escrow/deploy.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRouter);

// Escrow routes
app.use('/api/escrow', escrowRouter);

app.listen(PORT, () => {
  console.log(`[api] ZeroBit API running on http://localhost:${PORT}`);
});