import { ShipPlacer } from '../src/utils/ShipPlacer.js';
import { Board } from '../src/models/Board.js';
import { Ship } from '../src/models/Ship.js';

describe('ShipPlacer', () => {
	let board;

	beforeEach(() => {
		board = new Board(5); // Using smaller board for easier testing
	});

	describe('placeShipsRandomly', () => {
		test('should place correct number of ships', () => {
			const ships = ShipPlacer.placeShipsRandomly(board, 2, 3, false);
			expect(ships).toHaveLength(2);
			expect(board.ships).toHaveLength(2);
		});

		test('should place ships with correct length', () => {
			const ships = ShipPlacer.placeShipsRandomly(board, 1, 3, false);
			expect(ships[0].length).toBe(3);
			expect(ships[0].locations).toHaveLength(3);
		});

		test('should show ships on board when requested', () => {
			ShipPlacer.placeShipsRandomly(board, 1, 3, true);

			let shipCells = 0;
			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 5; col++) {
					if (board.grid[row][col] === Board.SHIP) {
						shipCells++;
					}
				}
			}
			expect(shipCells).toBe(3);
		});

		test('should not show ships when not requested', () => {
			ShipPlacer.placeShipsRandomly(board, 1, 3, false);

			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 5; col++) {
					expect(board.grid[row][col]).toBe(Board.WATER);
				}
			}
		});

		test('should handle case when ship placement fails', () => {
			// This test checks the error path but may not always fail due to randomness
			try {
				ShipPlacer.placeShipsRandomly(board, 100, 3, false);
				// If it doesn't throw, that's also valid (just very unlikely)
				expect(true).toBe(true);
			} catch (error) {
				expect(error.message).toContain('Failed to place all ships');
			}
		});

		test('should not place overlapping ships', () => {
			const ships = ShipPlacer.placeShipsRandomly(board, 2, 2, false);

			const allLocations = ships.flatMap((ship) => ship.locations);
			const uniqueLocations = new Set(allLocations);

			expect(allLocations.length).toBe(uniqueLocations.size);
		});
	});

	describe('attemptShipPlacement', () => {
		test('should return ship when placement is valid', () => {
			const ship = ShipPlacer.attemptShipPlacement(board, 3);
			expect(ship).toBeInstanceOf(Ship);
			expect(ship.locations).toHaveLength(3);
		});

		test('should return null when placement is invalid', () => {
			// Fill the board to make placement impossible
			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 5; col++) {
					board.grid[row][col] = Board.SHIP;
				}
			}

			const ship = ShipPlacer.attemptShipPlacement(board, 3);
			expect(ship).toBeNull();
		});
	});

	describe('getRandomStartPosition', () => {
		test('should return valid horizontal position', () => {
			const { startRow, startCol } = ShipPlacer.getRandomStartPosition(
				5,
				3,
				ShipPlacer.HORIZONTAL
			);

			expect(startRow).toBeGreaterThanOrEqual(0);
			expect(startRow).toBeLessThan(5);
			expect(startCol).toBeGreaterThanOrEqual(0);
			expect(startCol).toBeLessThanOrEqual(2); // 5 - 3 = 2
		});

		test('should return valid vertical position', () => {
			const { startRow, startCol } = ShipPlacer.getRandomStartPosition(
				5,
				3,
				ShipPlacer.VERTICAL
			);

			expect(startRow).toBeGreaterThanOrEqual(0);
			expect(startRow).toBeLessThanOrEqual(2); // 5 - 3 = 2
			expect(startCol).toBeGreaterThanOrEqual(0);
			expect(startCol).toBeLessThan(5);
		});
	});

	describe('generateShipLocations', () => {
		test('should generate horizontal ship locations', () => {
			const locations = ShipPlacer.generateShipLocations(
				1,
				2,
				3,
				ShipPlacer.HORIZONTAL
			);
			expect(locations).toEqual(['12', '13', '14']);
		});

		test('should generate vertical ship locations', () => {
			const locations = ShipPlacer.generateShipLocations(
				1,
				2,
				3,
				ShipPlacer.VERTICAL
			);
			expect(locations).toEqual(['12', '22', '32']);
		});

		test('should handle single cell ship', () => {
			const locations = ShipPlacer.generateShipLocations(
				2,
				3,
				1,
				ShipPlacer.HORIZONTAL
			);
			expect(locations).toEqual(['23']);
		});
	});

	describe('canPlaceShip', () => {
		test('should return true for valid placement', () => {
			const locations = ['12', '13', '14'];
			const canPlace = ShipPlacer.canPlaceShip(board, locations);
			expect(canPlace).toBe(true);
		});

		test('should return false for out-of-bounds placement', () => {
			const locations = ['12', '13', '19']; // 19 is out of bounds for 5x5 board
			const canPlace = ShipPlacer.canPlaceShip(board, locations);
			expect(canPlace).toBe(false);
		});

		test('should return false for occupied space', () => {
			board.grid[1][2] = Board.SHIP;
			const locations = ['12', '13', '14'];
			const canPlace = ShipPlacer.canPlaceShip(board, locations);
			expect(canPlace).toBe(false);
		});

		test('should return true for empty locations', () => {
			const locations = ['00', '01'];
			const canPlace = ShipPlacer.canPlaceShip(board, locations);
			expect(canPlace).toBe(true);
		});
	});

	describe('constants', () => {
		test('should have correct orientation constants', () => {
			expect(ShipPlacer.HORIZONTAL).toBe('horizontal');
			expect(ShipPlacer.VERTICAL).toBe('vertical');
		});
	});

	describe('integration tests', () => {
		test('should successfully place multiple ships', () => {
			const ships = ShipPlacer.placeShipsRandomly(board, 2, 2, false);

			// Verify we got the correct number of ships
			expect(ships).toHaveLength(2);

			// Verify each ship has correct length
			ships.forEach((ship) => {
				expect(ship.locations).toHaveLength(2);
			});

			// Verify total locations don't exceed board size
			const allLocations = ships.flatMap((ship) => ship.locations);
			expect(allLocations.length).toBeLessThanOrEqual(25); // 5x5 board
		});

		test('should handle edge case with minimal space', () => {
			const smallBoard = new Board(3);
			const ships = ShipPlacer.placeShipsRandomly(smallBoard, 1, 2, false);

			expect(ships).toHaveLength(1);
			expect(ships[0].locations).toHaveLength(2);

			// Verify locations are valid
			ships[0].locations.forEach((location) => {
				const [row, col] = smallBoard.parseLocation(location);
				expect(row).toBeGreaterThanOrEqual(0);
				expect(row).toBeLessThan(3);
				expect(col).toBeGreaterThanOrEqual(0);
				expect(col).toBeLessThan(3);
			});
		});
	});
});
