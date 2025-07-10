// Test setup file
require('dotenv').config({ path: '.env.test' });

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless NODE_ENV is 'test-verbose'
  log: process.env.NODE_ENV === 'test-verbose' ? console.log : jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};
