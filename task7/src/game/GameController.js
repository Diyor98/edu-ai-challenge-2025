import { Board } from '../models/Board.js';
import { ShipPlacer } from '../utils/ShipPlacer.js';
import { CpuPlayer } from '../ai/CpuPlayer.js';

/**
 * Main game controller that manages the Sea Battle game flow
 */
export class GameController {
	static GAME_STATE_SETUP = 'setup';
	static GAME_STATE_PLAYER_TURN = 'player_turn';
	static GAME_STATE_CPU_TURN = 'cpu_turn';
	static GAME_STATE_PLAYER_WIN = 'player_win';
	static GAME_STATE_CPU_WIN = 'cpu_win';

	constructor(config = {}) {
		this.config = {
			boardSize: config.boardSize || 10,
			numShips: config.numShips || 3,
			shipLength: config.shipLength || 3,
			...config,
		};

		this.playerBoard = new Board(this.config.boardSize);
		this.cpuBoard = new Board(this.config.boardSize);
		this.cpuPlayer = new CpuPlayer(this.config.boardSize);
		this.gameState = GameController.GAME_STATE_SETUP;
		this.currentTurn = 1;
	}

	/**
	 * Initializes a new game
	 * @returns {Promise<void>}
	 */
	async initializeGame() {
		try {
			// Place ships on both boards
			ShipPlacer.placeShipsRandomly(
				this.playerBoard,
				this.config.numShips,
				this.config.shipLength,
				true // Show player ships
			);

			ShipPlacer.placeShipsRandomly(
				this.cpuBoard,
				this.config.numShips,
				this.config.shipLength,
				false // Hide CPU ships
			);

			this.gameState = GameController.GAME_STATE_PLAYER_TURN;
			return { success: true, message: 'Game initialized successfully' };
		} catch (error) {
			return {
				success: false,
				message: `Failed to initialize game: ${error.message}`,
			};
		}
	}

	/**
	 * Processes a player's guess
	 * @param {string} location - The location to guess (e.g., "00", "34")
	 * @returns {Object} Result of the guess and game state
	 */
	processPlayerGuess(location) {
		if (this.gameState !== GameController.GAME_STATE_PLAYER_TURN) {
			return {
				success: false,
				message: 'Not player turn',
				gameState: this.gameState,
			};
		}

		// Validate input
		const validation = this.validateGuess(location);
		if (!validation.valid) {
			return {
				success: false,
				message: validation.message,
				gameState: this.gameState,
			};
		}

		// Process the guess
		const result = this.cpuBoard.processGuess(location);

		if (result.duplicate) {
			return {
				success: false,
				message: 'You already guessed that location!',
				gameState: this.gameState,
			};
		}

		const response = {
			success: true,
			hit: result.hit,
			sunk: result.sunk,
			location,
			message: this.getPlayerGuessMessage(result),
			gameState: this.gameState,
			turn: this.currentTurn,
		};

		// Check for game end
		if (this.cpuBoard.areAllShipsSunk()) {
			this.gameState = GameController.GAME_STATE_PLAYER_WIN;
			response.gameState = this.gameState;
			response.message += ' You win!';
		} else {
			this.gameState = GameController.GAME_STATE_CPU_TURN;
			response.gameState = this.gameState;
		}

		return response;
	}

