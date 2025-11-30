import express from 'express';
import multer from 'multer';
import path from 'path';
import fetch from 'node-fetch';
import { 
  analyzePattern, 
  publishPattern, 
  getCommunityPatterns,
  getUserPatterns,
  deletePattern,
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
router.delete('/:id', protect, deletePattern);
router.post('/:patternId/like', protect, likePattern);

// Comment routes
router.post('/:patternId/comments', protect, addComment);
router.delete('/:patternId/comments/:commentId', protect, deleteComment);
router.post('/:patternId/comments/:commentId/like', protect, likeComment);

// NASA API routes
router.get('/nasa-data/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
    
    let apiUrl = '';
    
    switch(type) {
      case 'neo':
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${weekAgo}&end_date=${today}&api_key=${NASA_API_KEY}`;
        break;
        
      default:
        return res.status(400).json({ success: false, message: 'Invalid data type' });
    }
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    let transformedData = null;
    
    if (type === 'neo') {
      const asteroids = [];
      Object.values(data.near_earth_objects).forEach(dayData => {
        dayData.forEach(asteroid => {
          asteroids.push({
            name: asteroid.name,
            diameter: asteroid.estimated_diameter.meters.estimated_diameter_max,
            velocity: parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour),
            distance: parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers),
            hazardous: asteroid.is_potentially_hazardous_asteroid ? 1 : 0
          });
        });
      });
      transformedData = asteroids;
    }
    
    res.json({ 
      success: true, 
      data: transformedData || data,
      source: 'NASA API',
      type 
    });
    
  } catch (error) {
    console.error('NASA API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NASA data' });
  }
});

router.post('/analyze-nasa', async (req, res) => {
  try {
    const { nasaData, type } = req.body;
    
    if (!nasaData || !nasaData.length) {
      return res.status(400).json({ success: false, message: 'No NASA data provided' });
    }
    
    console.log('=== NASA DATA DEBUG ===');
    console.log('Total asteroids:', nasaData.length);
    
    // SAMPLE DATA - take only subset if too many points
    let sampledData = nasaData;
    const MAX_POINTS = 50;
    
    if (nasaData.length > MAX_POINTS) {
      const step = Math.floor(nasaData.length / MAX_POINTS);
      sampledData = nasaData.filter((_, index) => index % step === 0).slice(0, MAX_POINTS);
    }
    
    console.log('Sampled to:', sampledData.length, 'points');
    
    // Convert NASA data to visualization points - MIXED SCALING
    const points = sampledData.map((item, index) => {
      let x, y, z;
      
      if (type === 'neo') {
        // Use LOG scale for diameter and distance (huge ranges)
        const logDiameter = Math.log10(item.diameter + 1);
        const logDistance = Math.log10(item.distance + 1);
        
        // Use LINEAR scale for velocity (already similar values)
        const velocity = item.velocity;
        
        // Find min/max
        const allLogD = sampledData.map(a => Math.log10(a.diameter + 1));
        const allVel = sampledData.map(a => a.velocity);
        const allLogDist = sampledData.map(a => Math.log10(a.distance + 1));
        
        const minLogD = Math.min(...allLogD);
        const maxLogD = Math.max(...allLogD);
        const minVel = Math.min(...allVel);
        const maxVel = Math.max(...allVel);
        const minLogDist = Math.min(...allLogDist);
        const maxLogDist = Math.max(...allLogDist);
        
        if (index === 0) {
          console.log('=== RANGES ===');
          console.log('Diameter (log):', minLogD.toFixed(2), '-', maxLogD.toFixed(2));
          console.log('Velocity (linear):', minVel.toFixed(0), '-', maxVel.toFixed(0));
          console.log('Distance (log):', minLogDist.toFixed(2), '-', maxLogDist.toFixed(2));
        }
        
        const range = 80; // Fixed range
        
        // Normalize to range
        x = ((logDiameter - minLogD) / (maxLogD - minLogD)) * (range * 2) - range;
        y = ((velocity - minVel) / (maxVel - minVel)) * (range * 2) - range;
        z = ((logDistance - minLogDist) / (maxLogDist - minLogDist)) * (range * 2) - range;
        
        if (index === 0) {
          console.log('=== FIRST POINT ===');
          console.log('Raw:', { d: item.diameter, v: item.velocity, dist: item.distance });
          console.log('Final:', { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) });
        }
      } else {
        x = index;
        y = Object.values(item)[1] || Math.random() * 100;
        z = Object.values(item)[2] || Math.random() * 100;
      }
      
      return { x, y, z };
    });
    
    console.log('=== FINAL POINTS (first 5) ===');
    console.log(points.slice(0, 5));
    console.log('===================\n');
    
    const insights = [];
    if (type === 'neo') {
      const hazardousCount = nasaData.filter(a => a.hazardous === 1).length;
      const avgVelocity = nasaData.reduce((sum, a) => sum + a.velocity, 0) / nasaData.length;
      const avgDistance = nasaData.reduce((sum, a) => sum + a.distance, 0) / nasaData.length;
      const maxDiameter = Math.max(...nasaData.map(a => a.diameter));
      
      insights.push(`Analyzed ${nasaData.length} Near-Earth Objects from NASA's database.`);
      
      if (sampledData.length < nasaData.length) {
        insights.push(`Visualizing ${sampledData.length} representative asteroids for clarity.`);
      }
      
      insights.push(`${hazardousCount} potentially hazardous asteroids detected (${((hazardousCount/nasaData.length)*100).toFixed(1)}%).`);
      insights.push(`Average approach velocity: ${(avgVelocity/1000).toFixed(2)} thousand km/h.`);
      insights.push(`Average miss distance: ${(avgDistance/1000000).toFixed(2)} million km from Earth.`);
      insights.push(`Largest object diameter: ${maxDiameter.toFixed(2)} meters.`);
    }
    
    const analysisResult = {
      dataset_type: type === 'neo' ? 'asteroid' : 'space',
      patterns: ['orbital', 'celestial', 'distribution'],
      insights,
      visualization_data: {
        points,
        type: 'nasa_' + type
      }
    };
    
    res.json({ success: true, data: analysisResult });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze NASA data' });
  }
});

export default router;