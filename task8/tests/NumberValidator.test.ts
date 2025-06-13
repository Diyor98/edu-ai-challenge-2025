import { Schema } from '../src/Schema';

describe('NumberValidator', () => {
	describe('basic validation', () => {
		it('should validate number values', () => {
			const validator = Schema.number();

			expect(validator.validate(123).success).toBe(true);
			expect(validator.validate(123).data).toBe(123);
			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(-123).success).toBe(true);
			expect(validator.validate(3.14).success).toBe(true);
		});

		it('should reject non-number values', () => {
			const validator = Schema.number();

			expect(validator.validate('123').success).toBe(false);
			expect(validator.validate(true).success).toBe(false);
			expect(validator.validate(null).success).toBe(false);
			expect(validator.validate(undefined).success).toBe(false);
			expect(validator.validate([]).success).toBe(false);
			expect(validator.validate({}).success).toBe(false);
		});

		it('should reject NaN by default', () => {
			const validator = Schema.number();

			expect(validator.validate(NaN).success).toBe(false);
		});

		it('should reject infinite values by default', () => {
			const validator = Schema.number();

			expect(validator.validate(Infinity).success).toBe(false);
			expect(validator.validate(-Infinity).success).toBe(false);
		});
	});

	describe('range constraints', () => {
		it('should validate minimum values', () => {
			const validator = Schema.number().min(10);

			expect(validator.validate(10).success).toBe(true);
			expect(validator.validate(15).success).toBe(true);
			expect(validator.validate(9).success).toBe(false);
		});

		it('should validate maximum values', () => {
			const validator = Schema.number().max(10);

			expect(validator.validate(10).success).toBe(true);
			expect(validator.validate(5).success).toBe(true);
			expect(validator.validate(11).success).toBe(false);
		});

		it('should validate number ranges', () => {
			const validator = Schema.number().range(5, 10);

			expect(validator.validate(5).success).toBe(true);
			expect(validator.validate(7).success).toBe(true);
			expect(validator.validate(10).success).toBe(true);
			expect(validator.validate(4).success).toBe(false);
			expect(validator.validate(11).success).toBe(false);
		});

		it('should throw error for invalid ranges', () => {
			expect(() => Schema.number().range(10, 5)).toThrow();
		});
	});

	describe('integer validation', () => {
		it('should validate integers', () => {
			const validator = Schema.number().integer();

			expect(validator.validate(123).success).toBe(true);
			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(-123).success).toBe(true);
			expect(validator.validate(3.14).success).toBe(false);
			expect(validator.validate(3.0).success).toBe(true);
		});
	});

	describe('sign constraints', () => {
		it('should validate positive numbers', () => {
			const validator = Schema.number().positive();

			expect(validator.validate(1).success).toBe(true);
			expect(validator.validate(0.1).success).toBe(true);
			expect(validator.validate(0).success).toBe(false);
			expect(validator.validate(-1).success).toBe(false);
		});

		it('should validate negative numbers', () => {
			const validator = Schema.number().negative();

			expect(validator.validate(-1).success).toBe(true);
			expect(validator.validate(-0.1).success).toBe(true);
			expect(validator.validate(0).success).toBe(false);
			expect(validator.validate(1).success).toBe(false);
		});

		it('should validate non-negative numbers', () => {
			const validator = Schema.number().nonnegative();

			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(1).success).toBe(true);
			expect(validator.validate(-1).success).toBe(false);
		});

		it('should validate non-positive numbers', () => {
			const validator = Schema.number().nonpositive();

			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(-1).success).toBe(true);
			expect(validator.validate(1).success).toBe(false);
		});
	});

	describe('special number handling', () => {
		it('should allow infinite values when enabled', () => {
			const validator = Schema.number().allowInfinite();

			expect(validator.validate(Infinity).success).toBe(true);
			expect(validator.validate(-Infinity).success).toBe(true);
			expect(validator.validate(123).success).toBe(true);
		});
	});

	describe('multiple validation', () => {
		it('should validate multiples', () => {
			const validator = Schema.number().multipleOf(5);

			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(5).success).toBe(true);
			expect(validator.validate(10).success).toBe(true);
			expect(validator.validate(15).success).toBe(true);
			expect(validator.validate(3).success).toBe(false);
			expect(validator.validate(7).success).toBe(false);
		});

		it('should throw error for non-positive multiple values', () => {
			expect(() => Schema.number().multipleOf(0)).toThrow();
			expect(() => Schema.number().multipleOf(-5)).toThrow();
		});
	});

	describe('convenience methods', () => {
		it('should validate percentages', () => {
			const validator = Schema.number().percentage();

			expect(validator.validate(0).success).toBe(true);
			expect(validator.validate(0.5).success).toBe(true);
			expect(validator.validate(1).success).toBe(true);
			expect(validator.validate(-0.1).success).toBe(false);
			expect(validator.validate(1.1).success).toBe(false);
		});

		it('should validate port numbers', () => {
			const validator = Schema.number().port();

			expect(validator.validate(80).success).toBe(true);
			expect(validator.validate(8080).success).toBe(true);
			expect(validator.validate(65535).success).toBe(true);
			expect(validator.validate(0).success).toBe(false);
			expect(validator.validate(65536).success).toBe(false);
			expect(validator.validate(80.5).success).toBe(false);
		});
	});

	describe('optional validation', () => {
		it('should handle optional numbers', () => {
			const validator = Schema.number().optional();

			expect(validator.validate(123).success).toBe(true);
			expect(validator.validate(undefined).success).toBe(true);
			expect(validator.validate(null).success).toBe(true);
			expect(validator.validate('123').success).toBe(false);
		});
	});

	describe('custom messages', () => {
		it('should use custom error messages', () => {
			const validator = Schema.number().withMessage('Custom error message');

			const result = validator.validate('not a number');
			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toBe('Custom error message');
		});
	});

	describe('chaining methods', () => {
		it('should support method chaining', () => {
			const validator = Schema.number()
				.integer()
				.positive()
				.min(1)
				.max(100)
				.multipleOf(5)
				.withMessage('Invalid score');

			expect(validator.validate(5).success).toBe(true);
			expect(validator.validate(50).success).toBe(true);
			expect(validator.validate(100).success).toBe(true);
			expect(validator.validate(0).success).toBe(false); // Not positive
			expect(validator.validate(3).success).toBe(false); // Not multiple of 5
			expect(validator.validate(5.5).success).toBe(false); // Not integer
			expect(validator.validate(105).success).toBe(false); // Above max
		});
	});
});
