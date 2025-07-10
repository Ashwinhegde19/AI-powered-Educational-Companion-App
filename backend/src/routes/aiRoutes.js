const express = require('express');
const { body, param, query } = require('express-validator');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Validation middleware
const validateText = [
  body('text')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Text must be between 1 and 50000 characters')
    .trim()
];

const validateTranscript = [
  body('transcript')
    .isLength({ min: 10, max: 100000 })
    .withMessage('Transcript must be between 10 and 100000 characters')
    .trim()
];

const validateQuery = [
  body('query')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Query must be between 1 and 1000 characters')
    .trim()
];

const validateVideoIdParam = [
  param('videoId')
    .isLength({ min: 11, max: 11 })
    .withMessage('Video ID must be exactly 11 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Video ID contains invalid characters')
];

const validateSubject = [
  body('subject')
    .optional()
    .isIn([
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'History', 'Geography', 'Political Science', 'Economics', 
      'English', 'Hindi'
    ])
    .withMessage('Invalid subject')
];

const validateClass = [
  body('class')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Class must be between 1 and 12')
];

const validateLimit = [
  body('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const validateScoreThreshold = [
  body('scoreThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Score threshold must be between 0 and 1'),
  query('scoreThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Score threshold must be between 0 and 1')
];

const validateMaxKeywords = [
  body('maxKeywords')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Max keywords must be between 1 and 50')
];

// Routes

/**
 * @route POST /api/ai/find-ncert-concepts
 * @desc Find NCERT concepts for a given transcript
 * @access Public
 */
router.post('/find-ncert-concepts',
  validateTranscript,
  validateSubject,
  validateClass,
  body('maxConcepts').optional().isInt({ min: 1, max: 20 }).withMessage('Max concepts must be between 1 and 20'),
  aiController.findNCERTConcepts
);

/**
 * @route POST /api/ai/search-similar-videos
 * @desc Search for videos similar to a query using semantic search
 * @access Public
 */
router.post('/search-similar-videos',
  validateQuery,
  validateLimit,
  validateScoreThreshold,
  aiController.searchSimilarVideos
);

/**
 * @route GET /api/ai/videos/:videoId/ncert-concepts
 * @desc Find relevant NCERT concepts for a specific video
 * @access Public
 */
router.get('/videos/:videoId/ncert-concepts',
  validateVideoIdParam,
  validateLimit,
  validateScoreThreshold,
  query('subject').optional().isIn([
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'History', 'Geography', 'Political Science', 'Economics', 
    'English', 'Hindi'
  ]).withMessage('Invalid subject'),
  query('class').optional().isInt({ min: 1, max: 12 }).withMessage('Class must be between 1 and 12'),
  aiController.findRelevantNCERTConcepts
);

/**
 * @route POST /api/ai/generate-embedding
 * @desc Generate vector embedding for text
 * @access Public
 */
router.post('/generate-embedding',
  validateText,
  aiController.generateEmbedding
);

/**
 * @route GET /api/ai/videos/:videoId/summary
 * @desc Generate summary for a video
 * @access Public
 */
router.get('/videos/:videoId/summary',
  validateVideoIdParam,
  query('maxLength').optional().isInt({ min: 50, max: 1000 }).withMessage('Max length must be between 50 and 1000'),
  query('focusArea').optional().isLength({ min: 1, max: 100 }).withMessage('Focus area must be between 1 and 100 characters'),
  aiController.summarizeVideo
);

/**
 * @route POST /api/ai/extract-keywords
 * @desc Extract keywords from text
 * @access Public
 */
router.post('/extract-keywords',
  validateText,
  validateMaxKeywords,
  aiController.extractKeywords
);

/**
 * @route GET /api/ai/vector-db/info
 * @desc Get vector database information
 * @access Public
 */
router.get('/vector-db/info', aiController.getVectorDBInfo);

/**
 * @route GET /api/ai/health
 * @desc Health check for AI services
 * @access Public
 */
router.get('/health', aiController.healthCheck);

module.exports = router;
