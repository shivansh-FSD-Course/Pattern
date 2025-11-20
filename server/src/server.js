import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import patternRoutes from './routes/patterns.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// ✨ INCREASE LIMITS HERE ✨
app.use(express.json({ limit: '50mb' }));  // ← Changed from default 100kb
app.use(express.urlencoded({ extended: true, limit: '50mb' }));  // ← Added limit

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pattern API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patterns', patternRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();