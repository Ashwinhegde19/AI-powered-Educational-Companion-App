// API Response formatter
const sendResponse = (res, statusCode, success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

// Success responses
const sendSuccess = (res, message = 'Success', data = null, pagination = null) => {
  return sendResponse(res, 200, true, message, data, pagination);
};

const sendCreated = (res, message = 'Created successfully', data = null) => {
  return sendResponse(res, 201, true, message, data);
};

// Error responses
const sendError = (res, statusCode = 500, message = 'Internal server error', data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

const sendBadRequest = (res, message = 'Bad request', data = null) => {
  return sendResponse(res, 400, false, message, data);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, false, message);
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendResponse(res, 401, false, message);
};

const sendForbidden = (res, message = 'Forbidden') => {
  return sendResponse(res, 403, false, message);
};

const sendTooManyRequests = (res, message = 'Too many requests') => {
  return sendResponse(res, 429, false, message);
};

const sendServiceUnavailable = (res, message = 'Service unavailable') => {
  return sendResponse(res, 503, false, message);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

// Time formatting utilities
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

const parseISO8601Duration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

// URL validation
const isValidYouTubeURL = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
  return regex.test(url);
};

const isValidChannelURL = (url) => {
  const regex = /^(https?:\/\/)?(www\.)?youtube\.com\/(channel\/|c\/|user\/)?[\w-]+/;
  return regex.test(url);
};

// Extract IDs from URLs
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const extractChannelId = (url) => {
  const regex = /youtube\.com\/(?:c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Text utilities
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

const cleanText = (text) => {
  return text
    .replace(/\[.*?\]/g, '') // Remove stage directions
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Object utilities
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Array utilities
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = (array) => {
  return [...new Set(array)];
};

// Async utilities
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Environment utilities
const isDevelopment = () => process.env.NODE_ENV === 'development';
const isProduction = () => process.env.NODE_ENV === 'production';
const isTest = () => process.env.NODE_ENV === 'test';

module.exports = {
  // Response helpers
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendTooManyRequests,
  sendServiceUnavailable,
  formatValidationErrors,
  
  // Pagination
  getPaginationData,
  
  // Time utilities
  formatDuration,
  parseISO8601Duration,
  
  // URL utilities
  isValidYouTubeURL,
  isValidChannelURL,
  extractVideoId,
  extractChannelId,
  
  // Text utilities
  truncateText,
  cleanText,
  
  // Object utilities
  pick,
  omit,
  
  // Array utilities
  chunk,
  unique,
  
  // Async utilities
  asyncHandler,
  delay,
  
  // Environment utilities
  isDevelopment,
  isProduction,
  isTest
};
