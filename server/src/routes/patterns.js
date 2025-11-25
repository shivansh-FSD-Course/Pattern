import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  analyzePattern, 
  publishPattern, 
  getCommunityPatterns,
  getUserPatterns,
  likePattern,
  addComment,      
  deleteComment,   
  likeComment      
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Pattern routes
router.post('/analyze', protect, upload.single('file'), analyzePattern);
router.post('/publish', protect, publishPattern);
router.get('/community', getCommunityPatterns);
router.get('/my-patterns', protect, getUserPatterns);
router.post('/:patternId/like', protect, likePattern);

// Comment routes
router.post('/:patternId/comments', protect, addComment);           // ← NEW
router.delete('/:patternId/comments/:commentId', protect, deleteComment); // ← NEW
router.post('/:patternId/comments/:commentId/like', protect, likeComment); // ← NEW

export default router;