import { Schema } from '../src/Schema';

describe('Integration Tests', () => {
	describe('complex real-world schemas', () => {
		it('should validate a complete user profile', () => {
			// Define nested schemas
			const addressSchema = Schema.object({
				street: Schema.string().minLength(1),
				city: Schema.string().minLength(1),
				postalCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
				country: Schema.string().minLength(2),
			});

			const companySchema = Schema.object({
				name: Schema.string().minLength(1),
				industry: Schema.string(),
				size: Schema.union([
					Schema.literal('startup'),
					Schema.literal('small'),
					Schema.literal('medium'),
					Schema.literal('large'),
					Schema.literal('enterprise'),
				]),
			});

			const userSchema = Schema.object({
				// Basic info
				id: Schema.string().uuid(),
				username: Schema.string()
					.minLength(3)
					.maxLength(20)
					.pattern(/^[a-zA-Z0-9_]+$/)
					.toLowerCase(),
				email: Schema.string().email().toLowerCase(),
				displayName: Schema.string().minLength(1).maxLength(50).optional(),

				// Personal info
				firstName: Schema.string().minLength(1).maxLength(50),
				lastName: Schema.string().minLength(1).maxLength(50),
				dateOfBirth: Schema.date().past(),

				// Contact info
				phoneNumber: Schema.string()
					.pattern(/^\+?[\d\s\-\(\)]+$/)
					.optional(),
				address: addressSchema.optional(),

				// Professional info
				company: companySchema.optional(),
				jobTitle: Schema.string().optional(),
				skills: Schema.array(Schema.string().trim().minLength(1)).unique(),

				// Account info
				isActive: Schema.boolean(),
				isPremium: Schema.boolean(),
				subscriptionType: Schema.union([
					Schema.literal('free'),
					Schema.literal('basic'),
					Schema.literal('premium'),
					Schema.literal('enterprise'),
				]),

				// Timestamps
				createdAt: Schema.date(),
				updatedAt: Schema.date(),
				lastLoginAt: Schema.date().optional(),

				// Metadata
				metadata: Schema.record().optional(),
				preferences: Schema.object({
					theme: Schema.union([
						Schema.literal('light'),
						Schema.literal('dark'),
					]),
					notifications: Schema.boolean(),
					newsletter: Schema.boolean(),
				}).optional(),
			});

			// Valid user data
			const validUser = {
				id: '550e8400-e29b-41d4-a716-446655440000',
				username: 'JOHN_DOE123',
				email: 'JOHN.DOE@EXAMPLE.COM',
				displayName: 'John Doe',
				firstName: 'John',
				lastName: 'Doe',
				dateOfBirth: new Date('1990-01-01'),
				phoneNumber: '+1 (555) 123-4567',
				address: {
					street: '123 Main Street',
					city: 'Anytown',
					postalCode: '12345-6789',
					country: 'US',
				},
				company: {
					name: 'Tech Corp',
					industry: 'Technology',
					size: 'medium' as const,
				},
				jobTitle: 'Software Engineer',
				skills: ['  JavaScript  ', 'TypeScript', 'Node.js', 'React'],
				isActive: true,
				isPremium: true,
				subscriptionType: 'premium' as const,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-12-01'),
				lastLoginAt: new Date('2023-12-15'),
				metadata: {
					source: 'registration',
					utm_campaign: 'holiday2023',
				},
				preferences: {
					theme: 'dark' as const,
					notifications: true,
					newsletter: false,
				},
			};

			const result = userSchema.validate(validUser);

			expect(result.success).toBe(true);
			expect(result.data?.username).toBe('john_doe123'); // Transformed to lowercase
			expect(result.data?.email).toBe('john.doe@example.com'); // Transformed to lowercase
			expect(result.data?.skills).toEqual([
				'JavaScript',
				'TypeScript',
				'Node.js',
				'React',
			]); // Trimmed
		});

		it('should handle validation errors gracefully', () => {
			const userSchema = Schema.object({
				name: Schema.string().minLength(2),
				email: Schema.string().email(),
				age: Schema.number().min(18),
				tags: Schema.array(Schema.string()).unique(),
			});

			const invalidUser = {
				name: 'J', // Too short
				email: 'invalid-email', // Invalid format
				age: 15, // Too young
				tags: ['dev', 'dev'], // Duplicates
			};

			const result = userSchema.validate(invalidUser);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(4);

			const errorPaths = result.errors!.map((e) => e.path);
			expect(errorPaths).toContain('name');
			expect(errorPaths).toContain('email');
			expect(errorPaths).toContain('age');
			expect(errorPaths).toContain('tags');
		});
	});

	describe('nested validation with transformations', () => {
		it('should handle deep nested objects with transformations', () => {
			const schema = Schema.object({
				user: Schema.object({
					profile: Schema.object({
						name: Schema.string().trim().toLowerCase(),
						bio: Schema.string().trim().optional(),
					}),
					settings: Schema.object({
						theme: Schema.string().toLowerCase(),
						notifications: Schema.boolean(),
					}),
				}),
				tags: Schema.array(Schema.string().trim().toLowerCase()).unique(),
			});

			const data = {
				user: {
					profile: {
						name: '  JOHN DOE  ',
						bio: '  Software developer with 10 years of experience.  ',
					},
					settings: {
						theme: 'DARK',
						notifications: true,
					},
				},
				tags: ['  JAVASCRIPT  ', '  typescript  ', '  REACT  '],
			};

			const result = schema.validate(data);

			expect(result.success).toBe(true);
			expect(result.data?.user.profile.name).toBe('john doe');
			expect(result.data?.user.profile.bio).toBe(
				'Software developer with 10 years of experience.'
			);
			expect(result.data?.user.settings.theme).toBe('dark');
			expect(result.data?.user.settings.notifications).toBe(true);
			expect(result.data?.tags).toEqual(['javascript', 'typescript', 'react']);
		});
	});

	describe('union and literal types', () => {
		it('should validate complex union types', () => {
			const apiResponseSchema = Schema.union([
				// Success response
				Schema.object({
					status: Schema.literal('success'),
					data: Schema.object({
						id: Schema.string(),
						name: Schema.string(),
					}),
				}),
				// Error response
				Schema.object({
					status: Schema.literal('error'),
					error: Schema.object({
						code: Schema.number(),
						message: Schema.string(),
					}),
				}),
				// Loading response
				Schema.object({
					status: Schema.literal('loading'),
					progress: Schema.number().min(0).max(100).optional(),
				}),
			]);

			const successResponse = {
				status: 'success',
				data: { id: '123', name: 'John' },
			};

			const errorResponse = {
				status: 'error',
				error: { code: 404, message: 'Not found' },
			};

			const loadingResponse = {
				status: 'loading',
				progress: 75,
			};

			expect(apiResponseSchema.validate(successResponse).success).toBe(true);
			expect(apiResponseSchema.validate(errorResponse).success).toBe(true);
			expect(apiResponseSchema.validate(loadingResponse).success).toBe(true);

			// Invalid response
			const invalidResponse = {
				status: 'invalid',
				data: 'something',
			};

			expect(apiResponseSchema.validate(invalidResponse).success).toBe(false);
		});
	});

	describe('array validation with complex items', () => {
		it('should validate arrays of complex objects', () => {
			const todoSchema = Schema.object({
				id: Schema.string().uuid(),
				title: Schema.string().minLength(1).maxLength(200),
				completed: Schema.boolean(),
				priority: Schema.union([
					Schema.literal('low'),
					Schema.literal('medium'),
					Schema.literal('high'),
				]),
				tags: Schema.array(Schema.string()).unique(),
				dueDate: Schema.date().optional(),
				assignee: Schema.object({
					id: Schema.string(),
					name: Schema.string(),
				}).optional(),
			});

			const todoListSchema = Schema.array(todoSchema).minLength(1);

			const todos = [
				{
					id: '550e8400-e29b-41d4-a716-446655440000',
					title: 'Implement validation library',
					completed: false,
					priority: 'high',
					tags: ['development', 'typescript'],
					dueDate: new Date('2024-12-31'),
					assignee: {
						id: 'user1',
						name: 'John Doe',
					},
				},
				{
					id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
					title: 'Write documentation',
					completed: true,
					priority: 'medium',
					tags: ['documentation'],
					dueDate: undefined,
				},
			];

			const result = todoListSchema.validate(todos);
			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(2);
		});
	});

	describe('optional and nullable handling', () => {
		it('should handle optional and nullable fields correctly', () => {
			const userSchema = Schema.object({
				id: Schema.string(),
				name: Schema.string(),
				email: Schema.string().email().optional(),
				avatar: Schema.string().url().optional(),
				lastLogin: Schema.date().optional(),
				metadata: Schema.any().optional(),
				settings: Schema.object({
					theme: Schema.string(),
				}).optional(),
			});

			// User with minimal data
			const minimalUser = {
				id: '123',
				name: 'John Doe',
			};

			// User with all optional fields
			const fullUser = {
				id: '123',
				name: 'John Doe',
				email: 'john@example.com',
				avatar: 'https://example.com/avatar.jpg',
				lastLogin: new Date(),
				metadata: { source: 'import' },
				settings: { theme: 'dark' },
			};

			// User with explicit undefined/null values
			const explicitUser = {
				id: '123',
				name: 'John Doe',
				email: undefined,
				avatar: null,
				lastLogin: undefined,
				metadata: null,
				settings: undefined,
			};

			expect(userSchema.validate(minimalUser).success).toBe(true);
			expect(userSchema.validate(fullUser).success).toBe(true);
			expect(userSchema.validate(explicitUser).success).toBe(true);
		});
	});

	describe('performance and large data', () => {
		it('should handle large arrays efficiently', () => {
			const itemSchema = Schema.object({
				id: Schema.number(),
				name: Schema.string(),
				active: Schema.boolean(),
			});

			const largeArraySchema = Schema.array(itemSchema);

			// Generate large dataset
			const largeData = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
				name: `Item ${i}`,
				active: i % 2 === 0,
			}));

			const startTime = Date.now();
			const result = largeArraySchema.validate(largeData);
			const endTime = Date.now();

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(1000);

			// Should complete within reasonable time (adjust threshold as needed)
			const duration = endTime - startTime;
			expect(duration).toBeLessThan(1000); // 1 second
		});
	});

	describe('error message customization', () => {
		it('should provide custom error messages throughout validation chain', () => {
			const userSchema = Schema.object({
				username: Schema.string()
					.minLength(3)
					.withMessage('Username must be at least 3 characters'),
				email: Schema.string()
					.email()
					.withMessage('Please provide a valid email address'),
				age: Schema.number()
					.min(18)
					.withMessage('You must be at least 18 years old'),
			});

			const invalidData = {
				username: 'ab',
				email: 'not-an-email',
				age: 16,
			};

			const result = userSchema.validate(invalidData);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].message).toBe(
				'Username must be at least 3 characters'
			);
			expect(result.errors![1].message).toBe(
				'Please provide a valid email address'
			);
			expect(result.errors![2].message).toBe(
				'You must be at least 18 years old'
			);
		});
	});
});
