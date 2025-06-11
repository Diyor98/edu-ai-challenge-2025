import { Board } from '../src/models/Board.js';
import { Ship } from '../src/models/Ship.js';

describe('Board', () => {
	let board;
	let ship;

	beforeEach(() => {
		board = new Board(5); // Using smaller board for easier testing
		ship = new Ship(['00', '01', '02'], 3);
	});

	describe('constructor', () => {
		test('should create board with correct size', () => {
			expect(board.size).toBe(5);
			expect(board.grid).toHaveLength(5);
			expect(board.grid[0]).toHaveLength(5);
		});

		test('should initialize with water symbols', () => {
			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 5; col++) {
					expect(board.grid[row][col]).toBe(Board.WATER);
				}
			}
		});

		test('should use default size when not provided', () => {
			const defaultBoard = new Board();
			expect(defaultBoard.size).toBe(10);
			expect(defaultBoard.grid).toHaveLength(10);
		});

		test('should initialize empty collections', () => {
			expect(board.ships).toHaveLength(0);
			expect(board.guesses.size).toBe(0);
		});
	});

	describe('createEmptyGrid', () => {
		test('should create grid filled with water', () => {
			const grid = board.createEmptyGrid();
			expect(grid).toHaveLength(5);
			expect(grid[0]).toHaveLength(5);
			expect(grid[2][3]).toBe(Board.WATER);
		});
	});

	describe('addShip', () => {
		test('should add ship without showing on grid', () => {
			board.addShip(ship, false);
			expect(board.ships).toHaveLength(1);
			expect(board.ships[0]).toBe(ship);
			expect(board.grid[0][0]).toBe(Board.WATER);
		});

		test('should add ship and show on grid', () => {
			board.addShip(ship, true);
			expect(board.ships).toHaveLength(1);
			expect(board.grid[0][0]).toBe(Board.SHIP);
			expect(board.grid[0][1]).toBe(Board.SHIP);
			expect(board.grid[0][2]).toBe(Board.SHIP);
		});

		test('should handle multiple ships', () => {
			const ship2 = new Ship(['10', '11'], 2);
			board.addShip(ship, false);
			board.addShip(ship2, false);
			expect(board.ships).toHaveLength(2);
		});
	});

	describe('processGuess', () => {
		beforeEach(() => {
			board.addShip(ship, false);
		});

		test('should process hit correctly', () => {
			const result = board.processGuess('01');
			expect(result.hit).toBe(true);
			expect(result.sunk).toBe(false);
			expect(result.ship).toBe(ship);
			expect(result.duplicate).toBe(false);
			expect(board.grid[0][1]).toBe(Board.HIT);
		});

		test('should process miss correctly', () => {
			const result = board.processGuess('33');
			expect(result.hit).toBe(false);
			expect(result.sunk).toBe(false);
			expect(result.ship).toBe(null);
			expect(result.duplicate).toBe(false);
			expect(board.grid[3][3]).toBe(Board.MISS);
		});

		test('should detect sunk ship', () => {
			board.processGuess('00');
			board.processGuess('01');
			const result = board.processGuess('02');
			expect(result.hit).toBe(true);
			expect(result.sunk).toBe(true);
			expect(result.ship).toBe(ship);
		});

		test('should handle duplicate guess', () => {
			board.processGuess('01');
			const result = board.processGuess('01');
			expect(result.duplicate).toBe(true);
			expect(result.hit).toBe(false);
		});

		test('should track guesses', () => {
			board.processGuess('01');
			board.processGuess('33');
			expect(board.guesses.has('01')).toBe(true);
			expect(board.guesses.has('33')).toBe(true);
			expect(board.guesses.size).toBe(2);
		});
	});

	describe('isValidLocation', () => {
		test('should return true for valid locations', () => {
			expect(board.isValidLocation(0, 0)).toBe(true);
			expect(board.isValidLocation(4, 4)).toBe(true);
			expect(board.isValidLocation(2, 3)).toBe(true);
		});

		test('should return false for out-of-bounds locations', () => {
			expect(board.isValidLocation(-1, 0)).toBe(false);
			expect(board.isValidLocation(0, -1)).toBe(false);
			expect(board.isValidLocation(5, 0)).toBe(false);
			expect(board.isValidLocation(0, 5)).toBe(false);
		});

		test('should return false for occupied locations', () => {
			board.addShip(ship, true);
			expect(board.isValidLocation(0, 0)).toBe(false);
			expect(board.isValidLocation(0, 1)).toBe(false);
		});
	});

	describe('parseLocation', () => {
		test('should parse location correctly', () => {
			expect(board.parseLocation('00')).toEqual([0, 0]);
			expect(board.parseLocation('23')).toEqual([2, 3]);
			expect(board.parseLocation('44')).toEqual([4, 4]);
		});
	});

	describe('formatLocation', () => {
		test('should format location correctly', () => {
			expect(board.formatLocation(0, 0)).toBe('00');
			expect(board.formatLocation(2, 3)).toBe('23');
			expect(board.formatLocation(4, 4)).toBe('44');
		});
	});

	describe('getRemainingShips', () => {
		test('should return correct count for no ships', () => {
			expect(board.getRemainingShips()).toBe(0);
		});

		test('should return correct count for unsunk ships', () => {
			const ship2 = new Ship(['10', '11'], 2);
			board.addShip(ship, false);
			board.addShip(ship2, false);
			expect(board.getRemainingShips()).toBe(2);
		});

		test('should return correct count after sinking ships', () => {
			const ship2 = new Ship(['10', '11'], 2);
			board.addShip(ship, false);
			board.addShip(ship2, false);

			// Sink first ship
			ship.hit('00');
			ship.hit('01');
			ship.hit('02');

			expect(board.getRemainingShips()).toBe(1);
		});
	});

	describe('areAllShipsSunk', () => {
		test('should return true when no ships', () => {
			expect(board.areAllShipsSunk()).toBe(true);
		});

		test('should return false with unsunk ships', () => {
			board.addShip(ship, false);
			expect(board.areAllShipsSunk()).toBe(false);
		});

		test('should return true when all ships sunk', () => {
			board.addShip(ship, false);
			ship.hit('00');
			ship.hit('01');
			ship.hit('02');
			expect(board.areAllShipsSunk()).toBe(true);
		});
	});

	describe('getGrid', () => {
		test('should return copy of grid', () => {
			const grid = board.getGrid();
			expect(grid).toEqual(board.grid);
			expect(grid).not.toBe(board.grid); // Should be a copy
		});

		test('should not affect original when copy is modified', () => {
			const grid = board.getGrid();
			grid[0][0] = 'X';
			expect(board.grid[0][0]).toBe(Board.WATER);
		});
	});

	describe('hasBeenGuessed', () => {
		test('should return false for new location', () => {
			expect(board.hasBeenGuessed('00')).toBe(false);
		});

		test('should return true for guessed location', () => {
			board.processGuess('00');
			expect(board.hasBeenGuessed('00')).toBe(true);
		});
	});
});
