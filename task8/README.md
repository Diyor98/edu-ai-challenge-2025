# 🛡️ Robust Validation Library

A powerful, type-safe validation library for TypeScript that provides comprehensive data validation with an intuitive fluent API. Built with modern TypeScript features for excellent type inference and developer experience.

## 🚀 Quick Start

To see the validation library in action, run the comprehensive demo:

```bash
# Install dependencies
npm install

# Run the demo application (demo.ts)
npm run dev
# or
npm start

# Run tests
npm test

# Generate test coverage
npm run test:coverage
```

## ✨ Features

- **🔒 Type-Safe**: Full TypeScript support with excellent type inference
- **🔗 Fluent API**: Chainable methods for intuitive validation building
- **🎯 Comprehensive**: Support for primitives, objects, arrays, unions, and custom types
- **🔄 Transformations**: Built-in data transformations (trim, case conversion, etc.)
- **📍 Detailed Errors**: Precise error messages with field paths
- **⚡ Performance**: Optimized for both small and large datasets
- **🧩 Composable**: Build complex schemas from simple validators
- **📦 Zero Dependencies**: Lightweight with no external dependencies

## 🚀 Installation

```bash
npm install robust-validation-library
# or
yarn add robust-validation-library
# or
pnpm add robust-validation-library
```

## 📖 Quick Start

```typescript
import { Schema } from 'robust-validation-library';

// Define a schema
const userSchema = Schema.object({
	name: Schema.string().minLength(2).maxLength(50),
	email: Schema.string().email(),
	age: Schema.number().min(18).optional(),
	isActive: Schema.boolean(),
	tags: Schema.array(Schema.string()).unique(),
});

// Validate data
const userData = {
	name: 'John Doe',
	email: 'john@example.com',
	age: 30,
	isActive: true,
	tags: ['developer', 'typescript'],
};

const result = userSchema.validate(userData);

if (result.success) {
	console.log('✅ Valid data:', result.data);
	// TypeScript knows the exact type of result.data
} else {
	console.log('❌ Validation errors:', result.errors);
}
```

## 📚 API Documentation

### String Validation

```typescript
const stringValidator = Schema.string()
	.minLength(3) // Minimum length
	.maxLength(100) // Maximum length
	.pattern(/^[A-Za-z]+$/) // Regex pattern
	.email() // Email validation
	.url() // URL validation
	.uuid() // UUID validation
	.alphanumeric() // Only letters and numbers
	.nonempty() // Disallow empty strings
	.trim() // Trim whitespace
	.toLowerCase() // Convert to lowercase
	.toUpperCase() // Convert to uppercase
	.optional() // Make optional
	.withMessage('Custom error'); // Custom error message
```

### Number Validation

```typescript
const numberValidator = Schema.number()
	.min(0) // Minimum value
	.max(100) // Maximum value
	.range(1, 10) // Value range
	.integer() // Must be integer
	.positive() // Must be positive (> 0)
	.negative() // Must be negative (< 0)
	.nonnegative() // Must be >= 0
	.nonpositive() // Must be <= 0
	.multipleOf(5) // Must be multiple of value
	.allowInfinite() // Allow Infinity/-Infinity
	.percentage() // Between 0 and 1
	.port() // Valid port number (1-65535)
	.optional() // Make optional
	.withMessage('Custom error'); // Custom error message
```

### Boolean Validation

```typescript
const booleanValidator = Schema.boolean()
	.coerceString() // Convert strings to boolean
	.coerceNumber() // Convert numbers to boolean
	.coerce() // Convert strings and numbers
	.optional() // Make optional
	.withMessage('Custom error'); // Custom error message

// Coercion examples:
// Strings: 'true', '1', 'yes', 'on' → true
//          'false', '0', 'no', 'off', '' → false
// Numbers: 0 → false, any other number → true
```

### Date Validation

```typescript
const dateValidator = Schema.date()
	.min(new Date('2020-01-01')) // Minimum date
	.max(new Date('2030-12-31')) // Maximum date
	.past() // Must be in the past
	.future() // Must be in the future
	.pastOrToday() // Past or today
	.futureOrToday() // Future or today
	.withinLastDays(30) // Within last N days
	.withinNextDays(30) // Within next N days
	.allowString() // Allow string conversion
	.allowNumber() // Allow timestamp conversion
	.coerce() // Allow string and number conversion
	.optional() // Make optional
	.withMessage('Custom error'); // Custom error message
```

