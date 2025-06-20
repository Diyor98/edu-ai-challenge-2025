# Audio Transcription & Analysis Tool

A powerful console application that transcribes audio files using OpenAI's Whisper API, generates summaries with GPT, and provides detailed analytics including word count, speaking speed, and frequently mentioned topics.

## Features

- 🎵 **Audio Transcription**: Uses OpenAI's Whisper-1 model for accurate speech-to-text conversion
- 📝 **AI-Powered Summarization**: Generates concise summaries using GPT-3.5-turbo
- 📊 **Advanced Analytics**:
  - Total word count
  - Speaking speed (words per minute)
  - Top frequently mentioned topics with mention counts
  - Audio duration estimation
- 💾 **File Management**: Automatically saves results in organized directories with timestamps
- 🔧 **Flexible Input**: Supports various audio formats (MP3, WAV, M4A, FLAC)

## Prerequisites

- Node.js (version 14 or higher)
- OpenAI API key
- Audio file to transcribe

## Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd task11
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - The `.env` file should already contain your OpenAI API key
   - If not, create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### Basic Usage

```bash
node index.js <path-to-audio-file>
```

### Examples

```bash
# Transcribe the provided sample file
node index.js CAR0004.mp3

# Transcribe any other audio file
node index.js /path/to/your/audio/file.mp3
```

### Using npm script

```bash
npm start CAR0004.mp3
```

## Output

The application creates three organized directories and saves results with timestamps:

### Directory Structure

```
task11/
├── transcriptions/     # Full transcriptions in Markdown format
├── summaries/         # AI-generated summaries in Markdown format
├── analyses/          # Detailed analytics in JSON format
└── ...
```

### File Naming Convention

- `{filename}_{timestamp}_transcription.md`
- `{filename}_{timestamp}_summary.md`
- `{filename}_{timestamp}_analysis.json`

### Sample Output Files

**Transcription file** (`transcription.md`):

```markdown
# Transcription - CAR0004.mp3

**Generated:** 12/16/2024, 10:30:45 AM

## Content

[Full transcribed text here...]
```

**Summary file** (`summary.md`):

```markdown
# Summary - CAR0004.mp3

**Generated:** 12/16/2024, 10:30:45 AM

## Summary

[AI-generated summary here...]
```

**Analysis file** (`analysis.json`):

```json
{
	"word_count": 1280,
	"speaking_speed_wpm": 132,
	"audio_duration_minutes": 9.7,
	"frequently_mentioned_topics": [
		{ "topic": "Customer", "mentions": 6 },
		{ "topic": "Service", "mentions": 4 },
		{ "topic": "Quality", "mentions": 3 }
	]
}
```

## Console Output

The application provides real-time progress updates and displays results directly in the console:

```
🚀 Processing audio file: CAR0004.mp3
==================================================
🎵 Starting transcription...
✅ Transcription completed!
📝 Generating summary...
✅ Summary generated!
📊 Analyzing transcription...
✅ Analysis completed!
💾 Transcription saved: transcriptions/CAR0004_2024-12-16T15-30-45_transcription.md
💾 Summary saved: summaries/CAR0004_2024-12-16T15-30-45_summary.md
💾 Analysis saved: analyses/CAR0004_2024-12-16T15-30-45_analysis.json

==================================================
🎉 PROCESSING COMPLETE!
==================================================
⏱️  Processing time: 23.45 seconds
📄 Files created:
   • transcriptions/CAR0004_2024-12-16T15-30-45_transcription.md
   • summaries/CAR0004_2024-12-16T15-30-45_summary.md
   • analyses/CAR0004_2024-12-16T15-30-45_analysis.json

📊 ANALYSIS RESULTS:
==============================
{
  "word_count": 1280,
  "speaking_speed_wpm": 132,
  "audio_duration_minutes": 9.7,
  "frequently_mentioned_topics": [...]
}

📝 SUMMARY:
===============
[Summary content displayed here...]
```

## API Usage

### OpenAI APIs Used

1. **Whisper API** (`whisper-1` model):

   - Used for audio transcription
   - Supports multiple audio formats
   - Returns raw text transcription

2. **Chat Completions API** (`gpt-4o` model):
   - Used for generating summaries
   - Configured for concise, informative summaries
   - Temperature set to 0.3 for consistent results

## Analytics Details

### Word Count

- Counts all words in the transcription
- Filters out empty strings and whitespace

### Speaking Speed (WPM)

- Calculated as: Total Words / (Audio Duration in Minutes)
- Provides insight into speech pace
- Rounded to nearest whole number

### Topic Extraction

- Uses natural language processing to identify frequent terms
- Filters out common stop words and short words
- Only includes topics mentioned at least 2 times
- Returns top 5 most frequently mentioned topics
- Topics are capitalized for better readability

## Supported Audio Formats

- MP3
- WAV
- M4A
- FLAC
- Other formats supported by OpenAI Whisper API

## Error Handling

The application includes comprehensive error handling for:

- Missing API keys
- Invalid audio files
- Network connectivity issues
- API rate limits
- File system permissions

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY is required" error:**

   - Ensure your `.env` file exists and contains a valid API key
   - Check that the API key has sufficient credits

2. **"Audio file not found" error:**

   - Verify the file path is correct
   - Ensure the file exists and is readable

3. **Network errors:**

   - Check your internet connection
   - Verify OpenAI API status

4. **Rate limiting:**
   - Wait a few moments and try again
   - Consider upgrading your OpenAI plan for higher limits

## Dependencies

- `openai`: Official OpenAI JavaScript library
- `dotenv`: Environment variable management
- `fs-extra`: Enhanced file system operations
- `natural`: Natural language processing toolkit
- `path`: Node.js path utilities

## License

MIT License

## Contributing

Feel free to submit issues and enhancement requests!
