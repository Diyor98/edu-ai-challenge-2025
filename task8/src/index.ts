// Main exports
export { Schema } from './Schema';
export * from './types';

// Validator exports for advanced usage
export { BaseValidator } from './validators/BaseValidator';
export { StringValidator } from './validators/StringValidator';
export { NumberValidator } from './validators/NumberValidator';
export { BooleanValidator } from './validators/BooleanValidator';
export { DateValidator } from './validators/DateValidator';
export { ArrayValidator } from './validators/ArrayValidator';
export { ObjectValidator } from './validators/ObjectValidator';

// Import Schema for default export and examples
import { Schema } from './Schema';

// Convenience re-export of the main Schema class
export default Schema;

// Example usage and type inference demonstration
if (require.main === module) {
	console.log('🚀 Robust Validation Library Examples\n');

	// Define a complex schema
	const addressSchema = Schema.object({
		street: Schema.string().minLength(1),
		city: Schema.string().minLength(1),
		postalCode: Schema.string()
			.pattern(/^\d{5}$/)
			.withMessage('Postal code must be 5 digits'),
		country: Schema.string(),
	});

	const userSchema = Schema.object({
		id: Schema.string().uuid().withMessage('ID must be a valid UUID'),
		name: Schema.string().minLength(2).maxLength(50),
		email: Schema.string().email(),
		age: Schema.number().min(0).max(120).optional(),
		isActive: Schema.boolean(),
		tags: Schema.array(Schema.string()).unique(),
		address: addressSchema.optional(),
		metadata: Schema.record().optional(),
		createdAt: Schema.date().past(),
	});

	// Test data
	const validUserData = {
		id: '12345678-1234-1234-1234-123456789012',
		name: 'John Doe',
		email: 'john@example.com',
		age: 30,
		isActive: true,
		tags: ['developer', 'designer'],
		address: {
			street: '123 Main St',
			city: 'Anytown',
			postalCode: '12345',
			country: 'USA',
		},
		metadata: { role: 'admin' },
		createdAt: new Date('2023-01-01'),
	};

	const invalidUserData = {
		id: 'invalid-uuid',
		name: 'J', // Too short
		email: 'invalid-email',
		age: -5, // Negative age
		isActive: 'yes', // Wrong type
		tags: ['developer', 'developer'], // Duplicates
		address: {
			street: '',
			city: 'Anytown',
			postalCode: '1234', // Wrong format
			country: 'USA',
		},
		createdAt: new Date('2025-01-01'), // Future date
	};

	console.log('✅ Validating valid user data:');
	const validResult = userSchema.validate(validUserData);
	console.log('Success:', validResult.success);
	if (validResult.success) {
		console.log('Validated data keys:', Object.keys(validResult.data!));
	}
	console.log();

	console.log('❌ Validating invalid user data:');
	const invalidResult = userSchema.validate(invalidUserData);
	console.log('Success:', invalidResult.success);
	if (!invalidResult.success && invalidResult.errors) {
		console.log('Errors found:');
		invalidResult.errors.forEach((error: any, index: number) => {
			console.log(`  ${index + 1}. ${error.path}: ${error.message}`);
		});
	}
	console.log();

	// Demonstrate string transformations
	console.log('🔄 String transformation example:');
	const nameTransformValidator = Schema.string()
		.trim()
		.toLowerCase()
		.minLength(2);
	const nameResult = nameTransformValidator.validate('  JOHN DOE  ');
	console.log('Original:', '"  JOHN DOE  "');
	console.log(
		'Transformed:',
		nameResult.success ? `"${nameResult.data}"` : 'Failed'
	);
	console.log();

	// Demonstrate array validation
	console.log('📋 Array validation example:');
	const numbersValidator = Schema.array(Schema.number().positive())
		.minLength(1)
		.unique();
	const numbersResult = numbersValidator.validate([1, 2, 3, 4, 5]);
	console.log('Numbers valid:', numbersResult.success);
	console.log();

	// Demonstrate union types
	console.log('🔀 Union type example:');
	const stringOrNumberValidator = Schema.union([
		Schema.string().minLength(1),
		Schema.number().positive(),
	]);
	console.log(
		'String validation:',
		stringOrNumberValidator.validate('hello').success
	);
	console.log(
		'Number validation:',
		stringOrNumberValidator.validate(42).success
	);
	console.log(
		'Invalid validation:',
		stringOrNumberValidator.validate(null).success
	);
	console.log();

	console.log('🎉 Examples completed successfully!');
}
