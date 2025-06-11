import { GameController } from './game/GameController.js';
import { GameDisplay } from './ui/GameDisplay.js';
import { InputHandler } from './ui/InputHandler.js';

/**
 * Main application class for the Sea Battle game
 */
export class SeaBattleApp {
	constructor(config = {}) {
		this.gameController = new GameController(config);
		this.inputHandler = new InputHandler();
		this.isRunning = false;
	}

	/**
	 * Starts the Sea Battle application
	 */
	async start() {
		try {
			this.inputHandler.setupShutdownHandlers();
			GameDisplay.printWelcome(this.gameController.config.numShips);

			await this.showMainMenu();
		} catch (error) {
			GameDisplay.printMessage(`Application error: ${error.message}`, 'error');
		} finally {
			this.inputHandler.close();
		}
	}

	/**
	 * Shows the main menu and handles user selection
	 */
	async showMainMenu() {
		const options = ['Start New Game', 'Configure Game Settings', 'Exit'];

		while (true) {
			const choice = await this.inputHandler.showMenu(
				options,
				'🚢 SEA BATTLE - MAIN MENU'
			);

			switch (choice) {
				case 0:
					await this.startNewGame();
					break;
				case 1:
					await this.configureGame();
					break;
				case 2:
					GameDisplay.printMessage('Thanks for playing Sea Battle! 👋', 'info');
					return;
				default:
					GameDisplay.printMessage('Invalid choice', 'error');
			}
		}
	}

	/**
	 * Configures game settings
	 */
	async configureGame() {
		try {
			const config = await this.inputHandler.getGameConfiguration();

			// Validate configuration
			if (config.boardSize < 5 || config.boardSize > 15) {
				GameDisplay.printMessage(
					'Board size must be between 5 and 15',
					'error'
				);
				return;
			}

			if (config.numShips < 1 || config.numShips > 10) {
				GameDisplay.printMessage(
					'Number of ships must be between 1 and 10',
					'error'
				);
				return;
			}

			if (config.shipLength < 2 || config.shipLength > config.boardSize) {
				GameDisplay.printMessage(
					`Ship length must be between 2 and ${config.boardSize}`,
					'error'
				);
				return;
			}

			this.gameController = new GameController(config);
			GameDisplay.printMessage(
				'Game configuration updated successfully!',
				'success'
			);
		} catch (error) {
			GameDisplay.printMessage(
				`Configuration error: ${error.message}`,
				'error'
			);
		}
	}

	/**
	 * Starts a new game
	 */
	async startNewGame() {
		try {
			this.isRunning = true;
			GameDisplay.printMessage('Initializing game...', 'info');

			await GameDisplay.printLoading('Placing ships', 1500);

			const initResult = await this.gameController.initializeGame();
			if (!initResult.success) {
				GameDisplay.printMessage(initResult.message, 'error');
				return;
			}

			GameDisplay.printMessage(
				'Game initialized! Let the battle begin! ⚔️',
				'success'
			);
			await this.runGameLoop();
		} catch (error) {
			GameDisplay.printMessage(
				`Game initialization error: ${error.message}`,
				'error'
			);
		} finally {
			this.isRunning = false;
		}
	}

	/**
	 * Main game loop
	 */
	async runGameLoop() {
		while (this.isRunning && !this.gameController.isGameOver()) {
			const gameState = this.gameController.getGameState();

			// Display current state
			GameDisplay.printBoards(
				gameState.cpuBoard,
				gameState.playerBoard,
				this.gameController.config.boardSize
			);

			GameDisplay.printGameStats(gameState);

			if (gameState.state === 'player_turn') {
				await this.handlePlayerTurn();
			} else if (gameState.state === 'cpu_turn') {
				await this.handleCpuTurn();
			}
		}

		// Game over
		if (this.gameController.isGameOver()) {
			await this.handleGameEnd();
		}
	}

	/**
	 * Handles the player's turn
	 */
	async handlePlayerTurn() {
		let validMove = false;

		while (!validMove && this.isRunning) {
			try {
				const input = await this.inputHandler.getPlayerGuess();
				const result = this.gameController.processPlayerGuess(input);

				if (result.success) {
					validMove = true;
					GameDisplay.printMessage(
						result.message,
						result.hit ? 'success' : 'info'
					);

					if (result.sunk) {
						await InputHandler.pause(1000);
						GameDisplay.printMessage('🔥 SHIP DESTROYED! 🔥', 'success');
					}
				} else {
					GameDisplay.printMessage(result.message, 'error');
				}
			} catch (error) {
				GameDisplay.printMessage(`Input error: ${error.message}`, 'error');
			}
		}
	}

	/**
	 * Handles the CPU's turn
	 */
	async handleCpuTurn() {
		GameDisplay.printCpuTurnStart();

		await InputHandler.pause(1000); // Add suspense

		const result = this.gameController.processCpuTurn();

		if (result.success) {
			GameDisplay.printMessage(result.message, result.hit ? 'warning' : 'info');

			if (result.sunk) {
				await InputHandler.pause(1000);
				GameDisplay.printMessage('💥 YOUR SHIP WAS DESTROYED! 💥', 'error');
			}
		} else {
			GameDisplay.printMessage(`CPU turn error: ${result.message}`, 'error');
		}

		await InputHandler.pause(1500); // Give player time to read
	}

	/**
	 * Handles game end
	 */
	async handleGameEnd() {
		const gameState = this.gameController.getGameState();
		const winner = this.gameController.getWinner();

		// Show final board state
		GameDisplay.printBoards(
			gameState.cpuBoard,
			gameState.playerBoard,
			this.gameController.config.boardSize
		);

		GameDisplay.printGameResult(winner, gameState);

		// Ask if player wants to play again
		const playAgain = await this.inputHandler.askConfirmation(
			'Would you like to play again?'
		);

		if (playAgain) {
			this.gameController.resetGame();
			await this.startNewGame();
		}
	}

	/**
	 * Gracefully stops the application
	 */
	stop() {
		this.isRunning = false;
		this.inputHandler.close();
	}

	/**
	 * Gets current game statistics
	 * @returns {Object} Game statistics
	 */
	getGameStatistics() {
		const gameState = this.gameController.getGameState();
		return {
			turn: gameState.turn,
			playerShipsRemaining: gameState.playerShipsRemaining,
			cpuShipsRemaining: gameState.cpuShipsRemaining,
			gameState: gameState.state,
			cpuMode: gameState.cpuMode,
		};
	}
}
