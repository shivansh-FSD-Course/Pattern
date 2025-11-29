import Pattern from '../models/Pattern.js';
import User from '../models/User.js';  
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyze pattern endpoint
export const analyzePattern = async (req, res) => {
  try {
    console.log(' Pattern analysis request received');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('File received:', req.file.originalname);

    // Read CSV file
    const filePath = path.join(__dirname, '../../', req.file.path);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      return row;
    });

    console.log(`Parsed ${data.length} rows with headers:`, headers);

    // Detect dataset type
    const datasetType = detectDatasetType(headers, data);
    console.log('Detected dataset type:', datasetType);

    // Analyze patterns
    const patterns = analyzeData(data, headers, datasetType);
    
    // Generate visualization data
    const visualizationData = generateVisualization(data, headers, datasetType);

    // Generate insights
    const insights = generateInsights(patterns, datasetType);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: {
        dataset_type: datasetType,
        patterns,
        visualization_data: visualizationData,
        insights
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze dataset',
      error: error.message
    });
  }
};

// Helper function to detect dataset type
function detectDatasetType(headers, data) {
  const headerStr = headers.join(' ').toLowerCase();
  
  if (headerStr.includes('bitcoin') || headerStr.includes('btc')) {
    return 'bitcoin';
  }
  if (headerStr.includes('stock') || headerStr.includes('price') || headerStr.includes('close')) {
    return 'stock';
  }
  if (headerStr.includes('fibonacci') || headerStr.includes('fib')) {
    return 'fibonacci';
  }
  if (headerStr.includes('wave') || headerStr.includes('amplitude')) {
    return 'wave';
  }
  
  return 'other';
}

// Helper function to analyze data
function analyzeData(data, headers, datasetType) {
  const patterns = [];
  
  // Extract numeric columns
  const numericColumns = headers.filter(header => {
    return data.some(row => !isNaN(parseFloat(row[header])));
  });

  numericColumns.forEach(column => {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      patterns.push({
        column,
        type: 'numeric',
        min,
        max,
        average: avg,
        count: values.length
      });
    }
  });

  return patterns;
}

// Helper function to generate visualization
function generateVisualization(data, headers, datasetType) {
  const numericColumns = headers.filter(header => {
    return data.some(row => !isNaN(parseFloat(row[header])));
  });

  if (numericColumns.length === 0) {
    return { points: [] };
  }

  // Create 3D spiral visualization
  const points = data.map((row, index) => {
    const t = index / data.length;
    const angle = t * Math.PI * 8;
    const radius = 5 + t * 10;
    
    // Get value from first numeric column
    const valueColumn = numericColumns[0];
    const value = parseFloat(row[valueColumn]) || 0;
    const normalizedValue = value / 100; // Simple normalization
    
    return {
      x: Math.cos(angle) * radius,
      y: normalizedValue * 10,
      z: Math.sin(angle) * radius,
      value: value,
      index: index
    };
  });

  return {
    points,
    type: 'spiral',
    datasetType
  };
}

// Helper function to generate insights
function generateInsights(patterns, datasetType) {
  const insights = [];
  
  insights.push(`Dataset type identified as: ${datasetType}`);
  insights.push(`Found ${patterns.length} numeric patterns in the data`);
  
  patterns.forEach(pattern => {
    if (pattern.type === 'numeric') {
      const range = pattern.max - pattern.min;
      insights.push(
        `${pattern.column}: Range from ${pattern.min.toFixed(2)} to ${pattern.max.toFixed(2)} (avg: ${pattern.average.toFixed(2)})`
      );
    }
  });

  return insights;
}

