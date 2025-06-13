import { StringValidator } from './validators/StringValidator';
import { NumberValidator } from './validators/NumberValidator';
import { BooleanValidator } from './validators/BooleanValidator';
import { DateValidator } from './validators/DateValidator';
import { ArrayValidator } from './validators/ArrayValidator';
import { ObjectValidator } from './validators/ObjectValidator';
import { Validator, ObjectSchema } from './types';

/**
 * Main Schema class providing static factory methods for creating validators
 * This is the primary API entry point for the validation library
 */
export class Schema {
	/**
	 * Creates a string validator
	 * @example
	 * const nameValidator = Schema.string().minLength(2).maxLength(50);
	 */
	static string(): StringValidator {
		return new StringValidator();
	}

	/**
	 * Creates a number validator
	 * @example
	 * const ageValidator = Schema.number().min(0).max(120);
	 */
	static number(): NumberValidator {
		return new NumberValidator();
	}

	/**
	 * Creates a boolean validator
	 * @example
	 * const isActiveValidator = Schema.boolean();
	 */
	static boolean(): BooleanValidator {
		return new BooleanValidator();
	}

	/**
	 * Creates a date validator
	 * @example
	 * const birthDateValidator = Schema.date().past();
	 */
	static date(): DateValidator {
		return new DateValidator();
	}

	/**
	 * Creates an array validator
	 * @param itemValidator Optional validator for array items
	 * @example
	 * const stringArrayValidator = Schema.array(Schema.string());
	 */
	static array<T>(itemValidator?: Validator<T>): ArrayValidator<T> {
		return new ArrayValidator<T>(itemValidator);
	}

	/**
	 * Creates an object validator with the specified schema
	 * @param schema Object schema defining the structure and validation rules
	 * @example
	 * const userValidator = Schema.object({
	 *   name: Schema.string(),
	 *   age: Schema.number().optional()
	 * });
	 */
	static object<T extends Record<string, Validator<any>>>(
		schema: T
	): ObjectValidator<ObjectSchema<T>> {
		return new ObjectValidator<ObjectSchema<T>>(schema);
	}

	/**
	 * Creates an object validator without a predefined schema
	 * Useful when you want to define the schema later or for generic objects
	 * @example
	 * const genericValidator = Schema.record().strict();
	 */
	static record(): ObjectValidator<Record<string, any>> {
		return new ObjectValidator<Record<string, any>>();
	}

	/**
	 * Creates a validator that accepts any value (useful for metadata fields)
	 * @example
	 * const metadataValidator = Schema.any();
	 */
	static any(): Validator<any> {
		return {
			validate: (value: unknown) => ({ success: true, data: value }),
			optional: () => Schema.any(),
			withMessage: () => Schema.any(),
		};
	}

	/**
	 * Creates a validator that only accepts undefined values
	 * @example
	 * const undefinedValidator = Schema.undefined();
	 */
	static undefined(): Validator<undefined> {
		return {
			validate: (value: unknown) =>
				value === undefined
					? { success: true, data: undefined }
					: {
							success: false,
							errors: [
								{
									path: '',
									message: 'Expected undefined',
									value,
									type: 'undefined',
								},
							],
					  },
			optional: () => Schema.undefined(),
			withMessage: (message: string) => Schema.undefined(),
		};
	}

	/**
	 * Creates a validator that only accepts null values
	 * @example
	 * const nullValidator = Schema.null();
	 */
	static null(): Validator<null> {
		return {
			validate: (value: unknown) =>
				value === null
					? { success: true, data: null }
					: {
							success: false,
							errors: [
								{ path: '', message: 'Expected null', value, type: 'null' },
							],
					  },
			optional: () => Schema.null(),
			withMessage: (message: string) => Schema.null(),
		};
	}

	/**
	 * Creates a validator that accepts literal values
	 * @param literal The exact value that should be matched
	 * @example
	 * const statusValidator = Schema.literal('active');
	 */
	static literal<T extends string | number | boolean>(
		literal: T
	): Validator<T> {
		return {
			validate: (value: unknown) =>
				value === literal
					? { success: true, data: literal }
					: {
							success: false,
							errors: [
								{
									path: '',
									message: `Expected literal ${literal}`,
									value,
									type: 'literal',
								},
							],
					  },
			optional: function () {
				const optionalValidator = { ...this };
				const originalValidate = this.validate;
				optionalValidator.validate = (value: unknown) =>
					value === undefined || value === null
						? { success: true, data: undefined as any }
						: originalValidate(value);
				return optionalValidator as any;
			},
			withMessage: function (message: string) {
				const customValidator = { ...this };
				const originalValidate = this.validate;
				customValidator.validate = (value: unknown) => {
					const result = originalValidate(value);
					if (!result.success && result.errors) {
						result.errors = result.errors.map((error: any) => ({
							...error,
							message,
						}));
					}
					return result;
				};
				return customValidator;
			},
		};
	}

	/**
	 * Creates a union validator that accepts any of the provided validators
	 * @param validators Array of validators to union
	 * @example
	 * const stringOrNumberValidator = Schema.union([Schema.string(), Schema.number()]);
	 */
	static union<T extends readonly Validator<any>[]>(
		validators: T
	): Validator<T[number] extends Validator<infer U> ? U : never> {
		return {
			validate: (value: unknown) => {
				const errors: any[] = [];

				for (const validator of validators) {
					const result = validator.validate(value);
					if (result.success) {
						return result;
					}
					if (result.errors) {
						errors.push(...result.errors);
					}
				}

				return {
					success: false,
					errors: [
						{
							path: '',
							message: `Value does not match any of the union types`,
							value,
							type: 'union',
						},
					],
				};
			},
			optional: function () {
				const optionalValidator = { ...this };
				const originalValidate = this.validate;
				optionalValidator.validate = (value: unknown) =>
					value === undefined || value === null
						? { success: true, data: undefined as any }
						: originalValidate(value);
				return optionalValidator as any;
			},
			withMessage: function (message: string) {
				const customValidator = { ...this };
				const originalValidate = this.validate;
				customValidator.validate = (value: unknown) => {
					const result = originalValidate(value);
					if (!result.success && result.errors) {
						result.errors = result.errors.map((error: any) => ({
							...error,
							message,
						}));
					}
					return result;
				};
				return customValidator;
			},
		};
	}
}
