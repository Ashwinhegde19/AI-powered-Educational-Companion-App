const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  channelId: {
    type: String,
    required: true,
    index: true
  },
  channelTitle: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String, // ISO 8601 duration format (PT4M13S)
    required: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  thumbnails: {
    default: {
      url: String,
      width: Number,
      height: Number
    },
    medium: {
      url: String,
      width: Number,
      height: Number
    },
    high: {
      url: String,
      width: Number,
      height: Number
    },
    standard: {
      url: String,
      width: Number,
      height: Number
    },
    maxres: {
      url: String,
      width: Number,
      height: Number
    }
  },
  transcript: {
    type: String,
    text: true // Enable text search
  },
  transcriptTimestamps: [{
    start: Number,
    duration: Number,
    text: String
  }],
  statistics: {
    viewCount: String,
    likeCount: String,
    commentCount: String
  },
  tags: [String],
  categoryId: String,
  defaultLanguage: String,
  defaultAudioLanguage: String,
  // AI-related fields
  embeddings: {
    type: [Number], // Vector embeddings for semantic search
    index: false
  },
  ncertMappings: [{
    concept: String,
    chapter: String,
    section: String,
    pageNumber: String,
    confidence: Number,
    relevantTimestamps: [{
      start: Number,
      end: Number
    }]
  }],
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  lastProcessed: Date,
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for efficient querying
videoSchema.index({ channelId: 1, publishedAt: -1 });
videoSchema.index({ processingStatus: 1, createdAt: 1 });
videoSchema.index({ 'ncertMappings.concept': 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ title: 'text', description: 'text', transcript: 'text' });

// Pre-save middleware to update timestamps
videoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to get video URL
videoSchema.methods.getVideoUrl = function() {
  return `https://www.youtube.com/watch?v=${this.videoId}`;
};

// Instance method to get embed URL
videoSchema.methods.getEmbedUrl = function() {
  return `https://www.youtube.com/embed/${this.videoId}`;
};

// Static method to find videos by channel
videoSchema.statics.findByChannel = function(channelId, limit = 10) {
  return this.find({ channelId })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get random videos
videoSchema.statics.getRandomVideos = function(limit = 5) {
  return this.aggregate([
    { $match: { processingStatus: 'completed' } },
    { $sample: { size: limit } }
  ]);
};

module.exports = mongoose.model('Video', videoSchema);
