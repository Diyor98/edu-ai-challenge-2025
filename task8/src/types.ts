/**
 * Represents the result of a validation operation
 */
export interface ValidationResult<T> {
	/** Whether the validation was successful */
	success: boolean;
	/** The validated data (only present if validation succeeded) */
	data?: T;
	/** Array of validation errors (only present if validation failed) */
	errors?: ValidationError[];
}

/**
 * Represents a validation error with details about what went wrong
 */
export interface ValidationError {
	/** The path to the field that failed validation */
	path: string;
	/** The error message describing what went wrong */
	message: string;
	/** The actual value that failed validation */
	value: unknown;
	/** The type of validation that failed */
	type: string;
}

/**
 * Base interface for all validator implementations
 */
export interface Validator<T> {
	/** Validates the given value and returns a ValidationResult */
	validate(value: unknown, context?: ValidationContext): ValidationResult<T>;
	/** Marks this validator as optional (allows undefined values) */
	optional(): Validator<T | undefined>;
	/** Sets a custom error message for this validator */
	withMessage(message: string): Validator<T>;
}

/**
 * Configuration for validation context
 */
export interface ValidationContext {
	/** The current path being validated (for nested objects) */
	path: string;
	/** Whether to stop on first error or collect all errors */
	abortEarly: boolean;
}

/**
 * Type utility to extract the type from a validator
 */
export type InferType<T> = T extends Validator<infer U> ? U : never;

/**
 * Type utility to create an object schema type from a schema definition
 */
export type ObjectSchema<T extends Record<string, Validator<any>>> = {
	[K in keyof T]: InferType<T[K]>;
};
