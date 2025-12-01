import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

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
  enum: ['bitcoin', 'stock', 'fibonacci', 'golden', 'exponential', 'wave', 'chaos', 'fourier', 'asteroid', 'space', 'other'],
  default: 'other'
},
  analysisData: {
    patterns: mongoose.Schema.Types.Mixed,
    visualization_data: mongoose.Schema.Types.Mixed,
    insights: [String]
  },
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
  comments: [commentSchema]
}, {
  timestamps: true
});

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;