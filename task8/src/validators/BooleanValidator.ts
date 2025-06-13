import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Validator for boolean values with optional type coercion
 */
export class BooleanValidator extends BaseValidator<boolean> {
	private coerceStrings: boolean = false;
	private coerceNumbers: boolean = false;

	/**
	 * Validates that the value is a boolean or can be coerced to one
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<boolean> {
		// Check if value is already a boolean
		if (typeof value === 'boolean') {
			return this.createSuccess(value);
		}

		// Coerce string values if enabled
		if (this.coerceStrings && typeof value === 'string') {
			const lowerValue = value.toLowerCase().trim();
			if (
				lowerValue === 'true' ||
				lowerValue === '1' ||
				lowerValue === 'yes' ||
				lowerValue === 'on'
			) {
				return this.createSuccess(true);
			}
			if (
				lowerValue === 'false' ||
				lowerValue === '0' ||
				lowerValue === 'no' ||
				lowerValue === 'off' ||
				lowerValue === ''
			) {
				return this.createSuccess(false);
			}
			return this.createFailure([
				this.createError(
					context.path,
					`Cannot coerce string "${value}" to boolean`,
					value,
					'coercion'
				),
			]);
		}

		// Coerce number values if enabled
		if (this.coerceNumbers && typeof value === 'number') {
			if (isNaN(value)) {
				return this.createFailure([
					this.createError(
						context.path,
						'Cannot coerce NaN to boolean',
						value,
						'coercion'
					),
				]);
			}
			return this.createSuccess(value !== 0);
		}

		return this.createFailure([
			this.createError(
				context.path,
				`Expected boolean, got ${typeof value}`,
				value,
				'type'
			),
		]);
	}

	/**
	 * Enables coercion of string values to boolean
	 * Accepts: 'true', '1', 'yes', 'on' -> true
	 *          'false', '0', 'no', 'off', '' -> false
	 */
	coerceString(): BooleanValidator {
		const validator = this.clone() as BooleanValidator;
		validator.coerceStrings = true;
		return validator;
	}

	/**
	 * Enables coercion of number values to boolean
	 * 0 -> false, any other number -> true (NaN is invalid)
	 */
	coerceNumber(): BooleanValidator {
		const validator = this.clone() as BooleanValidator;
		validator.coerceNumbers = true;
		return validator;
	}

	/**
	 * Enables coercion of both string and number values to boolean
	 */
	coerce(): BooleanValidator {
		return this.coerceString().coerceNumber();
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): BooleanValidator {
		const cloned = new BooleanValidator();
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.coerceStrings = this.coerceStrings;
		cloned.coerceNumbers = this.coerceNumbers;
		return cloned;
	}
}
