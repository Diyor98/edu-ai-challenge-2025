/**
 * AI player for the Sea Battle game
 * Implements hunt and target modes for intelligent gameplay
 */
export class CpuPlayer {
	static MODE_HUNT = 'hunt';
	static MODE_TARGET = 'target';

	constructor(boardSize = 10) {
		this.boardSize = boardSize;
		this.mode = CpuPlayer.MODE_HUNT;
		this.targetQueue = [];
		this.guesses = new Set();
	}

	/**
	 * Makes a strategic guess for the CPU turn
	 * @param {Board} opponentBoard - The opponent's board
	 * @returns {string} The location to guess
	 */
	makeGuess(opponentBoard) {
		let guess;

		if (this.mode === CpuPlayer.MODE_TARGET && this.targetQueue.length > 0) {
			guess = this.getTargetModeGuess();
		} else {
			this.mode = CpuPlayer.MODE_HUNT;
			guess = this.getHuntModeGuess();
		}

		this.guesses.add(guess);
		return guess;
	}

	/**
	 * Processes the result of a CPU guess
	 * @param {string} location - The location that was guessed
	 * @param {Object} result - The result of the guess {hit, sunk, ship}
	 */
	processGuessResult(location, result) {
		if (result.hit) {
			if (result.sunk) {
				// Ship sunk, switch back to hunt mode
				this.mode = CpuPlayer.MODE_HUNT;
				this.targetQueue = [];
			} else {
				// Hit but not sunk, switch to target mode and add adjacent locations
				this.mode = CpuPlayer.MODE_TARGET;
				this.addAdjacentTargets(location);
			}
		} else if (
			this.mode === CpuPlayer.MODE_TARGET &&
			this.targetQueue.length === 0
		) {
			// Missed and no more targets, switch back to hunt mode
			this.mode = CpuPlayer.MODE_HUNT;
		}
	}

	/**
	 * Gets a guess in target mode (focusing on adjacent cells)
	 * @returns {string} Location to guess
	 */
	getTargetModeGuess() {
		// Remove already guessed locations from queue
		while (this.targetQueue.length > 0) {
			const target = this.targetQueue.shift();
			if (!this.guesses.has(target)) {
				return target;
			}
		}

		// If no valid targets, fall back to hunt mode
		this.mode = CpuPlayer.MODE_HUNT;
		return this.getHuntModeGuess();
	}

	/**
	 * Gets a guess in hunt mode (random valid location)
	 * @returns {string} Location to guess
	 */
	getHuntModeGuess() {
		let guess;
		let attempts = 0;
		const maxAttempts = 1000;

		do {
			const row = Math.floor(Math.random() * this.boardSize);
			const col = Math.floor(Math.random() * this.boardSize);
			guess = `${row}${col}`;
			attempts++;
		} while (this.guesses.has(guess) && attempts < maxAttempts);

		if (attempts >= maxAttempts) {
			// Fallback: find first unguessed location
			guess = this.findFirstUnguessedLocation();
		}

		return guess;
	}

	/**
	 * Adds adjacent locations to the target queue
	 * @param {string} location - The hit location
	 */
	addAdjacentTargets(location) {
		const [row, col] = this.parseLocation(location);
		const adjacentLocations = [
			{ r: row - 1, c: col },
			{ r: row + 1, c: col },
			{ r: row, c: col - 1 },
			{ r: row, c: col + 1 },
		];

		adjacentLocations.forEach(({ r, c }) => {
			if (this.isValidLocation(r, c)) {
				const adjLocation = `${r}${c}`;
				if (
					!this.guesses.has(adjLocation) &&
					!this.targetQueue.includes(adjLocation)
				) {
					this.targetQueue.push(adjLocation);
				}
			}
		});
	}

	/**
	 * Checks if a location is valid (within board bounds)
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {boolean} True if location is valid
	 */
	isValidLocation(row, col) {
		return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
	}

	/**
	 * Parses a location string into row and column
	 * @param {string} location - Location string (e.g., "00", "34")
	 * @returns {Array<number>} [row, col]
	 */
	parseLocation(location) {
		return [parseInt(location[0]), parseInt(location[1])];
	}

	/**
	 * Finds the first unguessed location on the board
	 * @returns {string} First unguessed location
	 */
	findFirstUnguessedLocation() {
		for (let row = 0; row < this.boardSize; row++) {
			for (let col = 0; col < this.boardSize; col++) {
				const location = `${row}${col}`;
				if (!this.guesses.has(location)) {
					return location;
				}
			}
		}
		return '00'; // Fallback
	}

	/**
	 * Resets the CPU player state
	 */
	reset() {
		this.mode = CpuPlayer.MODE_HUNT;
		this.targetQueue = [];
		this.guesses.clear();
	}

	/**
	 * Gets the current mode of the CPU
	 * @returns {string} Current mode
	 */
	getCurrentMode() {
		return this.mode;
	}

	/**
	 * Gets the number of targets in the queue
	 * @returns {number} Number of targets
	 */
	getTargetQueueSize() {
		return this.targetQueue.length;
	}
}
