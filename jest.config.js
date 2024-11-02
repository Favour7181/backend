module.exports = {
    testEnvironment: 'node',
    // transform: {},
    setupFilesAfterEnv: ['./jest.setup.js'],
    testTimeout: 15000,
    setupFiles: ['dotenv/config'],
  };
  