	/**
	 * Processes the CPU's turn
	 * @returns {Object} Result of CPU's guess and game state
	 */
	processCpuTurn() {
		if (this.gameState !== GameController.GAME_STATE_CPU_TURN) {
			return {
				success: false,
				message: 'Not CPU turn',
				gameState: this.gameState,
			};
		}

		const cpuGuess = this.cpuPlayer.makeGuess(this.playerBoard);
		const result = this.playerBoard.processGuess(cpuGuess);

		// Let CPU process the result for AI learning
		this.cpuPlayer.processGuessResult(cpuGuess, result);

		const response = {
			success: true,
			hit: result.hit,
			sunk: result.sunk,
			location: cpuGuess,
			message: this.getCpuGuessMessage(result, cpuGuess),
			gameState: this.gameState,
			turn: this.currentTurn,
			cpuMode: this.cpuPlayer.getCurrentMode(),
		};

		// Check for game end
		if (this.playerBoard.areAllShipsSunk()) {
			this.gameState = GameController.GAME_STATE_CPU_WIN;
			response.gameState = this.gameState;
			response.message += ' CPU wins!';
		} else {
			this.gameState = GameController.GAME_STATE_PLAYER_TURN;
			this.currentTurn++;
			response.gameState = this.gameState;
		}

		return response;
	}

	/**
	 * Validates a player's guess
	 * @param {string} location - The location to validate
	 * @returns {Object} Validation result
	 */
	validateGuess(location) {
		if (!location || typeof location !== 'string') {
			return { valid: false, message: 'Invalid input format' };
		}

		if (location.length !== 2) {
			return {
				valid: false,
				message: 'Input must be exactly two digits (e.g., 00, 34, 98)',
			};
		}

		const row = parseInt(location[0]);
		const col = parseInt(location[1]);

		if (isNaN(row) || isNaN(col)) {
			return { valid: false, message: 'Input must contain only digits' };
		}

		if (
			row < 0 ||
			row >= this.config.boardSize ||
			col < 0 ||
			col >= this.config.boardSize
		) {
			return {
				valid: false,
				message: `Coordinates must be between 0 and ${
					this.config.boardSize - 1
				}`,
			};
		}

		return { valid: true };
	}

	/**
	 * Gets the appropriate message for a player's guess result
	 * @param {Object} result - The guess result
	 * @returns {string} Message describing the result
	 */
	getPlayerGuessMessage(result) {
		if (result.hit) {
			return result.sunk ? 'Hit! You sunk an enemy battleship!' : 'Hit!';
		}
		return 'Miss.';
	}

	/**
	 * Gets the appropriate message for a CPU's guess result
	 * @param {Object} result - The guess result
	 * @param {string} location - The guessed location
	 * @returns {string} Message describing the result
	 */
	getCpuGuessMessage(result, location) {
		if (result.hit) {
			const baseMessage = `CPU hit at ${location}!`;
			return result.sunk
				? `${baseMessage} CPU sunk your battleship!`
				: baseMessage;
		}
		return `CPU missed at ${location}.`;
	}

	/**
	 * Gets the current game state
	 * @returns {Object} Current game state information
	 */
	getGameState() {
		return {
			state: this.gameState,
			turn: this.currentTurn,
			playerShipsRemaining: this.playerBoard.getRemainingShips(),
			cpuShipsRemaining: this.cpuBoard.getRemainingShips(),
			playerBoard: this.playerBoard.getGrid(),
			cpuBoard: this.cpuBoard.getGrid(),
			cpuMode: this.cpuPlayer.getCurrentMode(),
		};
	}

	/**
	 * Resets the game to initial state
	 */
	resetGame() {
		this.playerBoard = new Board(this.config.boardSize);
		this.cpuBoard = new Board(this.config.boardSize);
		this.cpuPlayer.reset();
		this.gameState = GameController.GAME_STATE_SETUP;
		this.currentTurn = 1;
	}

	/**
	 * Checks if the game is over
	 * @returns {boolean} True if game is over
	 */
	isGameOver() {
		return (
			this.gameState === GameController.GAME_STATE_PLAYER_WIN ||
			this.gameState === GameController.GAME_STATE_CPU_WIN
		);
	}

	/**
	 * Gets the winner of the game
	 * @returns {string|null} 'player', 'cpu', or null if game not over
	 */
	getWinner() {
		if (this.gameState === GameController.GAME_STATE_PLAYER_WIN)
			return 'player';
		if (this.gameState === GameController.GAME_STATE_CPU_WIN) return 'cpu';
		return null;
	}
}
