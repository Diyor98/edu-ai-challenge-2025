# Service Analyzer Console Application

A lightweight console application that analyzes digital services and generates comprehensive, markdown-formatted reports using AI. This tool provides multi-perspective analysis from business, technical, and user-focused viewpoints.

## 🚀 Features

- **Dual Input Mode**: Analyze either known service names (e.g., "Spotify", "Notion") or raw service description text
- **AI-Powered Analysis**: Uses OpenAI's GPT-4o-mini for intelligent service analysis
- **Comprehensive Reports**: Generates structured markdown reports with 8 key sections
- **Interactive Interface**: User-friendly prompts with input validation
- **File Export**: Option to save reports as markdown files
- **Professional Formatting**: Clean, well-structured output with emojis and proper markdown formatting

## 📋 Report Sections

Each generated report includes these comprehensive sections:

1. **📊 Brief History** - Founding year, milestones, major developments
2. **🎯 Target Audience** - Primary user segments and demographics
3. **⚡ Core Features** - Top 2-4 key functionalities
4. **🌟 Unique Selling Points** - Key differentiators that set the service apart
5. **💰 Business Model** - How the service generates revenue
6. **🔧 Tech Stack Insights** - Known or inferred technologies used
7. **✅ Perceived Strengths** - Positive aspects and standout features
8. **⚠️ Perceived Weaknesses** - Drawbacks, limitations, or improvement areas

## 🛠️ Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** (required for AI analysis)

## 📦 Installation

1. **Clone or download the project files**

   ```bash
   # Navigate to the task9 directory
   cd task9
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

   Add your OpenAI API key to the `.env` file:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   > ⚠️ **Important**: Never commit your `.env` file to version control. The API key should be kept secure.

## 🏃‍♂️ Usage

### Option 1: Development Mode (Recommended)

```bash
npm run dev
```

### Option 2: Compiled Version

```bash
# First build the project
npm run build

# Then run the compiled version
npm start
```

### Help Command

```bash
npm run dev -- --help
```

## 💡 How to Use

1. **Start the application** using one of the methods above
2. **Choose your input type**:
   - **Known service name**: Enter services like "Spotify", "Notion", "Slack", etc.
   - **Service description**: Provide detailed text about a service or product
3. **Enter your input** when prompted
4. **Choose whether to save** the report to a file
5. **Wait for AI analysis** (usually takes 10-30 seconds)
6. **Review the generated report** in the terminal and/or saved file

## 📝 Example Usage

### Analyzing a Known Service

```
🔍 Service Analyzer
Generate comprehensive analysis reports for digital services

? What would you like to analyze? Known service name (e.g., "Spotify", "Notion")
? Enter the service name: Spotify
? Would you like to save the report to a file? Yes

📊 Starting analysis...
🤖 Analyzing service with AI...

✅ Analysis complete!

# Service Analysis Report: Spotify
...
✅ Report saved to: spotify_analysis_2024-01-15.md
```

### Analyzing Service Description Text

```
? What would you like to analyze? Service description text
? Enter the service description (this will open your default editor):
[Editor opens for you to enter detailed service description]
```

## 📁 Output Files

When you choose to save reports, they are saved as markdown files with the naming pattern:

```
{service_name}_analysis_{date}.md
```

Examples:

- `spotify_analysis_2024-01-15.md`
- `notion_analysis_2024-01-15.md`
- `service_analysis_2024-01-15.md` (for description-based analysis)

## 🔧 Project Structure

```
task9/
├── index.ts              # Main application file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── sample_outputs.md    # Sample application runs
└── dist/                # Compiled JavaScript (after build)
```

## 📊 Scripts

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript version
- `npm run clean` - Remove the dist directory

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- **Keep your OpenAI API key secure** and never share it publicly
- **Monitor your OpenAI usage** to avoid unexpected charges
- The application uses approximately 1,000-2,000 tokens per analysis

## 🐛 Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY environment variable is not set"**

   - Solution: Create a `.env` file with your API key

2. **"Cannot find module" errors**

   - Solution: Run `npm install` to install dependencies

3. **TypeScript compilation errors**

   - Solution: Run `npm run build` to check for syntax errors

4. **OpenAI API errors**

   - Check your API key is valid and has sufficient credits
   - Ensure you have access to the GPT-4o-mini model

5. **Editor not opening for description input**
   - Ensure you have a default text editor set in your system
   - Try setting the `EDITOR` environment variable: `export EDITOR=nano`

### Getting Help

If you encounter issues:

1. Check the error messages for specific guidance
2. Verify all prerequisites are installed
3. Ensure your `.env` file is properly configured
4. Run `npm run dev -- --help` for usage information

## 📈 API Usage

Each analysis typically uses:

- **Model**: GPT-4o-mini
- **Tokens**: ~1,000-2,000 per request
- **Cost**: Approximately $0.002-$0.004 per analysis (as of 2024)

## 🎯 Use Cases

This tool is perfect for:

- **Product Managers** analyzing competitor services
- **Investors** evaluating potential investments
- **Entrepreneurs** researching market opportunities
- **Students** studying business models and tech stacks
- **Consultants** preparing client presentations
- **Anyone** wanting structured insights about digital services

## 🤝 Contributing

Feel free to suggest improvements or report bugs. The application is designed to be easily extensible for additional analysis features.

---

_Built with TypeScript, OpenAI API, and modern Node.js tools_
