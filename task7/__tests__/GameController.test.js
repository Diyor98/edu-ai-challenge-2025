import { jest } from '@jest/globals';
import { GameController } from '../src/game/GameController.js';
import { ShipPlacer } from '../src/utils/ShipPlacer.js';

// Mock the ShipPlacer to avoid randomness in tests
const mockShip = {
	locations: ['00', '01', '02'],
	hits: [false, false, false],
	hit: jest.fn((location) => {
		const index = mockShip.locations.indexOf(location);
		if (index !== -1 && !mockShip.hits[index]) {
			mockShip.hits[index] = true;
			return true;
		}
		return false;
	}),
	isSunk: jest.fn(() => mockShip.hits.every((hit) => hit === true)),
	hasLocation: jest.fn((location) => mockShip.locations.includes(location)),
	isHitAt: jest.fn((location) => {
		const index = mockShip.locations.indexOf(location);
		return index !== -1 && mockShip.hits[index];
	}),
	getHitCount: jest.fn(
		() => mockShip.hits.filter((hit) => hit === true).length
	),
};

// Mock ShipPlacer.placeShipsRandomly
jest
	.spyOn(ShipPlacer, 'placeShipsRandomly')
	.mockImplementation((board, numShips, shipLength, showShips) => {
		board.addShip(mockShip, showShips);
		return [mockShip];
	});

