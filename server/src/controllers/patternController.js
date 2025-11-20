import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Pattern from '../models/Pattern.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyze uploaded CSV
export const analyzePattern = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const pythonScript = path.join(__dirname, '../../python/algorithms/bitcoin_patterns.py');
    
    const pythonPath = process.platform === 'win32' 
      ? 'C:/Users/singh/anaconda3/python.exe'
      : 'python3';

    const pythonProcess = spawn(pythonPath, [pythonScript, filePath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      fs.unlinkSync(filePath);

      if (code !== 0) {
        console.error('Python Error:', errorString);
        return res.status(500).json({
          success: false,
          message: 'Analysis failed',
          error: errorString
        });
      }

      try {
        const result = JSON.parse(dataString);
        
        if (result.error) {
          return res.status(400).json({
            success: false,
            message: result.error
          });
        }

        res.status(200).json({
          success: true,
          data: result,
          fileName: req.file.originalname
        });

      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        res.status(500).json({
          success: false,
          message: 'Failed to parse analysis results'
        });
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during analysis'
    });
  }
};

// Publish pattern to community
export const publishPattern = async (req, res) => {
  try {
    const { title, caption, datasetName, patternType, analysisData } = req.body;

    if (!title || !datasetName || !analysisData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const pattern = await Pattern.create({
      user: req.user._id,
      title,
      caption,
      datasetName,
      patternType,
      analysisData
    });

    // Populate user info
    await pattern.populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Pattern published successfully!',
      pattern
    });

  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish pattern'
    });
  }
};

// Get all community patterns
export const getCommunityPatterns = async (req, res) => {
  try {
    const patterns = await Pattern.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      patterns
    });

  } catch (error) {
    console.error('Fetch patterns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patterns'
    });
  }
};

// Like a pattern
export const likePattern = async (req, res) => {
  try {
    const { patternId } = req.params;
    const userId = req.user._id;

    const pattern = await Pattern.findById(patternId);
    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }

    // Check if already liked
    const alreadyLiked = pattern.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      pattern.likes -= 1;
      pattern.likedBy = pattern.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      pattern.likes += 1;
      pattern.likedBy.push(userId);
    }

    await pattern.save();

    res.status(200).json({
      success: true,
      likes: pattern.likes,
      isLiked: !alreadyLiked
    });

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like pattern'
    });
  }
};