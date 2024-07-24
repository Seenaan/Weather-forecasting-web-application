module.exports = {
    
    testEnvironment: 'jest-environment-jsdom',
    setupFiles: ["./tests/jest.setup.js"],
    setupFilesAfterEnv: ['jest-fetch-mock']
  };
  