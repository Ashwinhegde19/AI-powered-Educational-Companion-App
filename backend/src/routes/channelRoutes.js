const express = require('express');
const { body, param } = require('express-validator');
const channelController = require('../controllers/channelController');

const router = express.Router();

// Validation middleware
const validateChannelId = [
  body('channelId')
    .isLength({ min: 1 })
    .withMessage('Channel ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Channel ID contains invalid characters')
];

const validateChannelIdParam = [
  param('channelId')
    .isLength({ min: 1 })
    .withMessage('Channel ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Channel ID contains invalid characters')
];

const validateEducationalCategories = [
  body('educationalCategories')
    .optional()
    .isArray()
    .withMessage('Educational categories must be an array')
    .custom((categories) => {
      const validCategories = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 
        'Computer Science', 'General Science', 'History', 
        'Geography', 'Other'
      ];
      return categories.every(cat => validCategories.includes(cat));
    })
    .withMessage('Invalid educational category')
];

const validateTargetAudience = [
  body('targetAudience')
    .optional()
    .isIn(['Primary', 'Secondary', 'Higher Secondary', 'University', 'General'])
    .withMessage('Invalid target audience')
];

const validateCategoryParam = [
  param('category')
    .isIn([
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'Computer Science', 'General Science', 'History', 
      'Geography', 'Other'
    ])
    .withMessage('Invalid educational category')
];

// Routes

/**
 * @route GET /api/channels
 * @desc Get all active channels
 * @access Public
 */
router.get('/', channelController.getAllChannels);

/**
 * @route GET /api/channels/category/:category
 * @desc Get channels by educational category
 * @access Public
 */
router.get('/category/:category', validateCategoryParam, channelController.getChannelsByCategory);

/**
 * @route GET /api/channels/:channelId
 * @desc Get channel details
 * @access Public
 */
router.get('/:channelId', validateChannelIdParam, channelController.getChannelDetails);

/**
 * @route GET /api/channels/:channelId/stats
 * @desc Get channel statistics
 * @access Public
 */
router.get('/:channelId/stats', validateChannelIdParam, channelController.getChannelStats);

/**
 * @route POST /api/channels
 * @desc Add a new channel
 * @access Public
 */
router.post('/', 
  validateChannelId,
  validateEducationalCategories,
  validateTargetAudience,
  channelController.addChannel
);

/**
 * @route PUT /api/channels/:channelId
 * @desc Update channel metadata
 * @access Public
 */
router.put('/:channelId',
  validateChannelIdParam,
  validateEducationalCategories,
  validateTargetAudience,
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  channelController.updateChannel
);

/**
 * @route POST /api/channels/:channelId/refresh
 * @desc Refresh channel videos
 * @access Public
 */
router.post('/:channelId/refresh', validateChannelIdParam, channelController.refreshChannelVideos);

module.exports = router;
