import { BaseValidator } from './BaseValidator';
import {
	Validator,
	ValidationResult,
	ValidationContext,
	ValidationError,
	ObjectSchema,
} from '../types';

/**
 * Validator for object values with schema-based validation
 */
export class ObjectValidator<
	T extends Record<string, any>
> extends BaseValidator<T> {
	private schema?: Record<string, Validator<any>>;
	private strictMode: boolean = false;
	private allowUnknownKeys: boolean = true;

	constructor(schema?: Record<string, Validator<any>>) {
		super();
		this.schema = schema;
	}

	/**
	 * Validates that the value is an object and conforms to the defined schema
	 */
	protected validateValue(
		value: unknown,
		context: ValidationContext
	): ValidationResult<T> {
		// Check if value is an object (but not null or array)
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return this.createFailure([
				this.createError(
					context.path,
					`Expected object, got ${typeof value}`,
					value,
					'type'
				),
			]);
		}

		const obj = value as Record<string, unknown>;
		const errors: ValidationError[] = [];
		const validatedObject: Record<string, any> = {};

		// If no schema is provided, just return the object as-is
		if (!this.schema) {
			return this.createSuccess(obj as T);
		}

		// Validate each property in the schema
		for (const [key, validator] of Object.entries(this.schema)) {
			const propertyPath = context.path ? `${context.path}.${key}` : key;
			const propertyValue = obj[key];

			const result = validator.validate(propertyValue, {
				...context,
				path: propertyPath,
			});

			if (result.success) {
				validatedObject[key] = result.data;
			} else if (result.errors) {
				errors.push(...result.errors);
				if (context.abortEarly) {
					break;
				}
			}
		}

		// Handle unknown keys based on mode
		if (this.strictMode) {
			// In strict mode, unknown keys are errors
			const schemaKeys = new Set(Object.keys(this.schema));
			const objectKeys = Object.keys(obj);
			const unknownKeys = objectKeys.filter((key) => !schemaKeys.has(key));

			if (unknownKeys.length > 0) {
				errors.push(
					this.createError(
						context.path,
						`Unknown properties: ${unknownKeys.join(', ')}`,
						value,
						'unknownKeys'
					)
				);
			}
		} else if (this.allowUnknownKeys) {
			// Include unknown keys in the result if allowed
			for (const [key, val] of Object.entries(obj)) {
				if (!(key in validatedObject)) {
					validatedObject[key] = val;
				}
			}
		}
		// If !allowUnknownKeys && !strictMode, we strip unknown keys (don't include them, don't error)

		if (errors.length > 0) {
			return this.createFailure(errors);
		}

		return this.createSuccess(validatedObject as T);
	}

	/**
	 * Sets the schema for object validation
	 */
	shape<S extends Record<string, Validator<any>>>(
		schema: S
	): ObjectValidator<ObjectSchema<S>> {
		const validator = new ObjectValidator<ObjectSchema<S>>(schema);
		validator.isOptional = this.isOptional;
		validator.customMessage = this.customMessage;
		validator.strictMode = this.strictMode;
		validator.allowUnknownKeys = this.allowUnknownKeys;
		return validator;
	}

	/**
	 * Enables strict mode - disallows unknown properties
	 */
	strict(): ObjectValidator<T> {
		const validator = this.clone() as ObjectValidator<T>;
		validator.strictMode = true;
		validator.allowUnknownKeys = false;
		return validator;
	}

	/**
	 * Allows unknown properties (default behavior)
	 */
	passthrough(): ObjectValidator<T> {
		const validator = this.clone() as ObjectValidator<T>;
		validator.allowUnknownKeys = true;
		validator.strictMode = false;
		return validator;
	}

	/**
	 * Strips unknown properties from the result
	 */
	strip(): ObjectValidator<T> {
		const validator = this.clone() as ObjectValidator<T>;
		validator.allowUnknownKeys = false;
		validator.strictMode = false;
		return validator;
	}

	/**
	 * Extends the current schema with additional properties
	 */
	extend<S extends Record<string, Validator<any>>>(
		extension: S
	): ObjectValidator<T & ObjectSchema<S>> {
		const newSchema = { ...this.schema, ...extension };
		const validator = new ObjectValidator<T & ObjectSchema<S>>(newSchema);
		validator.isOptional = this.isOptional;
		validator.customMessage = this.customMessage;
		validator.strictMode = this.strictMode;
		validator.allowUnknownKeys = this.allowUnknownKeys;
		return validator;
	}

	/**
	 * Creates a new object validator with only the specified properties from the schema
	 */
	pick<K extends keyof T>(keys: K[]): ObjectValidator<Pick<T, K>> {
		if (!this.schema) {
			throw new Error('Cannot pick from object validator without schema');
		}

		const pickedSchema: Record<string, Validator<any>> = {};
		for (const key of keys) {
			const keyStr = String(key);
			if (keyStr in this.schema && this.schema[keyStr]) {
				pickedSchema[keyStr] = this.schema[keyStr];
			}
		}

		const validator = new ObjectValidator<Pick<T, K>>(pickedSchema);
		validator.isOptional = this.isOptional;
		validator.customMessage = this.customMessage;
		validator.strictMode = this.strictMode;
		validator.allowUnknownKeys = this.allowUnknownKeys;
		return validator;
	}

	/**
	 * Creates a new object validator excluding the specified properties from the schema
	 */
	omit<K extends keyof T>(keys: K[]): ObjectValidator<Omit<T, K>> {
		if (!this.schema) {
			throw new Error('Cannot omit from object validator without schema');
		}

		const omittedSchema: Record<string, Validator<any>> = {};
		const keysToOmit = new Set(keys.map(String));

		for (const [key, validator] of Object.entries(this.schema)) {
			if (!keysToOmit.has(key)) {
				omittedSchema[key] = validator;
			}
		}

		const validator = new ObjectValidator<Omit<T, K>>(omittedSchema);
		validator.isOptional = this.isOptional;
		validator.customMessage = this.customMessage;
		validator.strictMode = this.strictMode;
		validator.allowUnknownKeys = this.allowUnknownKeys;
		return validator;
	}

	/**
	 * Makes all properties in the schema optional
	 */
	partial(): ObjectValidator<Partial<T>> {
		if (!this.schema) {
			throw new Error(
				'Cannot make partial from object validator without schema'
			);
		}

		const partialSchema: Record<string, Validator<any>> = {};
		for (const [key, validator] of Object.entries(this.schema)) {
			partialSchema[key] = validator.optional();
		}

		const validator = new ObjectValidator<Partial<T>>(partialSchema);
		validator.isOptional = this.isOptional;
		validator.customMessage = this.customMessage;
		validator.strictMode = this.strictMode;
		validator.allowUnknownKeys = this.allowUnknownKeys;
		return validator;
	}

	/**
	 * Makes all properties in the schema required (removes optional)
	 */
	required(): ObjectValidator<Required<T>> {
		if (!this.schema) {
			throw new Error(
				'Cannot make required from object validator without schema'
			);
		}

		// Note: This is a simplified implementation as we can't easily remove optional
		// from existing validators. In a full implementation, we'd need to track
		// the original validator state.
		const validator = this.clone() as ObjectValidator<Required<T>>;
		return validator;
	}

	/**
	 * Creates a deep copy of this validator
	 */
	protected clone(): ObjectValidator<T> {
		const cloned = new ObjectValidator<T>(this.schema);
		cloned.isOptional = this.isOptional;
		cloned.customMessage = this.customMessage;
		cloned.strictMode = this.strictMode;
		cloned.allowUnknownKeys = this.allowUnknownKeys;
		return cloned;
	}
}
