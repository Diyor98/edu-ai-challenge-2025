import { Ship } from '../src/models/Ship.js';

describe('Ship', () => {
	let ship;

	beforeEach(() => {
		ship = new Ship(['00', '01', '02'], 3);
	});

	describe('constructor', () => {
		test('should create a ship with correct locations and length', () => {
			expect(ship.locations).toEqual(['00', '01', '02']);
			expect(ship.length).toBe(3);
			expect(ship.hits).toEqual([false, false, false]);
		});

		test('should create a copy of locations array', () => {
			const originalLocations = ['10', '11'];
			const testShip = new Ship(originalLocations, 2);
			originalLocations.push('12'); // Modify original
			expect(testShip.locations).toEqual(['10', '11']); // Should not be affected
		});

		test('should use default length when not provided', () => {
			const testShip = new Ship(['30', '31', '32']);
			expect(testShip.length).toBe(3);
			expect(testShip.hits).toEqual([false, false, false]);
		});
	});

	describe('hit', () => {
		test('should successfully hit a valid location', () => {
			const result = ship.hit('01');
			expect(result).toBe(true);
			expect(ship.hits[1]).toBe(true);
		});

		test('should return false for invalid location', () => {
			const result = ship.hit('99');
			expect(result).toBe(false);
			expect(ship.hits).toEqual([false, false, false]);
		});

		test('should return false when hitting same location twice', () => {
			ship.hit('00');
			const result = ship.hit('00');
			expect(result).toBe(false);
			expect(ship.hits[0]).toBe(true); // Should still be hit
		});

		test('should handle multiple hits on different locations', () => {
			ship.hit('00');
			ship.hit('02');
			expect(ship.hits).toEqual([true, false, true]);
		});
	});

	describe('isSunk', () => {
		test('should return false when ship is not fully hit', () => {
			ship.hit('00');
			expect(ship.isSunk()).toBe(false);
		});

		test('should return true when all parts are hit', () => {
			ship.hit('00');
			ship.hit('01');
			ship.hit('02');
			expect(ship.isSunk()).toBe(true);
		});

		test('should return false for new ship', () => {
			expect(ship.isSunk()).toBe(false);
		});
	});

	describe('hasLocation', () => {
		test('should return true for valid location', () => {
			expect(ship.hasLocation('01')).toBe(true);
		});

		test('should return false for invalid location', () => {
			expect(ship.hasLocation('33')).toBe(false);
		});

		test('should handle edge cases', () => {
			expect(ship.hasLocation('')).toBe(false);
			expect(ship.hasLocation(null)).toBe(false);
			expect(ship.hasLocation(undefined)).toBe(false);
		});
	});

	describe('isHitAt', () => {
		test('should return false for unhit location', () => {
			expect(ship.isHitAt('00')).toBe(false);
		});

		test('should return true for hit location', () => {
			ship.hit('00');
			expect(ship.isHitAt('00')).toBe(true);
		});

		test('should return false for invalid location', () => {
			expect(ship.isHitAt('99')).toBe(false);
		});
	});

	describe('getHitCount', () => {
		test('should return 0 for new ship', () => {
			expect(ship.getHitCount()).toBe(0);
		});

		test('should return correct count after hits', () => {
			ship.hit('00');
			ship.hit('02');
			expect(ship.getHitCount()).toBe(2);
		});

		test('should return full count when ship is sunk', () => {
			ship.hit('00');
			ship.hit('01');
			ship.hit('02');
			expect(ship.getHitCount()).toBe(3);
		});
	});
});
