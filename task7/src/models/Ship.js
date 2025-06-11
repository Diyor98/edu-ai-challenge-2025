/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
	constructor(locations, length = 3) {
		this.locations = [...locations];
		this.hits = new Array(length).fill(false);
		this.length = length;
	}

	/**
	 * Attempts to hit the ship at a specific location
	 * @param {string} location - The location to hit (e.g., "00", "34")
	 * @returns {boolean} True if the hit was successful, false if already hit or invalid
	 */
	hit(location) {
		const index = this.locations.indexOf(location);
		if (index === -1 || this.hits[index]) {
			return false;
		}

		this.hits[index] = true;
		return true;
	}

	/**
	 * Checks if the ship is completely sunk
	 * @returns {boolean} True if all parts of the ship are hit
	 */
	isSunk() {
		return this.hits.every((hit) => hit === true);
	}

	/**
	 * Checks if a specific location is part of this ship
	 * @param {string} location - The location to check
	 * @returns {boolean} True if the location is part of this ship
	 */
	hasLocation(location) {
		return this.locations.includes(location);
	}

	/**
	 * Checks if a specific location has been hit
	 * @param {string} location - The location to check
	 * @returns {boolean} True if the location has been hit
	 */
	isHitAt(location) {
		const index = this.locations.indexOf(location);
		return index !== -1 && this.hits[index];
	}

	/**
	 * Gets the number of hits on this ship
	 * @returns {number} Number of hits
	 */
	getHitCount() {
		return this.hits.filter((hit) => hit === true).length;
	}
}
