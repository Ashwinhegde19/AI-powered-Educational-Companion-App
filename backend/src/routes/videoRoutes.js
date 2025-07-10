const express = require('express');
const { body, param, query } = require('express-validator');
const videoController = require('../controllers/videoController');

const router = express.Router();

// Validation middleware
const validateVideoId = [
  body('videoId')
    .isLength({ min: 11, max: 11 })
    .withMessage('Video ID must be exactly 11 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Video ID contains invalid characters')
];

const validateVideoIdParam = [
  param('videoId')
    .isLength({ min: 11, max: 11 })
    .withMessage('Video ID must be exactly 11 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Video ID contains invalid characters')
];

const validateChannelIdParam = [
  param('channelId')
    .isLength({ min: 1 })
    .withMessage('Channel ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Channel ID contains invalid characters')
];

const validateSearchQuery = [
  query('query')
    .isLength({ min: 1 })
    .withMessage('Search query is required')
    .trim()
    .escape()
];

const validateTimestamp = [
  query('timestamp')
    .isFloat({ min: 0 })
    .withMessage('Timestamp must be a positive number')
];

// Routes

/**
 * @route GET /api/videos/random
 * @desc Get random videos for home screen
 * @access Public
 */
router.get('/random', videoController.getRandomVideos);

/**
 * @route GET /api/videos/channel/:channelId
 * @desc Get videos by channel ID
 * @access Public
 */
router.get('/channel/:channelId', validateChannelIdParam, videoController.getVideosByChannel);

/**
 * @route GET /api/videos/search
 * @desc Search videos
 * @access Public
 */
router.get('/search', validateSearchQuery, videoController.searchVideos);

/**
 * @route GET /api/videos/:videoId
 * @desc Get video details with NCERT mappings
 * @access Public
 */
router.get('/:videoId', validateVideoIdParam, videoController.getVideoDetails);

/**
 * @route GET /api/videos/:videoId/ncert-mappings
 * @desc Get NCERT mappings for specific timestamp
 * @access Public
 */
router.get('/:videoId/ncert-mappings', 
  validateVideoIdParam, 
  validateTimestamp, 
  videoController.getNCERTMappingsAtTimestamp
);

/**
 * @route GET /api/videos/:videoId/status
 * @desc Get video processing status
 * @access Public
 */
router.get('/:videoId/status', validateVideoIdParam, videoController.getProcessingStatus);

/**
 * @route POST /api/videos/process
 * @desc Process a new video (fetch metadata, transcript, AI analysis)
 * @access Public
 */
router.post('/process', validateVideoId, videoController.processVideo);

module.exports = router;
