import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  datasetName: {
    type: String,
    required: true
  },
  patternType: {
    type: String,
    enum: ['bitcoin', 'stock', 'other'],
    default: 'other'
  },
  // Store the analysis results
  analysisData: {
    patterns: mongoose.Schema.Types.Mixed,
    visualization_data: mongoose.Schema.Types.Mixed,
    insights: [String]
  },
  // Stats for community display
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;