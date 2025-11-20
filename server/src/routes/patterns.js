import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  analyzePattern, 
  publishPattern, 
  getCommunityPatterns,
  likePattern 
} from '../controllers/patternController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dataset-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// POST /api/patterns/analyze - Analyze CSV
router.post('/analyze', protect, upload.single('file'), analyzePattern);

// POST /api/patterns/publish - Publish to community
router.post('/publish', protect, publishPattern);

// GET /api/patterns/community - Get all patterns
router.get('/community', getCommunityPatterns);

// POST /api/patterns/:patternId/like - Like/unlike pattern
router.post('/:patternId/like', protect, likePattern);

export default router;