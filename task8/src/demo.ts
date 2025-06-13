// Main Application Entry Point - Robust Validation Library Demo
// This file demonstrates the complete functionality of our type-safe validation library

// Import the comprehensive validation library
import { Schema } from './Schema';
import type { ValidationResult } from './types';

/**
 * Comprehensive demonstration of the Robust Validation Library
 *
 * This application showcases:
 * - Type-safe validation for primitive types (string, number, boolean, date)
 * - Complex type validation (arrays, objects, unions)
 * - Data transformations and sanitization
 * - Nested object validation with detailed error reporting
 * - Real-world usage patterns and best practices
 */

console.log('🚀 Robust Validation Library - Comprehensive Demo\n');

// ========================================
// 1. PRIMITIVE TYPE VALIDATORS
// ========================================

console.log('📝 1. STRING VALIDATION EXAMPLES:');

/**
 * String validator with comprehensive validation rules
 * Demonstrates: length constraints, pattern matching, transformations
 */
const nameValidator = Schema.string()
	.minLength(2) // Minimum 2 characters
	.maxLength(50) // Maximum 50 characters
	.trim() // Remove whitespace
	.toLowerCase() // Convert to lowercase
	.pattern(/^[a-z\s]+$/) // Only lowercase letters and spaces
	.withMessage('Name must be 2-50 lowercase letters');

// Test valid and invalid names
console.log('Valid name:', nameValidator.validate('  JOHN DOE  '));
console.log('Invalid name:', nameValidator.validate('J'));

/**
 * Email validator with built-in email pattern validation
 */
const emailValidator = Schema.string()
	.email() // Built-in email validation
	.toLowerCase() // Normalize to lowercase
	.withMessage('Must be a valid email address');

console.log('Valid email:', emailValidator.validate('USER@EXAMPLE.COM'));
console.log('Invalid email:', emailValidator.validate('not-an-email'));

console.log('\n🔢 2. NUMBER VALIDATION EXAMPLES:');

/**
 * Age validator with range constraints and integer requirement
 */
const ageValidator = Schema.number()
	.integer() // Must be whole number
	.min(0) // Non-negative
	.max(120) // Reasonable upper limit
	.withMessage('Age must be an integer between 0 and 120');

console.log('Valid age:', ageValidator.validate(25));
console.log('Invalid age:', ageValidator.validate(-5));

/**
 * Score validator demonstrating multiple-of constraint
 */
const scoreValidator = Schema.number()
	.multipleOf(5) // Must be divisible by 5
	.range(0, 100) // Between 0 and 100
	.withMessage('Score must be 0-100 and divisible by 5');

console.log('Valid score:', scoreValidator.validate(85));
console.log('Invalid score:', scoreValidator.validate(73));

console.log('\n✅ 3. BOOLEAN VALIDATION EXAMPLES:');

/**
 * Boolean validator with type coercion capabilities
 */
const activeStatusValidator = Schema.boolean()
	.coerce() // Convert strings/numbers to boolean
	.withMessage('Must be a valid boolean value');

console.log('Boolean from string:', activeStatusValidator.validate('true'));
console.log('Boolean from number:', activeStatusValidator.validate(1));
console.log('Invalid boolean:', activeStatusValidator.validate('maybe'));

console.log('\n📅 4. DATE VALIDATION EXAMPLES:');

/**
 * Birth date validator ensuring dates are in the past
 */
const birthDateValidator = Schema.date()
	.past() // Must be before today
	.allowString() // Accept date strings
	.withMessage('Birth date must be in the past');

console.log('Valid birth date:', birthDateValidator.validate('1990-01-01'));
console.log('Invalid birth date:', birthDateValidator.validate('2030-01-01'));

// ========================================
// 2. COMPLEX TYPE VALIDATORS
// ========================================

console.log('\n📋 5. ARRAY VALIDATION EXAMPLES:');

/**
 * Skills array validator with item validation and uniqueness
 */
