import { Schema } from '../src/Schema';

describe('StringValidator', () => {
	describe('basic validation', () => {
		it('should validate string values', () => {
			const validator = Schema.string();

			expect(validator.validate('hello').success).toBe(true);
			expect(validator.validate('hello').data).toBe('hello');
			expect(validator.validate('').success).toBe(true);
			expect(validator.validate('').data).toBe('');
		});

		it('should reject non-string values', () => {
			const validator = Schema.string();

			expect(validator.validate(123).success).toBe(false);
			expect(validator.validate(true).success).toBe(false);
			expect(validator.validate(null).success).toBe(false);
			expect(validator.validate(undefined).success).toBe(false);
			expect(validator.validate([]).success).toBe(false);
			expect(validator.validate({}).success).toBe(false);
		});
	});

	describe('length constraints', () => {
		it('should validate minimum length', () => {
			const validator = Schema.string().minLength(3);

			expect(validator.validate('abc').success).toBe(true);
			expect(validator.validate('abcd').success).toBe(true);
			expect(validator.validate('ab').success).toBe(false);
			expect(validator.validate('').success).toBe(false);
		});

		it('should validate maximum length', () => {
			const validator = Schema.string().maxLength(3);

			expect(validator.validate('abc').success).toBe(true);
			expect(validator.validate('ab').success).toBe(true);
			expect(validator.validate('').success).toBe(true);
			expect(validator.validate('abcd').success).toBe(false);
		});

		it('should validate length range', () => {
			const validator = Schema.string().length(2, 4);

			expect(validator.validate('ab').success).toBe(true);
			expect(validator.validate('abc').success).toBe(true);
			expect(validator.validate('abcd').success).toBe(true);
			expect(validator.validate('a').success).toBe(false);
			expect(validator.validate('abcde').success).toBe(false);
		});

		it('should throw error for negative length constraints', () => {
			expect(() => Schema.string().minLength(-1)).toThrow();
			expect(() => Schema.string().maxLength(-1)).toThrow();
		});
	});

	describe('pattern validation', () => {
		it('should validate regex patterns', () => {
			const validator = Schema.string().pattern(/^\d+$/);

			expect(validator.validate('123').success).toBe(true);
			expect(validator.validate('abc').success).toBe(false);
			expect(validator.validate('123abc').success).toBe(false);
		});

		it('should validate email addresses', () => {
			const validator = Schema.string().email();

			expect(validator.validate('test@example.com').success).toBe(true);
			expect(validator.validate('user+tag@domain.co.uk').success).toBe(true);
			expect(validator.validate('invalid-email').success).toBe(false);
			expect(validator.validate('@example.com').success).toBe(false);
			expect(validator.validate('test@').success).toBe(false);
		});

		it('should validate URLs', () => {
			const validator = Schema.string().url();

			expect(validator.validate('http://example.com').success).toBe(true);
			expect(validator.validate('https://example.com/path').success).toBe(true);
			expect(validator.validate('invalid-url').success).toBe(false);
			expect(validator.validate('ftp://example.com').success).toBe(false);
		});

		it('should validate alphanumeric strings', () => {
			const validator = Schema.string().alphanumeric();

			expect(validator.validate('abc123').success).toBe(true);
			expect(validator.validate('ABC123').success).toBe(true);
			expect(validator.validate('abc-123').success).toBe(false);
			expect(validator.validate('abc 123').success).toBe(false);
		});

		it('should validate UUIDs', () => {
			const validator = Schema.string().uuid();

			expect(
				validator.validate('550e8400-e29b-41d4-a716-446655440000').success
			).toBe(true);
			expect(
				validator.validate('6ba7b810-9dad-11d1-80b4-00c04fd430c8').success
			).toBe(true);
			expect(validator.validate('invalid-uuid').success).toBe(false);
			expect(validator.validate('12345678-1234-1234-1234').success).toBe(false);
		});
	});

	describe('transformations', () => {
		it('should trim whitespace', () => {
			const validator = Schema.string().trim();

			const result = validator.validate('  hello  ');
			expect(result.success).toBe(true);
			expect(result.data).toBe('hello');
		});

		it('should transform to lowercase', () => {
			const validator = Schema.string().toLowerCase();

			const result = validator.validate('HELLO');
			expect(result.success).toBe(true);
			expect(result.data).toBe('hello');
		});

		it('should transform to uppercase', () => {
			const validator = Schema.string().toUpperCase();

			const result = validator.validate('hello');
			expect(result.success).toBe(true);
			expect(result.data).toBe('HELLO');
		});

		it('should chain transformations', () => {
			const validator = Schema.string().trim().toLowerCase();

			const result = validator.validate('  HELLO  ');
			expect(result.success).toBe(true);
			expect(result.data).toBe('hello');
		});
	});

	describe('empty string handling', () => {
		it('should allow empty strings by default', () => {
			const validator = Schema.string();

			expect(validator.validate('').success).toBe(true);
		});

		it('should reject empty strings when nonempty is used', () => {
			const validator = Schema.string().nonempty();

			expect(validator.validate('a').success).toBe(true);
			expect(validator.validate('').success).toBe(false);
		});
	});

	describe('optional validation', () => {
		it('should handle optional strings', () => {
			const validator = Schema.string().optional();

			expect(validator.validate('hello').success).toBe(true);
			expect(validator.validate(undefined).success).toBe(true);
			expect(validator.validate(null).success).toBe(true);
			expect(validator.validate(123).success).toBe(false);
		});
	});

	describe('custom messages', () => {
		it('should use custom error messages', () => {
			const validator = Schema.string().withMessage('Custom error message');

			const result = validator.validate(123);
			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toBe('Custom error message');
		});
	});

	describe('chaining methods', () => {
		it('should support method chaining', () => {
			const validator = Schema.string()
				.minLength(2)
				.maxLength(10)
				.trim()
				.toLowerCase()
				.pattern(/^[a-z]+$/)
				.withMessage('Invalid name format');

			expect(validator.validate('  HELLO  ').success).toBe(true);
			expect(validator.validate('  HI  ').success).toBe(true);
			expect(validator.validate('  H  ').success).toBe(false);
			expect(validator.validate('  HELLO123  ').success).toBe(false);
		});
	});
});
