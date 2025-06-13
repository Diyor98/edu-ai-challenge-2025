import { Schema } from '../src/Schema';

describe('ObjectValidator', () => {
	describe('basic validation', () => {
		it('should validate object values', () => {
			const validator = Schema.object({
				name: Schema.string(),
				age: Schema.number(),
			});

			const result = validator.validate({ name: 'John', age: 30 });
			expect(result.success).toBe(true);
			expect(result.data).toEqual({ name: 'John', age: 30 });
		});

		it('should reject non-object values', () => {
			const validator = Schema.object({});

			expect(validator.validate('string').success).toBe(false);
			expect(validator.validate(123).success).toBe(false);
			expect(validator.validate(true).success).toBe(false);
			expect(validator.validate(null).success).toBe(false);
			expect(validator.validate(undefined).success).toBe(false);
			expect(validator.validate([]).success).toBe(false);
		});
	});

	describe('schema validation', () => {
		it('should validate against schema', () => {
			const validator = Schema.object({
				name: Schema.string().minLength(2),
				age: Schema.number().min(0),
			});

			expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
			expect(validator.validate({ name: 'J', age: 30 }).success).toBe(false);
			expect(validator.validate({ name: 'John', age: -5 }).success).toBe(false);
		});

		it('should handle missing required properties', () => {
			const validator = Schema.object({
				name: Schema.string(),
			});

			expect(validator.validate({}).success).toBe(false);
			expect(validator.validate({ name: 'John' }).success).toBe(true);
		});

		it('should handle optional properties', () => {
			const validator = Schema.object({
				name: Schema.string(),
				age: Schema.number().optional(),
			});

			expect(validator.validate({ name: 'John' }).success).toBe(true);
			expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
			expect(validator.validate({ name: 'John', age: undefined }).success).toBe(
				true
			);
		});
	});

	describe('nested objects', () => {
		it('should validate nested objects', () => {
			const addressValidator = Schema.object({
				street: Schema.string(),
				city: Schema.string(),
			});

			const userValidator = Schema.object({
				name: Schema.string(),
				address: addressValidator,
			});

			const validData = {
				name: 'John',
				address: { street: '123 Main St', city: 'Anytown' },
			};

			const invalidData = {
				name: 'John',
				address: { street: '123 Main St' }, // Missing city
			};

			expect(userValidator.validate(validData).success).toBe(true);
			expect(userValidator.validate(invalidData).success).toBe(false);
		});
	});

	describe('unknown properties handling', () => {
		const validator = Schema.object({
			name: Schema.string(),
		});

		it('should allow unknown properties by default', () => {
			const result = validator.validate({ name: 'John', extra: 'value' });
			expect(result.success).toBe(true);
			expect(result.data).toEqual({ name: 'John', extra: 'value' });
		});

		it('should reject unknown properties in strict mode', () => {
			const strictValidator = validator.strict();
			const result = strictValidator.validate({ name: 'John', extra: 'value' });
			expect(result.success).toBe(false);
		});

		it('should strip unknown properties when configured', () => {
			const stripValidator = validator.strip();
			const result = stripValidator.validate({ name: 'John', extra: 'value' });
			expect(result.success).toBe(true);
			expect(result.data).toEqual({ name: 'John' });
		});

		it('should pass through unknown properties when configured', () => {
			const passthroughValidator = validator.passthrough();
			const result = passthroughValidator.validate({
				name: 'John',
				extra: 'value',
			});
			expect(result.success).toBe(true);
			expect(result.data).toEqual({ name: 'John', extra: 'value' });
		});
	});

	describe('schema manipulation', () => {
		const baseValidator = Schema.object({
			name: Schema.string(),
			age: Schema.number(),
		});

		it('should extend schema', () => {
			const extendedValidator = baseValidator.extend({
				email: Schema.string().email(),
			});

			const result = extendedValidator.validate({
				name: 'John',
				age: 30,
				email: 'john@example.com',
			});

			expect(result.success).toBe(true);
		});

		it('should pick properties', () => {
			const pickedValidator = baseValidator.pick(['name']);

			expect(pickedValidator.validate({ name: 'John' }).success).toBe(true);
			expect(pickedValidator.validate({ name: 'John', age: 30 }).success).toBe(
				true
			); // Extra props allowed by default
		});

		it('should omit properties', () => {
			const omittedValidator = baseValidator.omit(['age']);

			expect(omittedValidator.validate({ name: 'John' }).success).toBe(true);
			// Age is omitted from schema, so validation should pass even without it
		});

		it('should make schema partial', () => {
			const partialValidator = baseValidator.partial();

			expect(partialValidator.validate({}).success).toBe(true);
			expect(partialValidator.validate({ name: 'John' }).success).toBe(true);
			expect(partialValidator.validate({ age: 30 }).success).toBe(true);
			expect(partialValidator.validate({ name: 'John', age: 30 }).success).toBe(
				true
			);
		});
	});

	describe('error handling', () => {
		it('should provide detailed error paths', () => {
			const validator = Schema.object({
				user: Schema.object({
					profile: Schema.object({
						name: Schema.string().minLength(2),
					}),
				}),
			});

			const result = validator.validate({
				user: {
					profile: {
						name: 'J',
					},
				},
			});

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].path).toBe('user.profile.name');
		});

		it('should collect multiple errors', () => {
			const validator = Schema.object({
				name: Schema.string().minLength(2),
				age: Schema.number().min(0),
			});

			const result = validator.validate({ name: 'J', age: -5 });
			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(2);
		});
	});

	describe('optional validation', () => {
		it('should handle optional objects', () => {
			const validator = Schema.object({
				name: Schema.string(),
			}).optional();

			expect(validator.validate({ name: 'John' }).success).toBe(true);
			expect(validator.validate(undefined).success).toBe(true);
			expect(validator.validate(null).success).toBe(true);
			expect(validator.validate('string').success).toBe(false);
		});
	});

	describe('custom messages', () => {
		it('should use custom error messages', () => {
			const validator = Schema.object({
				name: Schema.string(),
			}).withMessage('Custom error message');

			const result = validator.validate('not an object');
			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toBe('Custom error message');
		});
	});

	describe('edge cases', () => {
		it('should handle empty objects', () => {
			const validator = Schema.object({});

			expect(validator.validate({}).success).toBe(true);
		});

		it('should handle objects without schema', () => {
			const validator = Schema.record();

			expect(validator.validate({ any: 'value' }).success).toBe(true);
			expect(validator.validate({}).success).toBe(true);
		});

		it('should throw errors when manipulating validators without schema', () => {
			const validator = Schema.record();

			expect(() => validator.pick(['name'])).toThrow();
			expect(() => validator.omit(['name'])).toThrow();
			expect(() => validator.partial()).toThrow();
		});
	});
});
