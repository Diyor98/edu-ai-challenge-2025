import { BaseValidator } from './BaseValidator';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Validator for Date values with comprehensive validation options
 */
export class DateValidator extends BaseValidator<Date> {
	private minDate?: Date;
	private maxDate?: Date;
	private allowStrings: boolean = false;
	private allowNumbers: boolean = false;

	/**
	 * Validates that the value is a Date or can be converted to one
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<Date> {
		let dateValue: Date;

		// Check if value is already a Date
		if (value instanceof Date) {
			dateValue = value;
		}
		// Try to convert string to Date if allowed
		else if (this.allowStrings && typeof value === 'string') {
			dateValue = new Date(value);
		}
		// Try to convert number to Date if allowed (timestamp)
		else if (this.allowNumbers && typeof value === 'number') {
			dateValue = new Date(value);
		} else {
			return this.createFailure([
				this.createError(
					context.path,
					`Expected Date, got ${typeof value}`,
					value,
					'type'
				),
			]);
		}

		// Check if the Date is valid
		if (isNaN(dateValue.getTime())) {
			return this.createFailure([
				this.createError(context.path, 'Invalid date', value, 'invalid'),
			]);
		}

		// Check minimum date constraint
		if (this.minDate && dateValue < this.minDate) {
			return this.createFailure([
				this.createError(
					context.path,
					`Date must be on or after ${this.minDate.toISOString()}`,
					value,
					'min'
				),
			]);
		}

		// Check maximum date constraint
		if (this.maxDate && dateValue > this.maxDate) {
			return this.createFailure([
				this.createError(
					context.path,
					`Date must be on or before ${this.maxDate.toISOString()}`,
					value,
					'max'
				),
			]);
		}

		return this.createSuccess(dateValue);
	}

	/**
	 * Sets minimum date constraint
	 */
	min(date: Date | string | number): DateValidator {
		const validator = this.clone() as DateValidator;
		validator.minDate = this.normalizeDate(date);
		return validator;
	}

	/**
	 * Sets maximum date constraint
	 */
	max(date: Date | string | number): DateValidator {
		const validator = this.clone() as DateValidator;
		validator.maxDate = this.normalizeDate(date);
		return validator;
	}

	/**
	 * Sets both minimum and maximum date constraints
	 */
	range(
		min: Date | string | number,
		max: Date | string | number
	): DateValidator {
		const minDate = this.normalizeDate(min);
		const maxDate = this.normalizeDate(max);

		if (minDate > maxDate) {
			throw new Error('Minimum date cannot be after maximum date');
		}

		return this.min(minDate).max(maxDate);
	}

	/**
	 * Allows string values to be converted to Date
	 */
	allowString(): DateValidator {
		const validator = this.clone() as DateValidator;
		validator.allowStrings = true;
		return validator;
	}

	/**
	 * Allows number values (timestamps) to be converted to Date
	 */
	allowNumber(): DateValidator {
		const validator = this.clone() as DateValidator;
		validator.allowNumbers = true;
		return validator;
	}

	/**
	 * Allows both string and number values to be converted to Date
	 */
	coerce(): DateValidator {
		return this.allowString().allowNumber();
	}

	/**
	 * Constrains the date to be in the past
	 */
	past(): DateValidator {
		return this.max(new Date());
	}

	/**
	 * Constrains the date to be in the future
	 */
	future(): DateValidator {
		return this.min(new Date());
	}

	/**
	 * Constrains the date to be today or in the past
	 */
	pastOrToday(): DateValidator {
		const today = new Date();
		today.setHours(23, 59, 59, 999); // End of today
		return this.max(today);
	}

	/**
	 * Constrains the date to be today or in the future
	 */
	futureOrToday(): DateValidator {
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Start of today
		return this.min(today);
	}

	/**
	 * Constrains the date to be within the last N days
	 */
	withinLastDays(days: number): DateValidator {
		if (days < 0) {
			throw new Error('Days must be non-negative');
		}
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - days);
		return this.min(minDate);
	}

	/**
	 * Constrains the date to be within the next N days
	 */
	withinNextDays(days: number): DateValidator {
		if (days < 0) {
			throw new Error('Days must be non-negative');
		}
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + days);
		return this.max(maxDate);
	}

	/**
	 * Normalizes various date formats to Date object
	 */
	private normalizeDate(date: Date | string | number): Date {
		if (date instanceof Date) {
			return date;
		}
		const normalized = new Date(date);
		if (isNaN(normalized.getTime())) {
			throw new Error(`Invalid date: ${date}`);
		}
		return normalized;
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): DateValidator {
		const cloned = new DateValidator();
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.minDate = this.minDate;
		cloned.maxDate = this.maxDate;
		cloned.allowStrings = this.allowStrings;
		cloned.allowNumbers = this.allowNumbers;
		return cloned;
	}
}
