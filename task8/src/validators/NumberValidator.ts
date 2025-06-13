import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Validator for number values with comprehensive validation options
 */
export class NumberValidator extends BaseValidator<number> {
	private minValue?: number;
	private maxValue?: number;
	private integerOnly: boolean = false;
	private positiveOnly: boolean = false;
	private negativeOnly: boolean = false;
	private finiteOnly: boolean = true;
	private multipleOfValue?: number;

	/**
	 * Validates that the value is a number and applies all configured constraints
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<number> {
		// Check if value is a number
		if (typeof value !== 'number') {
			return this.createFailure([
				this.createError(
					context.path,
					`Expected number, got ${typeof value}`,
					value,
					'type'
				),
			]);
		}

		// Check for NaN
		if (isNaN(value)) {
			return this.createFailure([
				this.createError(context.path, 'Number cannot be NaN', value, 'nan'),
			]);
		}

		// Check for finite constraint
		if (this.finiteOnly && !isFinite(value)) {
			return this.createFailure([
				this.createError(
					context.path,
					'Number must be finite',
					value,
					'finite'
				),
			]);
		}

		// Check integer constraint
		if (this.integerOnly && !Number.isInteger(value)) {
			return this.createFailure([
				this.createError(
					context.path,
					'Number must be an integer',
					value,
					'integer'
				),
			]);
		}

		// Check positive constraint
		if (this.positiveOnly && value <= 0) {
			return this.createFailure([
				this.createError(
					context.path,
					'Number must be positive',
					value,
					'positive'
				),
			]);
		}

		// Check negative constraint
		if (this.negativeOnly && value >= 0) {
			return this.createFailure([
				this.createError(
					context.path,
					'Number must be negative',
					value,
					'negative'
				),
			]);
		}

		// Check minimum value
		if (this.minValue !== undefined && value < this.minValue) {
			return this.createFailure([
				this.createError(
					context.path,
					`Number must be at least ${this.minValue}`,
					value,
					'min'
				),
			]);
		}

		// Check maximum value
		if (this.maxValue !== undefined && value > this.maxValue) {
			return this.createFailure([
				this.createError(
					context.path,
					`Number must be at most ${this.maxValue}`,
					value,
					'max'
				),
			]);
		}

		// Check multiple constraint
		if (
			this.multipleOfValue !== undefined &&
			value % this.multipleOfValue !== 0
		) {
			return this.createFailure([
				this.createError(
					context.path,
					`Number must be a multiple of ${this.multipleOfValue}`,
					value,
					'multipleOf'
				),
			]);
		}

		return this.createSuccess(value);
	}

	/**
	 * Sets minimum value constraint
	 */
	min(value: number): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.minValue = value;
		return validator;
	}

	/**
	 * Sets maximum value constraint
	 */
	max(value: number): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.maxValue = value;
		return validator;
	}

	/**
	 * Sets both minimum and maximum value constraints
	 */
	range(min: number, max: number): NumberValidator {
		if (min > max) {
			throw new Error('Minimum value cannot be greater than maximum value');
		}
		return this.min(min).max(max);
	}

	/**
	 * Constrains the number to be an integer
	 */
	integer(): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.integerOnly = true;
		return validator;
	}

	/**
	 * Constrains the number to be positive (> 0)
	 */
	positive(): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.positiveOnly = true;
		return validator;
	}

	/**
	 * Constrains the number to be negative (< 0)
	 */
	negative(): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.negativeOnly = true;
		return validator;
	}

	/**
	 * Constrains the number to be non-negative (>= 0)
	 */
	nonnegative(): NumberValidator {
		return this.min(0);
	}

	/**
	 * Constrains the number to be non-positive (<= 0)
	 */
	nonpositive(): NumberValidator {
		return this.max(0);
	}

	/**
	 * Allows infinite values (overrides default finite constraint)
	 */
	allowInfinite(): NumberValidator {
		const validator = this.clone() as NumberValidator;
		validator.finiteOnly = false;
		return validator;
	}

	/**
	 * Constrains the number to be a multiple of the specified value
	 */
	multipleOf(value: number): NumberValidator {
		if (value <= 0) {
			throw new Error('Multiple of value must be positive');
		}
		const validator = this.clone() as NumberValidator;
		validator.multipleOfValue = value;
		return validator;
	}

	/**
	 * Constrains the number to be between 0 and 1 (inclusive)
	 */
	percentage(): NumberValidator {
		return this.range(0, 1);
	}

	/**
	 * Constrains the number to be a valid port number (1-65535)
	 */
	port(): NumberValidator {
		return this.integer().range(1, 65535);
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): NumberValidator {
		const cloned = new NumberValidator();
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.minValue = this.minValue;
		cloned.maxValue = this.maxValue;
		cloned.integerOnly = this.integerOnly;
		cloned.positiveOnly = this.positiveOnly;
		cloned.negativeOnly = this.negativeOnly;
		cloned.finiteOnly = this.finiteOnly;
		cloned.multipleOfValue = this.multipleOfValue;
		return cloned;
	}
}
