/**
 * Represents a game board in the Sea Battle game
 */
export class Board {
	static WATER = '~';
	static SHIP = 'S';
	static HIT = 'X';
	static MISS = 'O';

	constructor(size = 10) {
		this.size = size;
		this.grid = this.createEmptyGrid();
		this.ships = [];
		this.guesses = new Set();
	}

	/**
	 * Creates an empty grid filled with water
	 * @returns {Array<Array<string>>} Empty grid
	 */
	createEmptyGrid() {
		return Array(this.size)
			.fill(null)
			.map(() => Array(this.size).fill(Board.WATER));
	}

	/**
	 * Adds a ship to the board
	 * @param {Ship} ship - The ship to add
	 * @param {boolean} showShips - Whether to display ships on the grid
	 */
	addShip(ship, showShips = false) {
		this.ships.push(ship);
		if (showShips) {
			ship.locations.forEach((location) => {
				const [row, col] = this.parseLocation(location);
				this.grid[row][col] = Board.SHIP;
			});
		}
	}

	/**
	 * Processes a guess at the given location
	 * @param {string} location - The location to guess (e.g., "00", "34")
	 * @returns {Object} Result of the guess {hit: boolean, sunk: boolean, ship: Ship|null}
	 */
	processGuess(location) {
		if (this.guesses.has(location)) {
			return { hit: false, sunk: false, ship: null, duplicate: true };
		}

		this.guesses.add(location);
		const [row, col] = this.parseLocation(location);

		// Check if any ship is hit
		for (const ship of this.ships) {
			if (ship.hasLocation(location)) {
				const wasHit = ship.hit(location);
				if (wasHit) {
					this.grid[row][col] = Board.HIT;
					return {
						hit: true,
						sunk: ship.isSunk(),
						ship,
						duplicate: false,
					};
				}
			}
		}

		// Miss
		this.grid[row][col] = Board.MISS;
		return { hit: false, sunk: false, ship: null, duplicate: false };
	}

	/**
	 * Checks if a location is valid for placement
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {boolean} True if the location is valid and empty
	 */
	isValidLocation(row, col) {
		return (
			row >= 0 &&
			row < this.size &&
			col >= 0 &&
			col < this.size &&
			this.grid[row][col] === Board.WATER
		);
	}

	/**
	 * Parses a location string into row and column indices
	 * @param {string} location - Location string (e.g., "00", "34")
	 * @returns {Array<number>} [row, col] indices
	 */
	parseLocation(location) {
		return [parseInt(location[0]), parseInt(location[1])];
	}

	/**
	 * Formats row and column indices into a location string
	 * @param {number} row - Row index
	 * @param {number} col - Column index
	 * @returns {string} Location string
	 */
	formatLocation(row, col) {
		return `${row}${col}`;
	}

	/**
	 * Gets the number of ships remaining (not sunk)
	 * @returns {number} Number of ships not sunk
	 */
	getRemainingShips() {
		return this.ships.filter((ship) => !ship.isSunk()).length;
	}

	/**
	 * Checks if all ships are sunk
	 * @returns {boolean} True if all ships are sunk
	 */
	areAllShipsSunk() {
		return this.ships.every((ship) => ship.isSunk());
	}

	/**
	 * Gets the current state of the board
	 * @returns {Array<Array<string>>} Current grid state
	 */
	getGrid() {
		return this.grid.map((row) => [...row]);
	}

	/**
	 * Checks if a guess has been made at the location
	 * @param {string} location - Location to check
	 * @returns {boolean} True if location has been guessed
	 */
	hasBeenGuessed(location) {
		return this.guesses.has(location);
	}
}
