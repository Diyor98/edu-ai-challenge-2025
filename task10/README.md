# Product Search Tool

A console-based product search application that uses OpenAI's function calling feature to filter products based on natural language queries.

## Overview

This tool allows users to search for products using natural language descriptions. It leverages OpenAI's GPT model with function calling to interpret user preferences and filter products from a JSON dataset accordingly.

### Features

- **Natural Language Processing**: Enter queries like "I need a smartphone under $800" or "Show me fitness equipment with good ratings"
- **OpenAI Function Calling**: Uses OpenAI's function calling mechanism to extract filtering criteria
- **Multiple Filter Support**: Supports filtering by category, price range, rating, stock availability, and keywords
- **Interactive Console Interface**: Easy-to-use command-line interface
- **Structured Output**: Clean, formatted display of filtered results

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)
- **OpenAI API Key** (required for function calling)

## Installation

1. **Clone or download the project files** to your local machine.

2. **Navigate to the task10 directory**:

   ```bash
   cd task10
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Configuration

### Setting up OpenAI API Key

The application requires an OpenAI API key to function. **Important**: Do not store your API key directly in the code files.

#### Option 1: Environment Variable (Recommended)

Set the environment variable before running the application:

**On macOS/Linux:**

```bash
export OPENAI_API_KEY="your-api-key-here"
```

**On Windows (Command Prompt):**

```cmd
set OPENAI_API_KEY=your-api-key-here
```

**On Windows (PowerShell):**

```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

#### Option 2: Create a .env file (Alternative)

1. Create a `.env` file in the task10 directory:

   ```bash
   touch .env
   ```

2. Add your API key to the `.env` file:

   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. Install the dotenv package:

   ```bash
   npm install dotenv
   ```

4. Add this line to the top of `index.js`:
   ```javascript
   require('dotenv').config();
   ```

## Usage

### Running the Application

Once you have set up your OpenAI API key, start the application:

```bash
npm start
```

or

```bash
node index.js
```

### Using the Search Tool

1. **Start the application** - You'll see a welcome message with examples
2. **Enter your search query** in natural language
3. **View the results** - Filtered products will be displayed with details
4. **Continue searching** - Enter new queries or type "exit" to quit

### Example Queries

The tool understands various types of natural language queries:

- **Category-based**: "Show me electronics", "Find fitness equipment", "I want kitchen appliances"
- **Price-based**: "Under $100", "Less than $50", "Between $20 and $200", "Over $500"
- **Rating-based**: "With good ratings", "High rated products", "4+ stars", "Excellent reviews"
- **Stock-based**: "In stock only", "Available products", "Currently available"
- **Feature-based**: "Wireless headphones", "Gaming laptop", "Smart watch", "Programming books"
- **Combined**: "I need a smartphone under $800 with great camera and long battery life"

### Supported Product Categories

- **Electronics**: Smartphones, laptops, headphones, monitors, etc.
- **Fitness**: Exercise equipment, yoga mats, weights, etc.
- **Kitchen**: Appliances, cookware, small appliances, etc.
- **Books**: Novels, guides, educational books, etc.
- **Clothing**: Apparel, shoes, accessories, etc.

## How It Works

1. **User Input**: The application accepts natural language queries from the console
2. **OpenAI Processing**: The query is sent to OpenAI's GPT model with a predefined function schema
3. **Function Calling**: OpenAI extracts filtering criteria and calls the `filter_products` function
4. **Product Filtering**: The application filters the product dataset based on the extracted criteria
5. **Results Display**: Matching products are displayed in a structured format

### Function Schema

The application uses a predefined function schema for OpenAI function calling:

```javascript
{
  name: 'filter_products',
  parameters: {
    category: 'Electronics | Fitness | Kitchen | Books | Clothing',
    max_price: 'number',
    min_price: 'number',
    min_rating: 'number (1-5 scale)',
    in_stock_only: 'boolean',
    keywords: 'array of strings'
  }
}
```

## Troubleshooting

### Common Issues

1. **"Error: OPENAI_API_KEY environment variable is not set"**

   - Ensure you have set the OpenAI API key as described in the Configuration section
   - Verify the environment variable is set: `echo $OPENAI_API_KEY` (macOS/Linux) or `echo %OPENAI_API_KEY%` (Windows)

2. **"Error loading products"**

   - Ensure the `products.json` file is in the same directory as `index.js`
   - Check that the JSON file is properly formatted

3. **"Error processing search"**

   - Check your internet connection
   - Verify your OpenAI API key is valid and has sufficient credits
   - Try simplifying your search query

4. **No products found**
   - Try broadening your search criteria
   - Check if products matching your criteria exist in the dataset
   - Use different keywords or remove some filters

### API Rate Limits

If you encounter rate limiting issues:

- Wait a moment before making another request
- Consider upgrading your OpenAI API plan for higher rate limits

## File Structure

```
task10/
├── index.js          # Main application file
├── products.json     # Product dataset
├── package.json      # Node.js package configuration
├── README.md         # This file
└── sample_outputs.md # Example application runs
```

## Dependencies

- **openai**: OpenAI JavaScript SDK for API interactions
- **readline**: Built-in Node.js module for console input/output
- **fs**: Built-in Node.js module for file system operations

## License

This project is licensed under the MIT License.
