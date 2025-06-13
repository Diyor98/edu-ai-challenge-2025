module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	globals: {
		'ts-jest': {
			tsconfig: {
				strict: false,
				noUncheckedIndexedAccess: false,
			},
		},
	},
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
		'!src/index.ts',
		'!src/demo.ts', // Exclude demo file
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html', 'text-summary'],
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 65,
			lines: 65,
			statements: 65,
		},
	},
};