// Publish pattern
export const publishPattern = async (req, res) => {
  try {
    console.log(' Publish Pattern Request Received');
    console.log('User:', req.user?._id);

    const { title, caption, datasetName, patternType, analysisData } = req.body;

    if (!title || !datasetName || !analysisData) {
      console.log(' Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    console.log(' Creating pattern...');
    const pattern = await Pattern.create({
      user: req.user._id,
      title,
      caption,
      datasetName,
      patternType,
      analysisData
    });

    console.log(' Pattern created:', pattern._id);

    await pattern.populate('user', 'username avatar');

    console.log(' Pattern populated, sending response');
    res.status(201).json({
      success: true,
      message: 'Pattern published successfully!',
      pattern
    });

  } catch (error) {
    console.error(' Publish error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to publish pattern',
      error: error.message
    });
  }
};

// Get community patterns
export const getCommunityPatterns = async (req, res) => {
  try {
    const patterns = await Pattern.find()
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      patterns
    });
  } catch (error) {
    console.error('Failed to fetch patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patterns'
    });
  }
};
// Get user's own patterns
// Get user's own patterns
export const getUserPatterns = async (req, res) => {
  try {
    const patterns = await Pattern.find({ user: req.user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      patterns
    });
  } catch (error) {
    console.error('Failed to fetch user patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patterns'
    });
  }
};

// Delete pattern
export const deletePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    
    if (!pattern) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pattern not found' 
      });
    }
    
    // Check if user owns this pattern
    if (pattern.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this pattern' 
      });
    }
    
    await pattern.deleteOne();
    
    res.json({ 
      success: true, 
      message: 'Pattern deleted successfully' 
    });
  } catch (error) {
    console.error('Delete pattern error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
// Like pattern
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

    const alreadyLiked = pattern.likedBy.includes(userId);

    if (alreadyLiked) {
      pattern.likes -= 1;
      pattern.likedBy = pattern.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      pattern.likes += 1;
      pattern.likedBy.push(userId);
    }

    await pattern.save();

    res.json({
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

// Add comment to pattern
export const addComment = async (req, res) => {
  try {
    const { patternId } = req.params;
    const { text, parentCommentId } = req.body;

    console.log(' Adding comment to pattern:', patternId);

    const pattern = await Pattern.findById(patternId);
    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }

    // Extract mentions from text (basic @username detection)
    const mentionMatches = text.match(/@(\w+)/g) || [];
    const mentionUsernames = mentionMatches.map(m => m.substring(1));
    
    // Find mentioned users
    const mentionedUsers = await User.find({ 
      username: { $in: mentionUsernames } 
    }).select('_id');

    const newComment = {
      user: req.user._id,
      text,
      mentions: mentionedUsers.map(u => u._id),
      parentComment: parentCommentId || null,
      replies: []
    };

    // If it's a reply, add to parent's replies array
    if (parentCommentId) {
      const parentComment = pattern.comments.id(parentCommentId);
      if (parentComment) {
        pattern.comments.push(newComment);
        const addedComment = pattern.comments[pattern.comments.length - 1];
        parentComment.replies.push(addedComment._id);
      } else {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    } else {
      // Top-level comment
      pattern.comments.push(newComment);
    }

    await pattern.save();

    // Populate the new comment with user data
    await pattern.populate('comments.user', 'username avatar');

    const addedComment = pattern.comments[pattern.comments.length - 1];

    console.log(' Comment added successfully');

    res.status(201).json({
      success: true,
      comment: addedComment
    });

  } catch (error) {
    console.error(' Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { patternId, commentId } = req.params;

    const pattern = await Pattern.findById(patternId);
    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }

    const comment = pattern.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or the pattern
    if (comment.user.toString() !== req.user._id.toString() && 
        pattern.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    comment.remove();
    await pattern.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted'
    });

  } catch (error) {
    console.error(' Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

// Like comment
export const likeComment = async (req, res) => {
  try {
    const { patternId, commentId } = req.params;
    const userId = req.user._id;

    const pattern = await Pattern.findById(patternId);
    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }

    const comment = pattern.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const alreadyLiked = comment.likedBy.includes(userId);

    if (alreadyLiked) {
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes += 1;
      comment.likedBy.push(userId);
    }

    await pattern.save();

    res.status(200).json({
      success: true,
      likes: comment.likes,
      isLiked: !alreadyLiked
    });

  } catch (error) {
    console.error(' Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment'
    });
  }
};