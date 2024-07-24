module.exports = {
    
    testEnvironment: 'jest-environment-jsdom',
    setupFiles: ["./jest.setup.js"],
    setupFilesAfterEnv: ['jest-fetch-mock'],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/tests/jest.setup.js']
  };
  