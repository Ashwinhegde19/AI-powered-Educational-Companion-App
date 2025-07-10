const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelId: {
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
  customUrl: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date,
    required: true
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
    }
  },
  statistics: {
    viewCount: String,
    subscriberCount: String,
    hiddenSubscriberCount: Boolean,
    videoCount: String
  },
  brandingSettings: {
    channel: {
      title: String,
      description: String,
      keywords: String,
      country: String
    },
    image: {
      bannerExternalUrl: String
    }
  },
  // Educational focus areas
  educationalCategories: [{
    type: String,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Science', 'History', 'Geography', 'Other']
  }],
  targetAudience: {
    type: String,
    enum: ['Primary', 'Secondary', 'Higher Secondary', 'University', 'General']
  },
  // Processing metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastVideoFetch: Date,
  videoCount: {
    type: Number,
    default: 0
  },
  processedVideoCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
channelSchema.index({ educationalCategories: 1 });
channelSchema.index({ targetAudience: 1 });
channelSchema.index({ isActive: 1, videoCount: -1 });

// Virtual for channel URL
channelSchema.virtual('channelUrl').get(function() {
  return `https://www.youtube.com/channel/${this.channelId}`;
});

// Instance method to update video count
channelSchema.methods.updateVideoCount = async function() {
  const Video = mongoose.model('Video');
  this.videoCount = await Video.countDocuments({ channelId: this.channelId });
  this.processedVideoCount = await Video.countDocuments({ 
    channelId: this.channelId, 
    processingStatus: 'completed' 
  });
  return this.save();
};

module.exports = mongoose.model('Channel', channelSchema);
