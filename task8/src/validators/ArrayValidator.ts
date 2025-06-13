import { BaseValidator } from './BaseValidator';
import {
	Validator,
	ValidationResult,
	ValidationContext,
	ValidationError,
} from '../types';

/**
 * Validator for array values with comprehensive validation options
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
	private itemValidator?: Validator<T>;
	private minLengthValue?: number;
	private maxLengthValue?: number;
	private uniqueItems: boolean = false;
	private nonEmpty: boolean = false;

	constructor(itemValidator?: Validator<T>) {
		super();
		this.itemValidator = itemValidator;
	}

	/**
	 * Validates that the value is an array and applies all configured constraints
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<T[]> {
		// Check if value is an array
		if (!Array.isArray(value)) {
			return this.createFailure([
				this.createError(
					context.path,
					`Expected array, got ${typeof value}`,
					value,
					'type'
				),
			]);
		}

		const array = value as unknown[];
		const errors: ValidationError[] = [];

		// Check non-empty constraint
		if (this.nonEmpty && array.length === 0) {
			errors.push(
				this.createError(context.path, 'Array cannot be empty', value, 'empty')
			);
		}

		// Check minimum length
		if (
			this.minLengthValue !== undefined &&
			array.length < this.minLengthValue
		) {
			errors.push(
				this.createError(
					context.path,
					`Array must have at least ${this.minLengthValue} items`,
					value,
					'minLength'
				)
			);
		}

		// Check maximum length
		if (
			this.maxLengthValue !== undefined &&
			array.length > this.maxLengthValue
		) {
			errors.push(
				this.createError(
					context.path,
					`Array must have at most ${this.maxLengthValue} items`,
					value,
					'maxLength'
				)
			);
		}

		// Check uniqueness if required
		if (this.uniqueItems) {
			const seen = new Set();
			const duplicateIndices: number[] = [];

			for (let i = 0; i < array.length; i++) {
				const serialized = JSON.stringify(array[i]);
				if (seen.has(serialized)) {
					duplicateIndices.push(i);
				} else {
					seen.add(serialized);
				}
			}

			if (duplicateIndices.length > 0) {
				errors.push(
					this.createError(
						context.path,
						`Array contains duplicate items at indices: ${duplicateIndices.join(
							', '
						)}`,
						value,
						'unique'
					)
				);
			}
		}

		// Validate individual items if item validator is provided
		const validatedItems: T[] = [];
		if (this.itemValidator) {
			for (let i = 0; i < array.length; i++) {
				const itemPath = context.path ? `${context.path}[${i}]` : `[${i}]`;
				const itemResult = this.itemValidator.validate(array[i], {
					...context,
					path: itemPath,
				});

				if (itemResult.success && itemResult.data !== undefined) {
					validatedItems.push(itemResult.data);
				} else if (itemResult.errors) {
					errors.push(...itemResult.errors);
					if (context.abortEarly) {
						break;
					}
				}
			}
		} else {
			// If no item validator, use original array items
			validatedItems.push(...(array as T[]));
		}

		if (errors.length > 0) {
			return this.createFailure(errors);
		}

		return this.createSuccess(validatedItems);
	}

	/**
	 * Sets the validator for array items
	 */
	of(itemValidator: Validator<T>): ArrayValidator<T> {
		const validator = this.clone() as ArrayValidator<T>;
		validator.itemValidator = itemValidator;
		return validator;
	}

	/**
	 * Sets minimum length constraint
	 */
	minLength(length: number): ArrayValidator<T> {
		if (length < 0) {
			throw new Error('Minimum length must be non-negative');
		}
		const validator = this.clone() as ArrayValidator<T>;
		validator.minLengthValue = length;
		return validator;
	}

	/**
	 * Sets maximum length constraint
	 */
	maxLength(length: number): ArrayValidator<T> {
		if (length < 0) {
			throw new Error('Maximum length must be non-negative');
		}
		const validator = this.clone() as ArrayValidator<T>;
		validator.maxLengthValue = length;
		return validator;
	}

	/**
	 * Sets both minimum and maximum length constraints
	 */
	length(min: number, max?: number): ArrayValidator<T> {
		let validator = this.minLength(min);
		if (max !== undefined) {
			validator = validator.maxLength(max);
		}
		return validator;
	}

	/**
	 * Requires all items in the array to be unique
	 */
	unique(): ArrayValidator<T> {
		const validator = this.clone() as ArrayValidator<T>;
		validator.uniqueItems = true;
		return validator;
	}

	/**
	 * Requires the array to be non-empty
	 */
	nonempty(): ArrayValidator<T> {
		const validator = this.clone() as ArrayValidator<T>;
		validator.nonEmpty = true;
		return validator;
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): ArrayValidator<T> {
		const cloned = new ArrayValidator<T>(this.itemValidator);
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.minLengthValue = this.minLengthValue;
		cloned.maxLengthValue = this.maxLengthValue;
		cloned.uniqueItems = this.uniqueItems;
		cloned.nonEmpty = this.nonEmpty;
		return cloned;
	}
}