const skillsValidator = Schema.array(
	Schema.string() // Each item must be a string
		.trim() // Trim whitespace from each skill
		.minLength(1) // No empty skills
		.toLowerCase() // Normalize to lowercase
)
	.unique() // No duplicate skills
	.minLength(1) // At least one skill required
	.maxLength(10) // Maximum 10 skills
	.withMessage('Skills must be 1-10 unique non-empty strings');

console.log(
	'Valid skills:',
	skillsValidator.validate(['  JavaScript  ', 'TypeScript', 'Node.js'])
);
console.log(
	'Invalid skills (duplicates):',
	skillsValidator.validate(['JavaScript', 'javascript'])
);

console.log('\n🏗️ 6. OBJECT VALIDATION EXAMPLES:');

/**
 * Address schema for nested object validation
 * Demonstrates schema composition and reusability
 */
const addressSchema = Schema.object({
	street: Schema.string()
		.minLength(1)
		.withMessage('Street address is required'),

	city: Schema.string().minLength(1).withMessage('City is required'),

	postalCode: Schema.string()
		.pattern(/^\d{5}(-\d{4})?$/) // US ZIP code format
		.withMessage('Postal code must be 5 digits or ZIP+4 format'),

	country: Schema.string()
		.minLength(2)
		.maxLength(3)
		.toUpperCase() // Normalize country code
		.withMessage('Country must be 2-3 character code'),
});

/**
 * Comprehensive user schema demonstrating advanced validation features
 * Shows: nested objects, optional fields, unions, transformations
 */
const userSchema = Schema.object({
	// Basic identification
	id: Schema.string()
		.uuid() // Must be valid UUID
		.withMessage('ID must be a valid UUID'),

	// Personal information with transformations
	name: Schema.string()
		.minLength(2)
		.maxLength(100)
		.trim()
		.withMessage('Name must be 2-100 characters'),

	email: Schema.string()
		.email() // Built-in email validation
		.toLowerCase() // Normalize email
		.withMessage('Must be a valid email address'),

	// Optional fields
	age: Schema.number()
		.min(0)
		.max(120)
		.optional() // Age is optional
		.withMessage('Age must be 0-120 if provided'),

	// Boolean with coercion
	isActive: Schema.boolean()
		.coerce() // Accept string/number input
		.withMessage('Active status must be boolean'),

	// Array validation
	skills: skillsValidator, // Reuse the skills validator

	// Nested object validation
	address: addressSchema
		.optional() // Address is optional
		.withMessage('Address must be valid if provided'),

	// Union type for role
	role: Schema.union([
		Schema.literal('user'),
		Schema.literal('admin'),
		Schema.literal('moderator'),
	]).withMessage('Role must be user, admin, or moderator'),

	// Flexible metadata object
	metadata: Schema.record() // Generic object
		.optional()
		.withMessage('Metadata must be an object if provided'),

	// Date validation
	createdAt: Schema.date()
		.allowString() // Accept ISO date strings
		.withMessage('Created date must be valid'),
});

console.log('\n🎯 7. COMPREHENSIVE USER VALIDATION:');

/**
 * Test data representing a typical user registration
 */
const validUserData = {
	id: '12345678-1234-1234-1234-123456789012',
	name: '  John Doe  ', // Will be trimmed
	email: 'JOHN@EXAMPLE.COM', // Will be lowercased
	age: 30,
	isActive: 'true', // Will be coerced to boolean
	skills: ['  JavaScript  ', 'TypeScript', 'Node.js'], // Will be trimmed and lowercased
	address: {
		street: '123 Main Street',
		city: 'New York',
		postalCode: '10001',
		country: 'us', // Will be uppercased
	},
	role: 'user',
	metadata: {
		source: 'registration',
		campaign: 'spring2024',
	},
	createdAt: '2024-01-15T10:30:00Z',
};

/**
 * Validate and demonstrate the transformation capabilities
 */
