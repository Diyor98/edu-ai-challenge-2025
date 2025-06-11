#!/usr/bin/env node

import { SeaBattleApp } from './SeaBattleApp.js';

/**
 * Entry point for the Sea Battle game
 */
async function main() {
	const app = new SeaBattleApp();

	try {
		await app.start();
	} catch (error) {
		console.error('💥 Fatal error:', error.message);
		process.exit(1);
	}
}

// Start the application
main();
