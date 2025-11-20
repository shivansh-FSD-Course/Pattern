import express from 'express';
import { 
  register, 
  login, 
  getMe,
  getProfile,      
  updateProfile   
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);        
router.put('/profile', protect, updateProfile);    

export default router;