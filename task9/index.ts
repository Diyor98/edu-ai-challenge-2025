#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Load environment variables
require('dotenv').config();

interface ServiceAnalysis {
	briefHistory: string;
	targetAudience: string;
	coreFeatures: string;
	uniqueSellingPoints: string;
	businessModel: string;
	techStackInsights: string;
	perceivedStrengths: string;
	perceivedWeaknesses: string;
}

class ServiceAnalyzer {
	private openai: OpenAI;

	constructor() {
		const apiKey = process.env.OPENAI_API_KEY;

		if (!apiKey) {
			console.error(
				chalk.red('❌ Error: OPENAI_API_KEY environment variable is not set.')
			);
			console.error(
				chalk.yellow('Please create a .env file with your OpenAI API key:')
			);
			console.error(chalk.gray('OPENAI_API_KEY=your_api_key_here'));
			process.exit(1);
		}

		this.openai = new OpenAI({
			apiKey: apiKey,
		});
	}

	private createAnalysisPrompt(input: string, isServiceName: boolean): string {
		const basePrompt = `You are an expert business and technology analyst. ${
			isServiceName
				? `Analyze the service "${input}" based on your knowledge.`
				: `Analyze the following service description: "${input}"`
		}

Please provide a comprehensive analysis covering exactly these 8 sections:

1. **Brief History**: Include founding year, key milestones, major developments
2. **Target Audience**: Identify primary user segments and demographics
3. **Core Features**: List the top 2-4 key functionalities
4. **Unique Selling Points**: Key differentiators that set it apart
5. **Business Model**: How the service generates revenue
6. **Tech Stack Insights**: Any known or inferred technologies used
7. **Perceived Strengths**: Positive aspects and standout features
8. **Perceived Weaknesses**: Drawbacks, limitations, or areas for improvement

CRITICAL: Your response must be ONLY valid JSON. No explanations, no markdown, no additional text. Just this JSON structure:

{
  "briefHistory": "your detailed analysis here",
  "targetAudience": "your detailed analysis here", 
  "coreFeatures": "your detailed analysis here",
  "uniqueSellingPoints": "your detailed analysis here",
  "businessModel": "your detailed analysis here",
  "techStackInsights": "your detailed analysis here",
  "perceivedStrengths": "your detailed analysis here",
  "perceivedWeaknesses": "your detailed analysis here"
}

Each value should be a detailed paragraph (2-4 sentences). Escape any quotes in your text properly.`;

		return basePrompt;
	}

	private generateMarkdownReport(
		serviceName: string,
		analysis: ServiceAnalysis
	): string {
		const timestamp = new Date().toISOString().split('T')[0];

		return `# Service Analysis Report: ${serviceName}

*Generated on: ${timestamp}*

---

## 📊 Brief History

${analysis.briefHistory}

---

## 🎯 Target Audience

${analysis.targetAudience}

---

## ⚡ Core Features

${analysis.coreFeatures}

---

## 🌟 Unique Selling Points

${analysis.uniqueSellingPoints}

---

## 💰 Business Model

${analysis.businessModel}

---

## 🔧 Tech Stack Insights

${analysis.techStackInsights}

---

## ✅ Perceived Strengths

${analysis.perceivedStrengths}

---

## ⚠️ Perceived Weaknesses

${analysis.perceivedWeaknesses}

---

*This report was generated using AI analysis and may not reflect the most current information about the service.*
`;
	}

	async analyzeService(input: string, isServiceName: boolean): Promise<string> {
		try {
			console.log(chalk.blue('🤖 Analyzing service with AI...'));

			const prompt = this.createAnalysisPrompt(input, isServiceName);

			const completion = await this.openai.chat.completions.create({
				model: 'gpt-4.1-mini',
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 2000,
			});

			const responseContent = completion.choices[0]?.message?.content;

			if (!responseContent) {
				throw new Error('No response received from OpenAI');
			}

			// Parse JSON response
			let analysis: ServiceAnalysis;
			try {
				analysis = JSON.parse(responseContent);
			} catch (parseError) {
				console.error(chalk.red('❌ Error parsing AI response as JSON'));
				console.error(chalk.yellow('Raw AI response:'));
				console.error(chalk.gray(responseContent));
				console.error(chalk.yellow('Parse error:'), parseError);
				throw new Error('Invalid JSON response from AI');
			}

			// Validate all required fields are present
			const requiredFields = [
				'briefHistory',
				'targetAudience',
				'coreFeatures',
				'uniqueSellingPoints',
				'businessModel',
				'techStackInsights',
				'perceivedStrengths',
				'perceivedWeaknesses',
			];

			for (const field of requiredFields) {
				if (!(field in analysis) || !analysis[field as keyof ServiceAnalysis]) {
					throw new Error(`Missing or empty field: ${field}`);
				}
			}

			const serviceName = isServiceName ? input : 'Analyzed Service';
			return this.generateMarkdownReport(serviceName, analysis);
		} catch (error) {
			console.error(chalk.red('❌ Error during analysis:'), error);
			throw error;
		}
	}

