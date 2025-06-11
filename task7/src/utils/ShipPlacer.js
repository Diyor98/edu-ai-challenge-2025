import { Ship } from '../models/Ship.js';

/**
 * Utility class for placing ships on the board
 */
export class ShipPlacer {
	static HORIZONTAL = 'horizontal';
	static VERTICAL = 'vertical';

	/**
	 * Places ships randomly on a board
	 * @param {Board} board - The board to place ships on
	 * @param {number} numShips - Number of ships to place
	 * @param {number} shipLength - Length of each ship
	 * @param {boolean} showShips - Whether to show ships on the board
	 * @returns {Array<Ship>} Array of placed ships
	 */
	static placeShipsRandomly(board, numShips, shipLength, showShips = false) {
		const ships = [];
		let attemptsRemaining = 1000; // Safety limit to prevent infinite loops

		while (ships.length < numShips && attemptsRemaining > 0) {
			const ship = this.attemptShipPlacement(board, shipLength);
			if (ship) {
				board.addShip(ship, showShips);
				ships.push(ship);
			}
			attemptsRemaining--;
		}

		if (ships.length < numShips) {
			throw new Error(
				`Failed to place all ships. Only placed ${ships.length} out of ${numShips}`
			);
		}

		return ships;
	}

	/**
	 * Attempts to place a single ship on the board
	 * @param {Board} board - The board to place the ship on
	 * @param {number} shipLength - Length of the ship
	 * @returns {Ship|null} The placed ship or null if placement failed
	 */
	static attemptShipPlacement(board, shipLength) {
		const orientation = Math.random() < 0.5 ? this.HORIZONTAL : this.VERTICAL;
		const { startRow, startCol } = this.getRandomStartPosition(
			board.size,
			shipLength,
			orientation
		);

		const locations = this.generateShipLocations(
			startRow,
			startCol,
			shipLength,
			orientation
		);

		if (this.canPlaceShip(board, locations)) {
			return new Ship(locations, shipLength);
		}

		return null;
	}

	/**
	 * Gets a random starting position for ship placement
	 * @param {number} boardSize - Size of the board
	 * @param {number} shipLength - Length of the ship
	 * @param {string} orientation - Orientation of the ship
	 * @returns {Object} {startRow, startCol}
	 */
	static getRandomStartPosition(boardSize, shipLength, orientation) {
		let startRow, startCol;

		if (orientation === this.HORIZONTAL) {
			startRow = Math.floor(Math.random() * boardSize);
			startCol = Math.floor(Math.random() * (boardSize - shipLength + 1));
		} else {
			startRow = Math.floor(Math.random() * (boardSize - shipLength + 1));
			startCol = Math.floor(Math.random() * boardSize);
		}

		return { startRow, startCol };
	}

	/**
	 * Generates ship locations based on start position and orientation
	 * @param {number} startRow - Starting row
	 * @param {number} startCol - Starting column
	 * @param {number} shipLength - Length of the ship
	 * @param {string} orientation - Orientation of the ship
	 * @returns {Array<string>} Array of location strings
	 */
	static generateShipLocations(startRow, startCol, shipLength, orientation) {
		const locations = [];

		for (let i = 0; i < shipLength; i++) {
			const row = orientation === this.HORIZONTAL ? startRow : startRow + i;
			const col = orientation === this.HORIZONTAL ? startCol + i : startCol;
			locations.push(`${row}${col}`);
		}

		return locations;
	}

	/**
	 * Checks if a ship can be placed at the given locations
	 * @param {Board} board - The board to check
	 * @param {Array<string>} locations - Array of location strings
	 * @returns {boolean} True if the ship can be placed
	 */
	static canPlaceShip(board, locations) {
		return locations.every((location) => {
			const [row, col] = board.parseLocation(location);
			return board.isValidLocation(row, col);
		});
	}
}