### Array Validation

```typescript
const arrayValidator = Schema.array(Schema.string())
	.minLength(1) // Minimum array length
	.maxLength(10) // Maximum array length
	.length(2, 5) // Array length range
	.unique() // All items must be unique
	.nonempty() // Array cannot be empty
	.optional() // Make optional
	.withMessage('Custom error'); // Custom error message

// Without item validator (validates any array)
const anyArrayValidator = Schema.array();
```

### Object Validation

```typescript
const objectValidator = Schema.object({
	name: Schema.string(),
	age: Schema.number().optional(),
})
	.strict() // Disallow unknown properties
	.strip() // Remove unknown properties
	.passthrough() // Allow unknown properties (default)
	.extend({
		// Add more properties
		email: Schema.string().email(),
	})
	.pick(['name']) // Only include specified properties
	.omit(['age']) // Exclude specified properties
	.partial() // Make all properties optional
	.optional() // Make entire object optional
	.withMessage('Custom error'); // Custom error message

// Generic object (no schema)
const recordValidator = Schema.record();
```

### Union Types

```typescript
const unionValidator = Schema.union([
	Schema.string(),
	Schema.number(),
	Schema.boolean(),
]);

// Literal types
const statusValidator = Schema.union([
	Schema.literal('pending'),
	Schema.literal('approved'),
	Schema.literal('rejected'),
]);
```

### Special Validators

```typescript
// Accept any value
const anyValidator = Schema.any();

// Only accept null
const nullValidator = Schema.null();

// Only accept undefined
const undefinedValidator = Schema.undefined();

// Literal values
const literalValidator = Schema.literal('exact-value');
```

## 🎯 Advanced Examples

### Complex Nested Schema

```typescript
const addressSchema = Schema.object({
	street: Schema.string().minLength(1),
	city: Schema.string().minLength(1),
	postalCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
	country: Schema.string().length(2),
});

const userProfileSchema = Schema.object({
	// Basic info
	id: Schema.string().uuid(),
	username: Schema.string()
		.minLength(3)
		.maxLength(20)
		.pattern(/^[a-zA-Z0-9_]+$/)
		.toLowerCase(),
	email: Schema.string().email().toLowerCase(),

	// Personal info
	firstName: Schema.string().minLength(1).maxLength(50),
	lastName: Schema.string().minLength(1).maxLength(50),
	dateOfBirth: Schema.date().past(),

	// Contact info
	phoneNumber: Schema.string()
		.pattern(/^\+?[\d\s\-\(\)]+$/)
		.optional(),
	address: addressSchema.optional(),

	// Account info
	isActive: Schema.boolean(),
	role: Schema.union([
		Schema.literal('user'),
		Schema.literal('admin'),
		Schema.literal('moderator'),
	]),

	// Collections
	skills: Schema.array(Schema.string().trim().minLength(1)).unique(),
	preferences: Schema.object({
		theme: Schema.union([Schema.literal('light'), Schema.literal('dark')]),
		notifications: Schema.boolean(),
		language: Schema.string().length(2, 5),
	}).optional(),

	// Timestamps
	createdAt: Schema.date(),
	updatedAt: Schema.date(),
	lastLoginAt: Schema.date().optional(),
});

// Usage with type inference
const result = userProfileSchema.validate(userData);
if (result.success) {
	// TypeScript automatically infers the complete type
	const user = result.data; // Fully typed!
	console.log(user.username); // string
	console.log(user.address?.street); // string | undefined
}
```

### API Response Validation

