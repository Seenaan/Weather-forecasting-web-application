// jest.setup.js
require('jest-fetch-mock').enableMocks(); // Enable fetch mocking

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

global.fetch = require('jest-fetch-mock'); // Mock fetch globally
