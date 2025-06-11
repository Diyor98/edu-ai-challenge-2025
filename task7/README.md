# Sea Battle - Modern ES6+ Implementation

A modern, refactored implementation of the classic Battleship game using ES6+ JavaScript with comprehensive unit testing.

## Features

- 🚢 Classic Battleship gameplay with configurable settings
- 🤖 Intelligent CPU opponent with hunt and target modes
- 🎮 Interactive console interface with rich formatting
- ⚙️ Configurable game parameters (board size, ship count, ship length)
- 🧪 Comprehensive unit test suite with 70%+ coverage
- 📊 Real-time game statistics and feedback

## Project Structure

```
src/
├── models/           # Core game entities
│   ├── Ship.js      # Ship class with state management
│   └── Board.js     # Game board with grid operations
├── game/            # Game logic and flow control
│   └── GameController.js  # Main game state management
├── ai/              # CPU player intelligence
│   └── CpuPlayer.js # Hunt and target mode AI
├── utils/           # Utility functions
│   └── ShipPlacer.js # Ship placement algorithms
├── ui/              # User interface components
│   ├── GameDisplay.js    # Console output formatting
│   └── InputHandler.js   # Input validation and handling
├── SeaBattleApp.js  # Main application orchestrator
└── index.js         # Entry point

__tests__/           # Unit test suite
├── Ship.test.js
├── Board.test.js
├── GameController.test.js
├── CpuPlayer.test.js
└── ShipPlacer.test.js
```

## Requirements

- Node.js 14+ with ES Modules support
- npm for dependency management

## Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Game

Start the game with:

```bash
npm start
```

Follow the on-screen menu to:

- Start a new game
- Configure game settings
- Exit the application

## Game Controls

- Enter coordinates as two digits (e.g., `00`, `34`, `98`)
- Use the main menu to configure settings
- Press Ctrl+C to exit at any time

## Testing

Run the complete test suite:

```bash
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

Watch mode for development:

```bash
npm run test:watch
```

## Test Coverage

Current test coverage metrics:

- **Statements**: 70.28%
- **Branches**: 69.75%
- **Functions**: 83.07%
- **Lines**: 69.4%

## Configuration

Default game settings:

- **Board Size**: 10x10 grid
- **Number of Ships**: 3
- **Ship Length**: 3

These can be customized through the in-game configuration menu.

## Game Rules

1. Ships are placed randomly on a 10x10 grid
2. Players take turns guessing coordinates
3. Feedback is provided for hits, misses, and sunk ships
4. First player to sink all enemy ships wins
5. CPU uses intelligent targeting after scoring hits

## Modern JavaScript Features

This implementation showcases:

- ES6+ Classes and Modules
- Async/Await for input handling
- Template literals and destructuring
- Set/Map collections for performance
- Arrow functions and default parameters
- Comprehensive error handling
- JSDoc documentation

## Files and Deliverables

- **Refactored Application**: Complete modern ES6+ implementation
- **Unit Tests**: Comprehensive test suite with high coverage
- **refactoring.md**: Detailed documentation of refactoring process
- **test_report.txt**: Test coverage report
- **README.md**: This instruction file

## Original vs Refactored

| Aspect          | Original          | Refactored                                  |
| --------------- | ----------------- | ------------------------------------------- |
| Files           | 1 monolithic file | 8+ modular files                            |
| Lines of Code   | 333 lines         | 1,200+ lines (better organized)             |
| JavaScript      | ES5 with `var`    | Modern ES6+ with classes                    |
| Testing         | No tests          | 127 unit tests                              |
| Architecture    | Procedural        | Object-oriented with separation of concerns |
| Maintainability | Low               | High with clear structure                   |

## License

MIT License - Feel free to use and modify as needed.

## Contributing

This is an educational project demonstrating modern JavaScript refactoring techniques and testing practices.
