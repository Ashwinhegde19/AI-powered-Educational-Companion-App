const mongoose = require('mongoose');

const ncertConceptSchema = new mongoose.Schema({
  conceptId: {
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
  subject: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Economics', 'English', 'Hindi']
  },
  class: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  book: {
    title: String,
    isbn: String,
    publication: String
  },
  chapter: {
    number: Number,
    title: String,
    description: String
  },
  section: {
    number: String,
    title: String,
    pageNumbers: [Number]
  },
  content: {
    type: String,
    required: true,
    text: true // Enable text search
  },
  // Vector embeddings for semantic search
  embeddings: {
    type: [Number],
    index: false
  },
  keywords: [String],
  learningObjectives: [String],
  difficulty: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Advanced'],
    default: 'Basic'
  },
  prerequisites: [{
    conceptId: String,
    title: String
  }],
  relatedConcepts: [{
    conceptId: String,
    title: String,
    relationshipType: {
      type: String,
      enum: ['prerequisite', 'related', 'advanced', 'application']
    }
  }],
  // Mapping to videos
  mappedVideos: [{
    videoId: String,
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
  lastProcessed: Date
}, {
  timestamps: true,
  versionKey: false
});

// Compound indexes
ncertConceptSchema.index({ subject: 1, class: 1, 'chapter.number': 1 });
ncertConceptSchema.index({ keywords: 1 });
ncertConceptSchema.index({ difficulty: 1, class: 1 });
ncertConceptSchema.index({ processingStatus: 1 });

// Text index for content search
ncertConceptSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text',
  keywords: 'text'
});

// Static method to find concepts by subject and class
ncertConceptSchema.statics.findBySubjectAndClass = function(subject, classNumber) {
  return this.find({ subject, class: classNumber })
    .sort({ 'chapter.number': 1, 'section.number': 1 });
};

// Static method to search concepts
ncertConceptSchema.statics.searchConcepts = function(query, subject = null, classNumber = null) {
  const searchQuery = {
    $text: { $search: query }
  };
  
  if (subject) searchQuery.subject = subject;
  if (classNumber) searchQuery.class = classNumber;
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('NCERTConcept', ncertConceptSchema);