describe('GameController', () => {
	let gameController;

	beforeEach(() => {
		gameController = new GameController({
			boardSize: 5,
			numShips: 1,
			shipLength: 3,
		});
		jest.clearAllMocks();
		// Reset mock ship state
		mockShip.hits = [false, false, false];
	});

	describe('constructor', () => {
		test('should initialize with default config', () => {
			const defaultController = new GameController();
			expect(defaultController.config.boardSize).toBe(10);
			expect(defaultController.config.numShips).toBe(3);
			expect(defaultController.config.shipLength).toBe(3);
		});

		test('should initialize with custom config', () => {
			expect(gameController.config.boardSize).toBe(5);
			expect(gameController.config.numShips).toBe(1);
			expect(gameController.config.shipLength).toBe(3);
		});

		test('should start in setup state', () => {
			expect(gameController.gameState).toBe(GameController.GAME_STATE_SETUP);
			expect(gameController.currentTurn).toBe(1);
		});
	});

	describe('initializeGame', () => {
		test('should successfully initialize game', async () => {
			const result = await gameController.initializeGame();

			expect(result.success).toBe(true);
			expect(result.message).toBe('Game initialized successfully');
			expect(gameController.gameState).toBe(
				GameController.GAME_STATE_PLAYER_TURN
			);
		});

		test('should handle initialization errors', async () => {
			// Mock ShipPlacer to throw an error
			const mockError = new Error('Placement failed');
			ShipPlacer.placeShipsRandomly.mockImplementationOnce(() => {
				throw mockError;
			});

			const result = await gameController.initializeGame();

			expect(result.success).toBe(false);
			expect(result.message).toContain('Failed to initialize game');
		});
	});

	describe('validateGuess', () => {
		test('should validate correct input', () => {
			const result = gameController.validateGuess('23');
			expect(result.valid).toBe(true);
		});

		test('should reject null input', () => {
			const result = gameController.validateGuess(null);
			expect(result.valid).toBe(false);
			expect(result.message).toBe('Invalid input format');
		});

		test('should reject wrong length input', () => {
			const result = gameController.validateGuess('123');
			expect(result.valid).toBe(false);
			expect(result.message).toContain('exactly two digits');
		});

		test('should reject non-numeric input', () => {
			const result = gameController.validateGuess('ab');
			expect(result.valid).toBe(false);
			expect(result.message).toBe('Input must contain only digits');
		});

		test('should reject out-of-bounds coordinates', () => {
			const result = gameController.validateGuess('59');
			expect(result.valid).toBe(false);
			expect(result.message).toContain('between 0 and 4');
		});
	});

	describe('processPlayerGuess', () => {
		beforeEach(async () => {
			await gameController.initializeGame();
		});

		test('should reject guess when not player turn', () => {
			gameController.gameState = GameController.GAME_STATE_CPU_TURN;

			const result = gameController.processPlayerGuess('00');
			expect(result.success).toBe(false);
			expect(result.message).toBe('Not player turn');
		});

		test('should reject invalid input', () => {
			const result = gameController.processPlayerGuess('invalid');
			expect(result.success).toBe(false);
			expect(result.message).toContain('exactly two digits');
		});

		test('should process successful hit', () => {
			const result = gameController.processPlayerGuess('00');

			expect(result.success).toBe(true);
			expect(result.hit).toBe(true);
			expect(result.location).toBe('00');
			expect(gameController.gameState).toBe(GameController.GAME_STATE_CPU_TURN);
		});

		test('should process miss', () => {
			const result = gameController.processPlayerGuess('44');

			expect(result.success).toBe(true);
			expect(result.hit).toBe(false);
			expect(result.location).toBe('44');
			expect(gameController.gameState).toBe(GameController.GAME_STATE_CPU_TURN);
		});

		test('should detect player win', () => {
			// Hit all ship locations one by one, resetting state each time
			const result1 = gameController.processPlayerGuess('00');
			expect(result1.success).toBe(true);
			expect(result1.hit).toBe(true);

			gameController.gameState = GameController.GAME_STATE_PLAYER_TURN;
			const result2 = gameController.processPlayerGuess('01');
			expect(result2.success).toBe(true);
			expect(result2.hit).toBe(true);

			gameController.gameState = GameController.GAME_STATE_PLAYER_TURN;
			const result3 = gameController.processPlayerGuess('02');

			expect(result3.success).toBe(true);
			expect(result3.sunk).toBe(true);
			expect(gameController.gameState).toBe(
				GameController.GAME_STATE_PLAYER_WIN
			);
			expect(result3.message).toContain('You win!');
		});

		test('should handle duplicate guess', () => {
			const result1 = gameController.processPlayerGuess('00');
			expect(result1.success).toBe(true);

			gameController.gameState = GameController.GAME_STATE_PLAYER_TURN;
			const result2 = gameController.processPlayerGuess('00');

			expect(result2.success).toBe(false);
			expect(result2.message).toBe('You already guessed that location!');
		});
	});

	describe('processCpuTurn', () => {
		beforeEach(async () => {
			await gameController.initializeGame();
			gameController.gameState = GameController.GAME_STATE_CPU_TURN;
		});

		test('should reject when not CPU turn', () => {
			gameController.gameState = GameController.GAME_STATE_PLAYER_TURN;

			const result = gameController.processCpuTurn();
			expect(result.success).toBe(false);
			expect(result.message).toBe('Not CPU turn');
		});

		test('should process CPU turn successfully', () => {
			const result = gameController.processCpuTurn();

			expect(result.success).toBe(true);
			expect(result.location).toMatch(/^[0-4][0-4]$/);
			expect(gameController.gameState).toBe(
				GameController.GAME_STATE_PLAYER_TURN
			);
			expect(gameController.currentTurn).toBe(2);
		});

		test('should detect CPU win', () => {
			// Force CPU to hit all player ship locations
			const cpuGuess = jest.spyOn(gameController.cpuPlayer, 'makeGuess');
			cpuGuess
				.mockReturnValueOnce('00')
				.mockReturnValueOnce('01')
				.mockReturnValueOnce('02');

			gameController.processCpuTurn(); // Hit 00
			gameController.gameState = GameController.GAME_STATE_CPU_TURN;
			gameController.processCpuTurn(); // Hit 01
			gameController.gameState = GameController.GAME_STATE_CPU_TURN;
			const result = gameController.processCpuTurn(); // Hit 02 and sink

			expect(gameController.gameState).toBe(GameController.GAME_STATE_CPU_WIN);
			expect(result.message).toContain('CPU wins!');
		});
	});

	describe('getPlayerGuessMessage', () => {
		test('should return hit message', () => {
			const result = { hit: true, sunk: false };
			const message = gameController.getPlayerGuessMessage(result);
			expect(message).toBe('Hit!');
		});

		test('should return sunk message', () => {
			const result = { hit: true, sunk: true };
			const message = gameController.getPlayerGuessMessage(result);
			expect(message).toBe('Hit! You sunk an enemy battleship!');
		});

		test('should return miss message', () => {
			const result = { hit: false, sunk: false };
			const message = gameController.getPlayerGuessMessage(result);
			expect(message).toBe('Miss.');
		});
	});

	describe('getCpuGuessMessage', () => {
		test('should return CPU hit message', () => {
			const result = { hit: true, sunk: false };
			const message = gameController.getCpuGuessMessage(result, '23');
			expect(message).toBe('CPU hit at 23!');
		});

		test('should return CPU sunk message', () => {
			const result = { hit: true, sunk: true };
			const message = gameController.getCpuGuessMessage(result, '23');
			expect(message).toBe('CPU hit at 23! CPU sunk your battleship!');
		});

		test('should return CPU miss message', () => {
			const result = { hit: false, sunk: false };
			const message = gameController.getCpuGuessMessage(result, '23');
			expect(message).toBe('CPU missed at 23.');
		});
	});

	describe('getGameState', () => {
		beforeEach(async () => {
			await gameController.initializeGame();
		});

		test('should return complete game state', () => {
			const state = gameController.getGameState();

			expect(state).toHaveProperty('state');
			expect(state).toHaveProperty('turn');
			expect(state).toHaveProperty('playerShipsRemaining');
			expect(state).toHaveProperty('cpuShipsRemaining');
			expect(state).toHaveProperty('playerBoard');
			expect(state).toHaveProperty('cpuBoard');
			expect(state).toHaveProperty('cpuMode');

			expect(state.turn).toBe(1);
			expect(state.playerShipsRemaining).toBe(1);
			expect(state.cpuShipsRemaining).toBe(1);
		});
	});

	describe('resetGame', () => {
		beforeEach(async () => {
			await gameController.initializeGame();
			gameController.processPlayerGuess('00'); // Make some moves
			gameController.processCpuTurn();
		});

		test('should reset to initial state', () => {
			gameController.resetGame();

			expect(gameController.gameState).toBe(GameController.GAME_STATE_SETUP);
			expect(gameController.currentTurn).toBe(1);
			expect(gameController.playerBoard.ships).toHaveLength(0);
			expect(gameController.cpuBoard.ships).toHaveLength(0);
		});
	});

	describe('isGameOver', () => {
		test('should return false during game', () => {
			expect(gameController.isGameOver()).toBe(false);
		});

		test('should return true when player wins', () => {
			gameController.gameState = GameController.GAME_STATE_PLAYER_WIN;
			expect(gameController.isGameOver()).toBe(true);
		});

		test('should return true when CPU wins', () => {
			gameController.gameState = GameController.GAME_STATE_CPU_WIN;
			expect(gameController.isGameOver()).toBe(true);
		});
	});

	describe('getWinner', () => {
		test('should return null during game', () => {
			expect(gameController.getWinner()).toBeNull();
		});

		test('should return player when player wins', () => {
			gameController.gameState = GameController.GAME_STATE_PLAYER_WIN;
			expect(gameController.getWinner()).toBe('player');
		});

		test('should return cpu when CPU wins', () => {
			gameController.gameState = GameController.GAME_STATE_CPU_WIN;
			expect(gameController.getWinner()).toBe('cpu');
		});
	});

	describe('game state constants', () => {
		test('should have correct state constants', () => {
			expect(GameController.GAME_STATE_SETUP).toBe('setup');
			expect(GameController.GAME_STATE_PLAYER_TURN).toBe('player_turn');
			expect(GameController.GAME_STATE_CPU_TURN).toBe('cpu_turn');
			expect(GameController.GAME_STATE_PLAYER_WIN).toBe('player_win');
			expect(GameController.GAME_STATE_CPU_WIN).toBe('cpu_win');
		});
	});
});