const validResult = userSchema.validate(validUserData);

if (validResult.success) {
	console.log('✅ User validation successful!');
	console.log('Transformed data:', JSON.stringify(validResult.data, null, 2));
} else {
	console.log('❌ User validation failed:', validResult.errors);
}

console.log('\n🚨 8. ERROR HANDLING DEMONSTRATION:');

/**
 * Invalid user data to demonstrate error handling
 */
const invalidUserData = {
	id: 'invalid-uuid', // Invalid UUID format
	name: 'J', // Too short
	email: 'not-an-email', // Invalid email
	age: -5, // Negative age
	isActive: 'maybe', // Invalid boolean
	skills: [], // Empty array
	address: {
		street: '', // Empty street
		city: 'New York',
		postalCode: '123', // Invalid ZIP
		country: 'United States', // Too long
	},
	role: 'superuser', // Invalid role
	createdAt: 'invalid-date', // Invalid date
};

const invalidResult = userSchema.validate(invalidUserData);

if (!invalidResult.success) {
	console.log('❌ Validation errors found:');
	invalidResult.errors?.forEach((error: any, index: number) => {
		console.log(`  ${index + 1}. ${error.path}: ${error.message}`);
	});
}

// ========================================
// 3. ADVANCED FEATURES DEMONSTRATION
// ========================================

console.log('\n🔀 9. UNION TYPE VALIDATION:');

/**
 * API response validator demonstrating discriminated unions
 */
const apiResponseSchema = Schema.union([
	// Success response
	Schema.object({
		status: Schema.literal('success'),
		data: Schema.object({
			id: Schema.string(),
			message: Schema.string(),
		}),
	}),

	// Error response
	Schema.object({
		status: Schema.literal('error'),
		error: Schema.object({
			code: Schema.number().integer(),
			message: Schema.string(),
		}),
	}),
]);

console.log(
	'Success response:',
	apiResponseSchema.validate({
		status: 'success',
		data: { id: '123', message: 'Operation completed' },
	})
);

console.log(
	'Error response:',
	apiResponseSchema.validate({
		status: 'error',
		error: { code: 404, message: 'Not found' },
	})
);

console.log('\n⚙️ 10. SCHEMA MANIPULATION:');

/**
 * Demonstrate schema manipulation methods
 */
const basePersonSchema = Schema.object({
	name: Schema.string(),
	email: Schema.string().email(),
	age: Schema.number().min(0),
});

// Make all fields optional
const optionalPersonSchema = basePersonSchema.partial();
console.log('Optional schema validation:', optionalPersonSchema.validate({}));

// Pick only specific fields
const nameOnlySchema = basePersonSchema.pick(['name']);
console.log(
	'Name-only schema validation:',
	nameOnlySchema.validate({ name: 'John' })
);

// Extend with additional fields
const extendedPersonSchema = basePersonSchema.extend({
	phone: Schema.string()
		.pattern(/^\+?[\d\s\-\(\)]+$/)
		.optional(),
});

console.log(
	'Extended schema validation:',
	extendedPersonSchema.validate({
		name: 'John',
		email: 'john@example.com',
		age: 30,
		phone: '+1-555-123-4567',
	})
);

console.log('\n🏆 VALIDATION LIBRARY DEMO COMPLETED!');
console.log('\n📊 Library Features Demonstrated:');
console.log(
	'✅ Type-safe primitive validators (string, number, boolean, date)'
);
console.log('✅ Complex type validators (arrays, objects, unions)');
console.log('✅ Data transformations and sanitization');
console.log('✅ Nested object validation');
console.log('✅ Comprehensive error reporting');
console.log('✅ Schema composition and reusability');
console.log('✅ Optional and required field handling');
console.log('✅ Custom error messages');
console.log('✅ Schema manipulation (partial, pick, extend)');
console.log('✅ Union and literal type validation');
console.log('\n🎯 Ready for production use!');
