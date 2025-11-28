module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.env.setup.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
  },
  // Use Node environment for tests that access Prisma by file pattern override
  testEnvironmentOptions: {},
  coverageThreshold: {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    global: {
      statements: 60,
      branches: 50,
      functions: 55,
      lines: 60
    }
  },
  projects: [
    {
      displayName: 'db',
      testMatch: ['**/__tests__/db.test.ts','**/__tests__/*.db.test.ts'],
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/jest.env.setup.cjs'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
      }
    },
    {
      displayName: 'ui',
      testMatch: ['**/__tests__/*.test.ts?(x)', '!**/__tests__/db.test.ts', '!**/__tests__/*.db.test.ts'],
      testEnvironment: 'jsdom',
      setupFiles: ['<rootDir>/jest.env.setup.cjs'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
      }
    }
  ]
};
