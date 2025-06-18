require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const readline = require('readline');

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Load products dataset
function loadProducts() {
	try {
		const data = fs.readFileSync('./products.json', 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error loading products:', error.message);
		process.exit(1);
	}
}

// Create function definition for OpenAI function calling
const filterProductsFunction = {
	name: 'filter_products',
	description:
		'Filter products based on user preferences like category, price range, rating, and stock availability',
	parameters: {
		type: 'object',
		properties: {
			category: {
				type: 'string',
				enum: ['Electronics', 'Fitness', 'Kitchen', 'Books', 'Clothing'],
				description: 'Product category filter',
			},
			max_price: {
				type: 'number',
				description: 'Maximum price filter',
			},
			min_price: {
				type: 'number',
				description: 'Minimum price filter',
			},
			min_rating: {
				type: 'number',
				description: 'Minimum rating filter (1-5 scale)',
			},
			in_stock_only: {
				type: 'boolean',
				description: 'Filter for only in-stock products',
			},
			keywords: {
				type: 'array',
				items: { type: 'string' },
				description: 'Keywords to search in product names',
			},
		},
		required: [],
	},
};

// Filter products based on criteria from OpenAI function call
function filterProducts(products, criteria) {
	return products.filter((product) => {
		// Category filter
		if (criteria.category && product.category !== criteria.category) {
			return false;
		}

		// Price filters
		if (criteria.max_price && product.price > criteria.max_price) {
			return false;
		}

		if (criteria.min_price && product.price < criteria.min_price) {
			return false;
		}

		// Rating filter
		if (criteria.min_rating && product.rating < criteria.min_rating) {
			return false;
		}

		// Stock filter
		if (criteria.in_stock_only && !product.in_stock) {
			return false;
		}

		// Keywords filter
		if (criteria.keywords && criteria.keywords.length > 0) {
			const productName = product.name.toLowerCase();
			const hasKeyword = criteria.keywords.some((keyword) =>
				productName.includes(keyword.toLowerCase())
			);
			if (!hasKeyword) {
				return false;
			}
		}

		return true;
	});
}

// Display filtered products
function displayProducts(products) {
	if (products.length === 0) {
		console.log('\nNo products found matching your criteria.\n');
		return;
	}

	console.log('\nFiltered Products:');
	console.log('==================');
	products.forEach((product, index) => {
		const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
		console.log(
			`${index + 1}. ${product.name} - $${product.price}, Rating: ${
				product.rating
			}, ${stockStatus}`
		);
	});
	console.log('');
}

// Main search function using OpenAI function calling
async function searchProducts(query, products) {
	try {
		console.log('Processing your request...\n');

		const messages = [
			{
				role: 'system',
				content: `You are a product search assistant. Your job is to analyze user queries and extract filtering criteria for products. 
        Available categories: Electronics, Fitness, Kitchen, Books, Clothing.
        Use the filter_products function to specify the search criteria based on the user's natural language query.
        Pay attention to price mentions (under, below, max, less than for max_price; over, above, min, more than for min_price).
        For ratings, consider phrases like "good rating", "high rating", "great" (4.0+), "excellent" (4.5+).
        Extract relevant keywords from product names when specific features are mentioned.`,
			},
			{
				role: 'user',
				content: query,
			},
		];

		const response = await openai.chat.completions.create({
			model: 'gpt-4.1-mini',
			messages: messages,
			functions: [filterProductsFunction],
			function_call: { name: 'filter_products' },
		});

		const functionCall = response.choices[0].message.function_call;

		if (functionCall && functionCall.name === 'filter_products') {
			const criteria = JSON.parse(functionCall.arguments);
			console.log('Search criteria:', JSON.stringify(criteria, null, 2));

			const filteredProducts = filterProducts(products, criteria);
			displayProducts(filteredProducts);
		} else {
			console.log(
				'Unable to process your request. Please try rephrasing your query.'
			);
		}
	} catch (error) {
		console.error('Error processing search:', error.message);
	}
}

// Console interface
function createInterface() {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
}

// Main application loop
async function main() {
	// Check for API key
	if (!process.env.OPENAI_API_KEY) {
		console.error('Error: OPENAI_API_KEY environment variable is not set.');
		console.log('Please set your OpenAI API key as an environment variable:');
		console.log('export OPENAI_API_KEY="your-api-key-here"');
		process.exit(1);
	}

	console.log('🛍️  Product Search Tool');
	console.log('========================');
	console.log('Welcome! You can search for products using natural language.');
	console.log('Examples:');
	console.log('- "I need a smartphone under $800"');
	console.log('- "Show me fitness equipment with good ratings"');
	console.log('- "Find books about programming under $50"');
	console.log('- "Looking for kitchen appliances in stock"');
	console.log('Type "exit" to quit.\n');

	const products = loadProducts();
	const rl = createInterface();

	const askQuestion = () => {
		rl.question('What are you looking for? ', async (query) => {
			if (query.toLowerCase().trim() === 'exit') {
				console.log('Thank you for using the Product Search Tool! Goodbye! 👋');
				rl.close();
				return;
			}

			if (query.trim() === '') {
				console.log('Please enter a search query or "exit" to quit.\n');
				askQuestion();
				return;
			}

			await searchProducts(query, products);
			askQuestion();
		});
	};

	askQuestion();
}

// Handle process termination
process.on('SIGINT', () => {
	console.log('\n\nGoodbye! 👋');
	process.exit(0);
});

// Start the application
main().catch(console.error);
