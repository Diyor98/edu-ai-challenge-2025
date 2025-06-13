import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Validator for string values with comprehensive validation options
 */
export class StringValidator extends BaseValidator<string> {
	private minLengthValue?: number;
	private maxLengthValue?: number;
	private patternValue?: RegExp;
	private allowEmptyValue: boolean = true;
	private trimValue: boolean = false;
	private transformToLowerCase: boolean = false;
	private transformToUpperCase: boolean = false;

	/**
	 * Validates that the value is a string and applies all configured constraints
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<string> {
		// Check if value is a string
		if (typeof value !== 'string') {
			return this.createFailure([
				this.createError(
					context.path,
					`Expected string, got ${typeof value}`,
					value,
					'type'
				),
			]);
		}

		let stringValue = value;

		// Apply transformations
		if (this.trimValue) {
			stringValue = stringValue.trim();
		}
		if (this.transformToLowerCase) {
			stringValue = stringValue.toLowerCase();
		}
		if (this.transformToUpperCase) {
			stringValue = stringValue.toUpperCase();
		}

		// Check empty string constraint
		if (!this.allowEmptyValue && stringValue.length === 0) {
			return this.createFailure([
				this.createError(
					context.path,
					'String cannot be empty',
					value,
					'empty'
				),
			]);
		}

		// Check minimum length
		if (
			this.minLengthValue !== undefined &&
			stringValue.length < this.minLengthValue
		) {
			return this.createFailure([
				this.createError(
					context.path,
					`String must be at least ${this.minLengthValue} characters long`,
					value,
					'minLength'
				),
			]);
		}

		// Check maximum length
		if (
			this.maxLengthValue !== undefined &&
			stringValue.length > this.maxLengthValue
		) {
			return this.createFailure([
				this.createError(
					context.path,
					`String must be at most ${this.maxLengthValue} characters long`,
					value,
					'maxLength'
				),
			]);
		}

		// Check pattern
		if (this.patternValue && !this.patternValue.test(stringValue)) {
			return this.createFailure([
				this.createError(
					context.path,
					`String does not match required pattern: ${this.patternValue.source}`,
					value,
					'pattern'
				),
			]);
		}

		return this.createSuccess(stringValue);
	}

	/**
	 * Sets minimum length constraint
	 */
	minLength(length: number): StringValidator {
		if (length < 0) {
			throw new Error('Minimum length must be non-negative');
		}
		const validator = this.clone() as StringValidator;
		validator.minLengthValue = length;
		return validator;
	}

	/**
	 * Sets maximum length constraint
	 */
	maxLength(length: number): StringValidator {
		if (length < 0) {
			throw new Error('Maximum length must be non-negative');
		}
		const validator = this.clone() as StringValidator;
		validator.maxLengthValue = length;
		return validator;
	}

	/**
	 * Sets both minimum and maximum length constraints
	 */
	length(min: number, max?: number): StringValidator {
		let validator = this.minLength(min);
		if (max !== undefined) {
			validator = validator.maxLength(max);
		}
		return validator;
	}

	/**
	 * Sets a regex pattern that the string must match
	 */
	pattern(regex: RegExp): StringValidator {
		const validator = this.clone() as StringValidator;
		validator.patternValue = regex;
		return validator;
	}

	/**
	 * Validates that the string is a valid email address
	 */
	email(): StringValidator {
		return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage(
			'Must be a valid email address'
		) as StringValidator;
	}

	/**
	 * Validates that the string is a valid URL
	 */
	url(): StringValidator {
		return this.pattern(
			/^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/
		).withMessage('Must be a valid URL') as StringValidator;
	}

	/**
	 * Validates that the string contains only alphanumeric characters
	 */
	alphanumeric(): StringValidator {
		return this.pattern(/^[a-zA-Z0-9]+$/).withMessage(
			'Must contain only alphanumeric characters'
		) as StringValidator;
	}

	/**
	 * Validates that the string is a valid UUID
	 */
	uuid(): StringValidator {
		return this.pattern(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		).withMessage('Must be a valid UUID') as StringValidator;
	}

	/**
	 * Disallows empty strings
	 */
	nonempty(): StringValidator {
		const validator = this.clone() as StringValidator;
		validator.allowEmptyValue = false;
		return validator;
	}

	/**
	 * Trims whitespace from the beginning and end of the string
	 */
	trim(): StringValidator {
		const validator = this.clone() as StringValidator;
		validator.trimValue = true;
		return validator;
	}

	/**
	 * Transforms the string to lowercase
	 */
	toLowerCase(): StringValidator {
		const validator = this.clone() as StringValidator;
		validator.transformToLowerCase = true;
		return validator;
	}

	/**
	 * Transforms the string to uppercase
	 */
	toUpperCase(): StringValidator {
		const validator = this.clone() as StringValidator;
		validator.transformToUpperCase = true;
		return validator;
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): StringValidator {
		const cloned = new StringValidator();
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.minLengthValue = this.minLengthValue;
		cloned.maxLengthValue = this.maxLengthValue;
		cloned.patternValue = this.patternValue;
		cloned.allowEmptyValue = this.allowEmptyValue;
		cloned.trimValue = this.trimValue;
		cloned.transformToLowerCase = this.transformToLowerCase;
		cloned.transformToUpperCase = this.transformToUpperCase;
		return cloned;
	}
}
