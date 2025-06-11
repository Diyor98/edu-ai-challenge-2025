import readline from 'readline';

/**
 * Handles user input for the Sea Battle game
 */
export class InputHandler {
	constructor() {
		this.rl = null;
		this.isInitialized = false;
	}

	/**
	 * Initializes the readline interface
	 */
	initialize() {
		if (!this.isInitialized) {
			this.rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});
			this.isInitialized = true;
		}
	}

	/**
	 * Prompts the user for input and returns a promise
	 * @param {string} question - The question to ask the user
	 * @returns {Promise<string>} Promise that resolves with user input
	 */
	async askQuestion(question) {
		this.initialize();

		return new Promise((resolve) => {
			this.rl.question(question, (answer) => {
				resolve(answer.trim());
			});
		});
	}

	/**
	 * Gets a player guess with validation
	 * @param {string} prompt - The prompt to show the user
	 * @returns {Promise<string>} Promise that resolves with valid input
	 */
	async getPlayerGuess(prompt = '🎯 Enter your guess (e.g., 00): ') {
		const input = await this.askQuestion(prompt);
		return input;
	}

	/**
	 * Asks for confirmation (y/n)
	 * @param {string} message - The confirmation message
	 * @returns {Promise<boolean>} Promise that resolves with true/false
	 */
	async askConfirmation(message) {
		const input = await this.askQuestion(`${message} (y/n): `);
		return input.toLowerCase().startsWith('y');
	}

	/**
	 * Asks user to press Enter to continue
	 * @param {string} message - Optional message to display
	 * @returns {Promise<void>}
	 */
	async waitForEnter(message = 'Press Enter to continue...') {
		await this.askQuestion(message);
	}

	/**
	 * Presents a menu and gets user choice
	 * @param {Array<string>} options - Array of menu options
	 * @param {string} title - Menu title
	 * @returns {Promise<number>} Promise that resolves with chosen option index
	 */
	async showMenu(options, title = 'Choose an option:') {
		console.log(`\n${title}`);
		options.forEach((option, index) => {
			console.log(`${index + 1}. ${option}`);
		});

		let choice;
		let validChoice = false;

		while (!validChoice) {
			const input = await this.askQuestion('\nEnter your choice: ');
			choice = parseInt(input) - 1;

			if (choice >= 0 && choice < options.length) {
				validChoice = true;
			} else {
				console.log('❌ Invalid choice. Please try again.');
			}
		}

		return choice;
	}

	/**
	 * Gets game configuration from user
	 * @returns {Promise<Object>} Promise that resolves with game config
	 */
	async getGameConfiguration() {
		console.log('\n⚙️  Game Configuration');
		console.log('Press Enter to use default values or enter new values:');

		const boardSizeInput = await this.askQuestion('Board size (default: 10): ');
		const numShipsInput = await this.askQuestion(
			'Number of ships (default: 3): '
		);
		const shipLengthInput = await this.askQuestion(
			'Ship length (default: 3): '
		);

		return {
			boardSize: boardSizeInput ? parseInt(boardSizeInput) : 10,
			numShips: numShipsInput ? parseInt(numShipsInput) : 3,
			shipLength: shipLengthInput ? parseInt(shipLengthInput) : 3,
		};
	}

	/**
	 * Handles graceful shutdown of the input interface
	 */
	close() {
		if (this.rl) {
			this.rl.close();
			this.isInitialized = false;
		}
	}

	/**
	 * Sets up graceful shutdown handlers
	 */
	setupShutdownHandlers() {
		const cleanup = () => {
			this.close();
			process.exit(0);
		};

		process.on('SIGINT', cleanup);
		process.on('SIGTERM', cleanup);
		process.on('exit', () => this.close());
	}

	/**
	 * Pauses execution for specified milliseconds
	 * @param {number} ms - Milliseconds to pause
	 * @returns {Promise<void>}
	 */
	static async pause(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Validates input format for coordinates
	 * @param {string} input - Input to validate
	 * @returns {Object} Validation result
	 */
	static validateCoordinateInput(input) {
		if (!input || typeof input !== 'string') {
			return { valid: false, error: 'Input is required' };
		}

		if (input.length !== 2) {
			return { valid: false, error: 'Input must be exactly 2 characters' };
		}

		const [row, col] = input.split('');
		if (!/^\d$/.test(row) || !/^\d$/.test(col)) {
			return { valid: false, error: 'Input must contain only digits' };
		}

		return { valid: true };
	}
}
