/**
 * Handles the display and rendering of the Sea Battle game
 */
export class GameDisplay {
	/**
	 * Prints both boards side by side
	 * @param {Array<Array<string>>} cpuBoard - The CPU board (opponent view)
	 * @param {Array<Array<string>>} playerBoard - The player board
	 * @param {number} boardSize - Size of the board
	 */
	static printBoards(cpuBoard, playerBoard, boardSize = 10) {
		console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');

		// Print headers
		const header = this.generateHeader(boardSize);
		console.log(`${header}     ${header}`);

		// Print rows
		for (let i = 0; i < boardSize; i++) {
			const opponentRow = this.formatBoardRow(i, cpuBoard[i]);
			const playerRow = this.formatBoardRow(i, playerBoard[i]);
			console.log(`${opponentRow}    ${playerRow}`);
		}

		console.log('');
	}

	/**
	 * Generates the header row with column numbers
	 * @param {number} boardSize - Size of the board
	 * @returns {string} Formatted header
	 */
	static generateHeader(boardSize) {
		let header = '  ';
		for (let i = 0; i < boardSize; i++) {
			header += `${i} `;
		}
		return header;
	}

	/**
	 * Formats a single board row
	 * @param {number} rowIndex - The row index
	 * @param {Array<string>} rowData - The row data
	 * @returns {string} Formatted row string
	 */
	static formatBoardRow(rowIndex, rowData) {
		let rowStr = `${rowIndex} `;
		for (const cell of rowData) {
			rowStr += `${cell} `;
		}
		return rowStr;
	}

	/**
	 * Prints the game welcome message
	 * @param {number} numShips - Number of ships in the game
	 */
	static printWelcome(numShips) {
		console.log('\n='.repeat(50));
		console.log('            🚢 SEA BATTLE 🚢');
		console.log('='.repeat(50));
		console.log(`\nWelcome to Sea Battle!`);
		console.log(`Try to sink the ${numShips} enemy ships.`);
		console.log('Enter coordinates as two digits (e.g., 00, 34, 98)');
		console.log('Good luck, Admiral!\n');
	}

	/**
	 * Prints a turn separator
	 * @param {number} turnNumber - Current turn number
	 */
	static printTurnSeparator(turnNumber) {
		console.log(`\n--- Turn ${turnNumber} ---`);
	}

	/**
	 * Prints the CPU turn indicator
	 */
	static printCpuTurnStart() {
		console.log("\n--- CPU's Turn ---");
	}

	/**
	 * Prints game result message
	 * @param {string} winner - 'player' or 'cpu'
	 * @param {Object} gameState - Current game state
	 */
	static printGameResult(winner, gameState) {
		console.log('\n' + '='.repeat(50));

		if (winner === 'player') {
			console.log('🎉 CONGRATULATIONS! 🎉');
			console.log('You sunk all enemy battleships!');
			console.log('VICTORY IS YOURS!');
		} else {
			console.log('💥 GAME OVER 💥');
			console.log('The CPU sunk all your battleships!');
			console.log('Better luck next time!');
		}

		console.log(`Game completed in ${gameState.turn} turns.`);
		console.log('='.repeat(50));
	}

	/**
	 * Prints a message with formatting
	 * @param {string} message - Message to print
	 * @param {string} type - Type of message ('info', 'success', 'error', 'warning')
	 */
	static printMessage(message, type = 'info') {
		const prefixes = {
			info: '💬',
			success: '✅',
			error: '❌',
			warning: '⚠️',
		};

		const prefix = prefixes[type] || prefixes.info;
		console.log(`${prefix} ${message}`);
	}

	/**
	 * Prints game statistics
	 * @param {Object} gameState - Current game state
	 */
	static printGameStats(gameState) {
		console.log('\n--- Game Statistics ---');
		console.log(`Turn: ${gameState.turn}`);
		console.log(`Your ships remaining: ${gameState.playerShipsRemaining}`);
		console.log(`Enemy ships remaining: ${gameState.cpuShipsRemaining}`);
		console.log(`CPU mode: ${gameState.cpuMode}`);
	}

	/**
	 * Prints error message for invalid input
	 * @param {string} input - The invalid input
	 * @param {string} reason - Reason for invalidity
	 */
	static printInputError(input, reason) {
		console.log(`❌ Invalid input "${input}": ${reason}`);
		console.log('Please enter coordinates as two digits (e.g., 00, 34, 98)');
	}

	/**
	 * Prints the input prompt
	 * @returns {string} The prompt string
	 */
	static getInputPrompt() {
		return '🎯 Enter your guess (e.g., 00): ';
	}

	/**
	 * Clears the console (if supported)
	 */
	static clearScreen() {
		// Clear screen for supported terminals
		if (process.stdout.isTTY) {
			console.clear();
		}
	}

	/**
	 * Prints a loading message with dots animation
	 * @param {string} message - Base message
	 * @param {number} duration - Duration in milliseconds
	 */
	static async printLoading(message, duration = 1000) {
		const dots = ['', '.', '..', '...'];
		let i = 0;

		return new Promise((resolve) => {
			const interval = setInterval(() => {
				process.stdout.write(`\r${message}${dots[i % dots.length]}   `);
				i++;
			}, 200);

			setTimeout(() => {
				clearInterval(interval);
				process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
				resolve();
			}, duration);
		});
	}
}
