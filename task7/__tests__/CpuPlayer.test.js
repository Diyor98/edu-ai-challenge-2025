import { CpuPlayer } from '../src/ai/CpuPlayer.js';

describe('CpuPlayer', () => {
	let cpuPlayer;

	beforeEach(() => {
		cpuPlayer = new CpuPlayer(5); // Using smaller board for easier testing
	});

	describe('constructor', () => {
		test('should initialize with correct defaults', () => {
			expect(cpuPlayer.boardSize).toBe(5);
			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
			expect(cpuPlayer.targetQueue).toHaveLength(0);
			expect(cpuPlayer.guesses.size).toBe(0);
		});

		test('should use default board size', () => {
			const defaultCpu = new CpuPlayer();
			expect(defaultCpu.boardSize).toBe(10);
		});
	});

	describe('makeGuess', () => {
		test('should make valid guess in hunt mode', () => {
			const guess = cpuPlayer.makeGuess();
			expect(guess).toMatch(/^[0-4][0-4]$/);
			expect(cpuPlayer.guesses.has(guess)).toBe(true);
		});

		test('should not repeat guesses', () => {
			const guesses = new Set();
			for (let i = 0; i < 10; i++) {
				const guess = cpuPlayer.makeGuess();
				expect(guesses.has(guess)).toBe(false);
				guesses.add(guess);
			}
		});

		test('should use target mode when targets available', () => {
			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			cpuPlayer.targetQueue.push('12');

			const guess = cpuPlayer.makeGuess();
			expect(guess).toBe('12');
			expect(cpuPlayer.targetQueue).toHaveLength(0);
		});

		test('should fall back to hunt mode when no targets', () => {
			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			cpuPlayer.targetQueue = [];

			const guess = cpuPlayer.makeGuess();
			expect(guess).toMatch(/^[0-4][0-4]$/);
			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
		});
	});

	describe('processGuessResult', () => {
		test('should switch to target mode on hit', () => {
			const result = { hit: true, sunk: false };
			cpuPlayer.processGuessResult('22', result);

			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_TARGET);
			expect(cpuPlayer.targetQueue.length).toBeGreaterThan(0);
		});

		test('should switch to hunt mode on sunk', () => {
			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			cpuPlayer.targetQueue.push('11', '12');

			const result = { hit: true, sunk: true };
			cpuPlayer.processGuessResult('22', result);

			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
			expect(cpuPlayer.targetQueue).toHaveLength(0);
		});

		test('should stay in hunt mode on miss in hunt mode', () => {
			const result = { hit: false, sunk: false };
			cpuPlayer.processGuessResult('22', result);

			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
		});

		test('should switch to hunt mode on miss with empty target queue', () => {
			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			cpuPlayer.targetQueue = [];

			const result = { hit: false, sunk: false };
			cpuPlayer.processGuessResult('22', result);

			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
		});
	});

	describe('getTargetModeGuess', () => {
		test('should return target from queue', () => {
			cpuPlayer.targetQueue = ['12', '13'];
			const guess = cpuPlayer.getTargetModeGuess();
			expect(guess).toBe('12');
			expect(cpuPlayer.targetQueue).toEqual(['13']);
		});

		test('should skip already guessed targets', () => {
			cpuPlayer.guesses.add('12');
			cpuPlayer.targetQueue = ['12', '13'];

			const guess = cpuPlayer.getTargetModeGuess();
			expect(guess).toBe('13');
			expect(cpuPlayer.targetQueue).toHaveLength(0);
		});

		test('should fall back to hunt mode when no valid targets', () => {
			cpuPlayer.guesses.add('12');
			cpuPlayer.guesses.add('13');
			cpuPlayer.targetQueue = ['12', '13'];

			const guess = cpuPlayer.getTargetModeGuess();
			expect(guess).toMatch(/^[0-4][0-4]$/);
			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
		});
	});

	describe('getHuntModeGuess', () => {
		test('should return valid coordinate', () => {
			const guess = cpuPlayer.getHuntModeGuess();
			expect(guess).toMatch(/^[0-4][0-4]$/);
		});

		test('should not return already guessed location', () => {
			// Fill most of the board
			for (let i = 0; i < 20; i++) {
				cpuPlayer.guesses.add(`0${i % 5}`);
				cpuPlayer.guesses.add(`1${i % 5}`);
				cpuPlayer.guesses.add(`2${i % 5}`);
				cpuPlayer.guesses.add(`3${i % 5}`);
			}

			const guess = cpuPlayer.getHuntModeGuess();
			expect(cpuPlayer.guesses.has(guess)).toBe(false);
		});
	});

	describe('addAdjacentTargets', () => {
		test('should add valid adjacent locations', () => {
			cpuPlayer.addAdjacentTargets('22');

			const expectedTargets = ['12', '32', '21', '23'];
			expectedTargets.forEach((target) => {
				expect(cpuPlayer.targetQueue).toContain(target);
			});
		});

		test('should not add out-of-bounds locations', () => {
			cpuPlayer.addAdjacentTargets('00');

			// Only down and right should be added
			expect(cpuPlayer.targetQueue).toContain('10');
			expect(cpuPlayer.targetQueue).toContain('01');
			expect(cpuPlayer.targetQueue).not.toContain('-10'); // Invalid
			expect(cpuPlayer.targetQueue).not.toContain('0-1'); // Invalid
		});

		test('should not add already guessed locations', () => {
			cpuPlayer.guesses.add('21');
			cpuPlayer.guesses.add('23');

			cpuPlayer.addAdjacentTargets('22');

			expect(cpuPlayer.targetQueue).toContain('12');
			expect(cpuPlayer.targetQueue).toContain('32');
			expect(cpuPlayer.targetQueue).not.toContain('21');
			expect(cpuPlayer.targetQueue).not.toContain('23');
		});

		test('should not add duplicate targets', () => {
			cpuPlayer.targetQueue.push('12');

			cpuPlayer.addAdjacentTargets('22');

			const count12 = cpuPlayer.targetQueue.filter((t) => t === '12').length;
			expect(count12).toBe(1);
		});
	});

	describe('isValidLocation', () => {
		test('should validate locations correctly', () => {
			expect(cpuPlayer.isValidLocation(0, 0)).toBe(true);
			expect(cpuPlayer.isValidLocation(4, 4)).toBe(true);
			expect(cpuPlayer.isValidLocation(2, 3)).toBe(true);

			expect(cpuPlayer.isValidLocation(-1, 0)).toBe(false);
			expect(cpuPlayer.isValidLocation(0, -1)).toBe(false);
			expect(cpuPlayer.isValidLocation(5, 0)).toBe(false);
			expect(cpuPlayer.isValidLocation(0, 5)).toBe(false);
		});
	});

	describe('parseLocation', () => {
		test('should parse location correctly', () => {
			expect(cpuPlayer.parseLocation('00')).toEqual([0, 0]);
			expect(cpuPlayer.parseLocation('23')).toEqual([2, 3]);
			expect(cpuPlayer.parseLocation('44')).toEqual([4, 4]);
		});
	});

	describe('findFirstUnguessedLocation', () => {
		test('should find first unguessed location', () => {
			cpuPlayer.guesses.add('00');
			cpuPlayer.guesses.add('01');

			const location = cpuPlayer.findFirstUnguessedLocation();
			expect(location).toBe('02');
		});

		test('should return 00 when all guessed (fallback)', () => {
			// Fill all locations
			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 5; col++) {
					cpuPlayer.guesses.add(`${row}${col}`);
				}
			}

			const location = cpuPlayer.findFirstUnguessedLocation();
			expect(location).toBe('00');
		});
	});

	describe('reset', () => {
		test('should reset to initial state', () => {
			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			cpuPlayer.targetQueue.push('11', '12');
			cpuPlayer.guesses.add('00');
			cpuPlayer.guesses.add('01');

			cpuPlayer.reset();

			expect(cpuPlayer.mode).toBe(CpuPlayer.MODE_HUNT);
			expect(cpuPlayer.targetQueue).toHaveLength(0);
			expect(cpuPlayer.guesses.size).toBe(0);
		});
	});

	describe('getCurrentMode', () => {
		test('should return current mode', () => {
			expect(cpuPlayer.getCurrentMode()).toBe(CpuPlayer.MODE_HUNT);

			cpuPlayer.mode = CpuPlayer.MODE_TARGET;
			expect(cpuPlayer.getCurrentMode()).toBe(CpuPlayer.MODE_TARGET);
		});
	});

	describe('getTargetQueueSize', () => {
		test('should return correct queue size', () => {
			expect(cpuPlayer.getTargetQueueSize()).toBe(0);

			cpuPlayer.targetQueue.push('11', '12');
			expect(cpuPlayer.getTargetQueueSize()).toBe(2);
		});
	});
});
