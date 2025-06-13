import {
	Validator,
	ValidationResult,
	ValidationError,
	ValidationContext,
} from '../types';

/**
 * Abstract base class for all validators providing common functionality
 */
export abstract class BaseValidator<T> implements Validator<T> {
	protected isOptional = false;
	protected customMessage?: string;

	/**
	 * Abstract method that must be implemented by concrete validators
	 */
	protected abstract validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<T>;

	/**
	 * Main validation method that handles optional values and delegates to concrete implementation
	 */
	validate(
		value: unknown,
		context: ValidationContext = { path: '', abortEarly: false }
	): ValidationResult<T> {
		// Handle optional values
		if (this.isOptional && (value === undefined || value === null)) {
			return { success: true, data: undefined as any };
		}

		// Check for required values
		if (!this.isOptional && (value === undefined || value === null)) {
			return {
				success: false,
				errors: [
					{
						path: context.path,
						message: this.customMessage || 'Value is required',
						value,
						type: 'required',
					},
				],
			};
		}

		return this.validateValue(value, context);
	}

	/**
	 * Marks this validator as optional (allows undefined/null values)
	 */
	optional(): Validator<T | undefined> {
		const validator = this.clone();
		validator.isOptional = true;
		return validator as any;
	}

	/**
	 * Sets a custom error message for this validator
	 */
	withMessage(message: string): Validator<T> {
		const validator = this.clone();
		validator.customMessage = message;
		return validator;
	}

	/**
	 * Creates a copy of this validator (should be overridden by subclasses for deep copying)
	 */
	protected clone(): BaseValidator<T> {
		const cloned = Object.create(Object.getPrototypeOf(this));
		Object.assign(cloned, this);
		return cloned;
	}

	/**
	 * Helper method to create a validation error
	 */
	protected createError(
		path: string,
		message: string,
		value: unknown,
		type: string
	): ValidationError {
		return {
			path,
			message: this.customMessage || message,
			value,
			type,
		};
	}

	/**
	 * Helper method to create a successful validation result
	 */
	protected createSuccess(data: T): ValidationResult<T> {
		return { success: true, data };
	}

	/**
	 * Helper method to create a failed validation result
	 */
	protected createFailure(errors: ValidationError[]): ValidationResult<T> {
		return { success: false, errors };
	}
}
