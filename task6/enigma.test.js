const { Enigma, Rotor, plugboardSwap } = require('./enigma.js');

// Simple test framework
function assert(condition, message) {
	if (!condition) {
		throw new Error(`Test failed: ${message}`);
	}
}

function test(name, fn) {
	try {
		fn();
		console.log(`✓ ${name}`);
		return true;
	} catch (error) {
		console.error(`✗ ${name}: ${error.message}`);
		return false;
	}
}

console.log('Running Enigma Machine Tests...\n');

let passed = 0;
let total = 0;

// Test: Basic encryption/decryption reciprocity
total++;
if (
	test('Basic encryption/decryption reciprocity', () => {
		const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
		const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

		const original = 'HELLO';
		const encrypted = enigma1.process(original);
		const decrypted = enigma2.process(encrypted);

		assert(
			decrypted === original,
			`Expected "${original}", got "${decrypted}"`
		);
	})
)
	passed++;

// Test: Plugboard functionality
total++;
if (
	test('Plugboard swapping', () => {
		const pairs = [
			['A', 'B'],
			['C', 'D'],
		];

		assert(plugboardSwap('A', pairs) === 'B', 'A should swap to B');
		assert(plugboardSwap('B', pairs) === 'A', 'B should swap to A');
		assert(plugboardSwap('C', pairs) === 'D', 'C should swap to D');
		assert(plugboardSwap('D', pairs) === 'C', 'D should swap to C');
		assert(plugboardSwap('E', pairs) === 'E', 'E should remain unchanged');
	})
)
	passed++;

// Test: Plugboard encryption/decryption
total++;
if (
	test('Plugboard encryption/decryption', () => {
		const enigma1 = new Enigma(
			[0, 1, 2],
			[0, 0, 0],
			[0, 0, 0],
			[
				['A', 'B'],
				['C', 'D'],
			]
		);
		const enigma2 = new Enigma(
			[0, 1, 2],
			[0, 0, 0],
			[0, 0, 0],
			[
				['A', 'B'],
				['C', 'D'],
			]
		);

		const original = 'ABCDE';
		const encrypted = enigma1.process(original);
		const decrypted = enigma2.process(encrypted);

		assert(
			decrypted === original,
			`Expected "${original}", got "${decrypted}"`
		);
	})
)
	passed++;

// Test: Rotor stepping
total++;
if (
	test('Basic rotor stepping', () => {
		const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

		// Initial positions should be [0, 0, 0]
		assert(enigma.rotors[0].position === 0, 'Left rotor should start at 0');
		assert(enigma.rotors[1].position === 0, 'Middle rotor should start at 0');
		assert(enigma.rotors[2].position === 0, 'Right rotor should start at 0');

		// After one character, right rotor should step
		enigma.encryptChar('A');
		assert(enigma.rotors[2].position === 1, 'Right rotor should step to 1');
		assert(
			enigma.rotors[1].position === 0,
			'Middle rotor should still be at 0'
		);
		assert(enigma.rotors[0].position === 0, 'Left rotor should still be at 0');
	})
)
	passed++;

// Test: Double-stepping mechanism
total++;
if (
	test('Double-stepping mechanism', () => {
		// Set up rotors near notch positions for testing double-stepping
		// Rotor I notch at Q (position 16), Rotor II notch at E (position 4)
		const enigma = new Enigma([0, 1, 2], [0, 4, 21], [0, 0, 0], []); // Middle rotor at notch E (4), right at V-1 (21)

		// Step once - should trigger double-stepping
		enigma.encryptChar('A');

		// After double-stepping: left should step, middle should step, right should step
		assert(
			enigma.rotors[0].position === 1,
			'Left rotor should step due to double-stepping'
		);
		assert(
			enigma.rotors[1].position === 5,
			'Middle rotor should step due to double-stepping'
		);
		assert(
			enigma.rotors[2].position === 22,
			'Right rotor should step normally'
		);
	})
)
	passed++;

// Test: Ring settings
total++;
if (
	test('Ring settings affect encryption', () => {
		const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
		const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [5, 10, 15], []);

		const result1 = enigma1.encryptChar('A');
		const result2 = enigma2.encryptChar('A');

		assert(
			result1 !== result2,
			'Different ring settings should produce different results'
		);
	})
)
	passed++;

// Test: Long message encryption/decryption
total++;
if (
	test('Long message encryption/decryption', () => {
		const enigma1 = new Enigma(
			[0, 1, 2],
			[5, 10, 15],
			[1, 2, 3],
			[
				['A', 'Z'],
				['B', 'Y'],
			]
		);
		const enigma2 = new Enigma(
			[0, 1, 2],
			[5, 10, 15],
			[1, 2, 3],
			[
				['A', 'Z'],
				['B', 'Y'],
			]
		);

		const original = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG';
		const encrypted = enigma1.process(original);
		const decrypted = enigma2.process(encrypted);

		assert(
			decrypted === original,
			`Expected "${original}", got "${decrypted}"`
		);
		assert(
			encrypted !== original,
			'Encrypted text should be different from original'
		);
	})
)
	passed++;

// Test: Non-alphabetic characters
total++;
if (
	test('Non-alphabetic characters pass through unchanged', () => {
		const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

		const input = 'HELLO123 WORLD!';
		const result = enigma.process(input);

		// Numbers and spaces should remain in the same positions
		assert(result[5] === '1', 'Number should pass through unchanged');
		assert(result[8] === ' ', 'Space should pass through unchanged');
		assert(result[14] === '!', 'Punctuation should pass through unchanged');
	})
)
	passed++;

// Test: Self-inverse property (no letter encrypts to itself)
total++;
if (
	test('No letter encrypts to itself', () => {
		const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let selfEncrypted = false;

		for (let char of alphabet) {
			const encrypted = enigma.encryptChar(char);
			if (encrypted === char) {
				selfEncrypted = true;
				break;
			}
		}

		assert(!selfEncrypted, 'No letter should encrypt to itself in Enigma');
	})
)
	passed++;

console.log(`\n=== TEST SUMMARY ===`);
console.log(`Passed: ${passed}/${total}`);
console.log(`Failed: ${total - passed}/${total}`);
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

if (passed === total) {
	console.log(
		'\n🎉 All tests passed! The Enigma machine fixes are working correctly.'
	);
} else {
	console.log('\n⚠️  Some tests failed. Review the failing tests above.');
}
