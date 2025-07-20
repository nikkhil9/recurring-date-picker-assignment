// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './', // Path to our Next.js app
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
  },
}

module.exports = createJestConfig(customJestConfig)