```typescript
const apiResponseSchema = Schema.union([
	// Success response
	Schema.object({
		status: Schema.literal('success'),
		data: Schema.object({
			id: Schema.string(),
			name: Schema.string(),
			items: Schema.array(
				Schema.object({
					id: Schema.string(),
					title: Schema.string(),
					completed: Schema.boolean(),
				})
			),
		}),
	}),

	// Error response
	Schema.object({
		status: Schema.literal('error'),
		error: Schema.object({
			code: Schema.number().integer(),
			message: Schema.string(),
			details: Schema.any().optional(),
		}),
	}),

	// Loading response
	Schema.object({
		status: Schema.literal('loading'),
		progress: Schema.number().percentage().optional(),
	}),
]);

// Type-safe response handling
const response = await fetch('/api/data');
const data = await response.json();
const validatedResponse = apiResponseSchema.validate(data);

if (validatedResponse.success) {
	const responseData = validatedResponse.data;

	if (responseData.status === 'success') {
		// TypeScript knows this is a success response
		console.log(responseData.data.items);
	} else if (responseData.status === 'error') {
		// TypeScript knows this is an error response
		console.error(responseData.error.message);
	}
}
```

### Data Transformation Pipeline

```typescript
const userInputSchema = Schema.object({
	// Transform and validate user input
	name: Schema.string()
		.trim() // Remove whitespace
		.toLowerCase() // Convert to lowercase
		.minLength(2) // Validate length
		.pattern(/^[a-z\s]+$/), // Only lowercase letters and spaces

	email: Schema.string()
		.trim() // Remove whitespace
		.toLowerCase() // Convert to lowercase
		.email(), // Validate email format

	tags: Schema.array(
		Schema.string()
			.trim() // Trim each tag
			.toLowerCase() // Convert to lowercase
			.minLength(1) // Ensure not empty
	).unique(), // Remove duplicates

	preferences: Schema.object({
		notifications: Schema.boolean().coerce(), // Convert 'true'/'false' strings
		theme: Schema.string().toLowerCase(),
	}),
});

// Input data (potentially messy)
const userInput = {
	name: '  JOHN DOE  ',
	email: '  JOHN.DOE@EXAMPLE.COM  ',
	tags: ['  JAVASCRIPT  ', '  typescript  ', '  REACT  ', '  javascript  '],
	preferences: {
		notifications: 'true', // String that should be boolean
		theme: 'DARK',
	},
};

const result = userInputSchema.validate(userInput);
if (result.success) {
	console.log(result.data);
	// Output:
	// {
	//   name: 'john doe',
	//   email: 'john.doe@example.com',
	//   tags: ['javascript', 'typescript', 'react'],
	//   preferences: {
	//     notifications: true,
	//     theme: 'dark'
	//   }
	// }
}
```

## 🔧 Development

### Prerequisites

- Node.js 16+
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd robust-validation-library

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run in development mode with examples
npm run dev
```

### Project Structure

```
src/
├── types.ts                 # Core types and interfaces
├── Schema.ts                # Main Schema class and API
├── validators/
│   ├── BaseValidator.ts     # Abstract base validator
│   ├── StringValidator.ts   # String validation
│   ├── NumberValidator.ts   # Number validation
│   ├── BooleanValidator.ts  # Boolean validation
│   ├── DateValidator.ts     # Date validation
│   ├── ArrayValidator.ts    # Array validation
│   └── ObjectValidator.ts   # Object validation
└── index.ts                 # Main exports

tests/
├── StringValidator.test.ts  # String validator tests
├── NumberValidator.test.ts  # Number validator tests
├── ObjectValidator.test.ts  # Object validator tests
└── Integration.test.ts      # Integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest StringValidator.test.ts
```

### Building

```bash
# Build for production
npm run build

# The built files will be in the `dist/` directory
# - dist/index.js (compiled JavaScript)
# - dist/index.d.ts (TypeScript declarations)
# - dist/ (source maps)
```

## 📊 Test Coverage

The library maintains good test coverage across all validators and features:

- **Statements**: 71%
- **Branches**: 60.69%
- **Functions**: 65.21%
- **Lines**: 71.11%

Core validators (StringValidator, NumberValidator, ObjectValidator) achieve 100% coverage. The library includes 70 comprehensive tests covering all major functionality and edge cases.

Run `npm run test:coverage` to generate a detailed coverage report.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by libraries like Zod, Yup, and Joi
- Built with TypeScript for excellent developer experience
- Designed for modern JavaScript/TypeScript applications

---

Made with ❤️ by the Robust Validation Library team