	async promptUser(): Promise<{
		input: string;
		isServiceName: boolean;
		saveToFile: boolean;
	}> {
		const questions = [
			{
				type: 'list',
				name: 'inputType',
				message: 'What would you like to analyze?',
				choices: [
					{
						name: 'Known service name (e.g., "Spotify", "Notion")',
						value: 'service',
					},
					{ name: 'Service description text', value: 'description' },
				],
			},
			{
				type: 'input',
				name: 'serviceInput',
				message: 'Enter the service name:',
				when: (answers: any) => answers.inputType === 'service',
				validate: (input: string) =>
					input.trim().length > 0 || 'Please enter a service name',
			},
			{
				type: 'editor',
				name: 'descriptionInput',
				message:
					'Enter the service description (this will open your default editor):',
				when: (answers: any) => answers.inputType === 'description',
				validate: (input: string) =>
					input.trim().length > 10 ||
					'Please enter a meaningful description (at least 10 characters)',
			},
			{
				type: 'confirm',
				name: 'saveToFile',
				message: 'Would you like to save the report to a file?',
				default: true,
			},
		];

		const answers = await inquirer.prompt(questions);

		return {
			input: answers.serviceInput || answers.descriptionInput,
			isServiceName: answers.inputType === 'service',
			saveToFile: answers.saveToFile,
		};
	}

	async saveReportToFile(report: string, serviceName: string): Promise<void> {
		const sanitizedName = serviceName
			.replace(/[^a-zA-Z0-9]/g, '_')
			.toLowerCase();
		const timestamp = new Date().toISOString().split('T')[0];
		const filename = `${sanitizedName}_analysis_${timestamp}.md`;

		fs.writeFileSync(filename, report, 'utf8');
		console.log(chalk.green(`✅ Report saved to: ${filename}`));
	}

	async run(): Promise<void> {
		console.log(chalk.cyan.bold('\n🔍 Service Analyzer'));
		console.log(
			chalk.gray(
				'Generate comprehensive analysis reports for digital services\n'
			)
		);

		try {
			const { input, isServiceName, saveToFile } = await this.promptUser();

			console.log(chalk.yellow('\n📊 Starting analysis...'));
			const report = await this.analyzeService(input, isServiceName);

			console.log(chalk.green('\n✅ Analysis complete!\n'));
			console.log(chalk.cyan('='.repeat(80)));
			console.log(report);
			console.log(chalk.cyan('='.repeat(80)));

			if (saveToFile) {
				const serviceName = isServiceName ? input : 'service_analysis';
				await this.saveReportToFile(report, serviceName);
			}
		} catch (error) {
			console.error(chalk.red('\n❌ Application error:'), error);
			process.exit(1);
		}
	}
}

// Handle command line arguments
async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--help') || args.includes('-h')) {
		console.log(chalk.cyan.bold('Service Analyzer - Help'));
		console.log('\nUsage:');
		console.log('  npm run dev                 # Interactive mode');
		console.log('  npm start                   # Run compiled version');
		console.log('  npm run dev -- --help       # Show this help');
		console.log('\nEnvironment Variables:');
		console.log(
			'  OPENAI_API_KEY              # Your OpenAI API key (required)'
		);
		console.log('\nExample .env file:');
		console.log('  OPENAI_API_KEY=sk-...');
		return;
	}

	const analyzer = new ServiceAnalyzer();
	await analyzer.run();
}

// Run the application
if (require.main === module) {
	main().catch((error) => {
		console.error(chalk.red('Fatal error:'), error);
		process.exit(1);
	});
}
