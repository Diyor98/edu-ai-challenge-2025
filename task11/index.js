#!/usr/bin/env node

require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const natural = require('natural');

class AudioTranscriptionAnalyzer {
	constructor() {
		if (!process.env.OPENAI_API_KEY) {
			throw new Error(
				'OPENAI_API_KEY is required. Please set it in your .env file.'
			);
		}

		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});

		this.ensureDirectories();
	}

	ensureDirectories() {
		const dirs = ['transcriptions', 'summaries', 'analyses'];
		dirs.forEach((dir) => {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
		});
	}

	async transcribeAudio(audioFilePath) {
		try {
			console.log('🎵 Starting transcription...');

			if (!fs.existsSync(audioFilePath)) {
				throw new Error(`Audio file not found: ${audioFilePath}`);
			}

			const audioFile = fs.createReadStream(audioFilePath);

			const transcription = await this.openai.audio.transcriptions.create({
				file: audioFile,
				model: 'whisper-1',
				response_format: 'text',
			});

			console.log('✅ Transcription completed!');
			return transcription;
		} catch (error) {
			console.error('❌ Error during transcription:', error.message);
			throw error;
		}
	}

	async summarizeText(text) {
		try {
			console.log('📝 Generating summary...');

			const completion = await this.openai.chat.completions.create({
				model: 'gpt-4.1-mini',
				messages: [
					{
						role: 'system',
						content:
							'You are a helpful assistant that creates concise, informative summaries of transcribed audio content. Focus on key points, main topics, and important details.',
					},
					{
						role: 'user',
						content: `Please provide a comprehensive summary of the following transcribed audio content:\n\n${text}`,
					},
				],
				max_tokens: 500,
				temperature: 0.3,
			});

			console.log('✅ Summary generated!');
			return completion.choices[0].message.content;
		} catch (error) {
			console.error('❌ Error during summarization:', error.message);
			throw error;
		}
	}

	calculateSpeakingSpeed(text, audioDuration) {
		const words = text.split(/\s+/).filter((word) => word.length > 0);
		const wordCount = words.length;
		const minutes = audioDuration / 60;
		const wpm = Math.round(wordCount / minutes);
		return { wordCount, wpm };
	}

	extractTopics(text) {
		try {
			// Tokenize and get word frequencies
			const tokenizer = new natural.WordTokenizer();
			const tokens = tokenizer.tokenize(text.toLowerCase());

			// Remove stop words and short words
			const stopWords = new Set([
				'the',
				'a',
				'an',
				'and',
				'or',
				'but',
				'in',
				'on',
				'at',
				'to',
				'for',
				'of',
				'with',
				'by',
				'is',
				'are',
				'was',
				'were',
				'be',
				'been',
				'being',
				'have',
				'has',
				'had',
				'do',
				'does',
				'did',
				'will',
				'would',
				'could',
				'should',
				'may',
				'might',
				'can',
				'must',
				'shall',
				'i',
				'you',
				'he',
				'she',
				'it',
				'we',
				'they',
				'me',
				'him',
				'her',
				'us',
				'them',
				'my',
				'your',
				'his',
				'her',
				'its',
				'our',
				'their',
				'this',
				'that',
				'these',
				'those',
				'so',
				'if',
				'then',
				'now',
				'here',
				'there',
				'when',
				'where',
				'why',
				'how',
				'what',
				'who',
				'all',
				'any',
				'both',
				'each',
				'few',
				'more',
				'most',
				'other',
				'some',
				'such',
				'no',
				'not',
				'only',
				'own',
				'same',
				'than',
				'too',
				'very',
				'just',
				'well',
			]);

			const filteredTokens = tokens.filter(
				(token) =>
					token &&
					token.length > 2 &&
					!stopWords.has(token) &&
					/^[a-zA-Z]+$/.test(token)
			);

			// Count word frequencies
			const wordFreq = {};
			filteredTokens.forEach((token) => {
				wordFreq[token] = (wordFreq[token] || 0) + 1;
			});

			// Get top topics (words mentioned at least twice)
			const topics = Object.entries(wordFreq)
				.filter(([word, count]) => count >= 2)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([topic, mentions]) => ({
					topic: topic.charAt(0).toUpperCase() + topic.slice(1),
					mentions,
				}));

			return topics;
		} catch (error) {
			console.error('❌ Error extracting topics:', error.message);
			return [];
		}
	}

	async getAudioDuration(audioFilePath) {
		// For this demo, we'll estimate duration based on file size
		// In production, you might want to use a library like 'node-ffmpeg' for accurate duration
		const stats = fs.statSync(audioFilePath);
		const fileSizeInMB = stats.size / (1024 * 1024);
		// Rough estimate: 1MB ~ 1 minute for typical speech audio
		return fileSizeInMB * 60;
	}

	async analyzeTranscription(text, audioFilePath) {
		try {
			console.log('📊 Analyzing transcription...');

			const audioDuration = await this.getAudioDuration(audioFilePath);
			const { wordCount, wpm } = this.calculateSpeakingSpeed(
				text,
				audioDuration
			);
			const topics = this.extractTopics(text);

			const analysis = {
				word_count: wordCount,
				speaking_speed_wpm: wpm,
				audio_duration_minutes: Math.round((audioDuration / 60) * 10) / 10,
				frequently_mentioned_topics: topics.slice(0, 5),
			};

			console.log('✅ Analysis completed!');
			return analysis;
		} catch (error) {
			console.error('❌ Error during analysis:', error.message);
			throw error;
		}
	}

	generateTimestamp() {
		const now = new Date();
		return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
	}

	async saveResults(transcription, summary, analysis, audioFileName) {
		const timestamp = this.generateTimestamp();
		const baseName = path.parse(audioFileName).name;

		try {
			// Save transcription
			const transcriptionFile = path.join(
				'transcriptions',
				`${baseName}_${timestamp}_transcription.md`
			);
			const transcriptionContent = `# Transcription - ${audioFileName}\n\n**Generated:** ${new Date().toLocaleString()}\n\n## Content\n\n${transcription}`;
			await fs.writeFile(transcriptionFile, transcriptionContent);
			console.log(`💾 Transcription saved: ${transcriptionFile}`);

			// Save summary
			const summaryFile = path.join(
				'summaries',
				`${baseName}_${timestamp}_summary.md`
			);
			const summaryContent = `# Summary - ${audioFileName}\n\n**Generated:** ${new Date().toLocaleString()}\n\n## Summary\n\n${summary}`;
			await fs.writeFile(summaryFile, summaryContent);
			console.log(`💾 Summary saved: ${summaryFile}`);

			// Save analysis
			const analysisFile = path.join(
				'analyses',
				`${baseName}_${timestamp}_analysis.json`
			);
			await fs.writeFile(analysisFile, JSON.stringify(analysis, null, 2));
			console.log(`💾 Analysis saved: ${analysisFile}`);

			return { transcriptionFile, summaryFile, analysisFile };
		} catch (error) {
			console.error('❌ Error saving results:', error.message);
			throw error;
		}
	}

	async processAudioFile(audioFilePath) {
		try {
			const startTime = Date.now();
			console.log(`\n🚀 Processing audio file: ${audioFilePath}`);
			console.log('='.repeat(50));

			// Step 1: Transcribe audio
			const transcription = await this.transcribeAudio(audioFilePath);

			// Step 2: Generate summary
			const summary = await this.summarizeText(transcription);

			// Step 3: Analyze transcription
			const analysis = await this.analyzeTranscription(
				transcription,
				audioFilePath
			);

			// Step 4: Save results
			const audioFileName = path.basename(audioFilePath);
			const savedFiles = await this.saveResults(
				transcription,
				summary,
				analysis,
				audioFileName
			);

			const endTime = Date.now();
			const processingTime = ((endTime - startTime) / 1000).toFixed(2);

			// Display results
			console.log('\n' + '='.repeat(50));
			console.log('🎉 PROCESSING COMPLETE!');
			console.log('='.repeat(50));
			console.log(`⏱️  Processing time: ${processingTime} seconds`);
			console.log(`📄 Files created:`);
			console.log(`   • ${savedFiles.transcriptionFile}`);
			console.log(`   • ${savedFiles.summaryFile}`);
			console.log(`   • ${savedFiles.analysisFile}`);

			console.log('\n📊 ANALYSIS RESULTS:');
			console.log('='.repeat(30));
			console.log(JSON.stringify(analysis, null, 2));

			console.log('\n📝 SUMMARY:');
			console.log('='.repeat(15));
			console.log(summary);

			return { transcription, summary, analysis, savedFiles };
		} catch (error) {
			console.error('\n❌ PROCESSING FAILED:', error.message);
			throw error;
		}
	}
}

async function main() {
	try {
		const args = process.argv.slice(2);

		if (args.length === 0) {
			console.log('🎵 Audio Transcription & Analysis Tool');
			console.log('='.repeat(40));
			console.log('Usage: node index.js <audio-file-path>');
			console.log('\nExample: node index.js CAR0004.mp3');
			console.log('\nSupported formats: mp3, wav, m4a, flac');
			process.exit(1);
		}

		const audioFilePath = args[0];
		const analyzer = new AudioTranscriptionAnalyzer();

		await analyzer.processAudioFile(audioFilePath);
	} catch (error) {
		console.error('\n💥 Application Error:', error.message);
		process.exit(1);
	}
}

// Run the application
if (require.main === module) {
	main();
}

module.exports = AudioTranscriptionAnalyzer;
