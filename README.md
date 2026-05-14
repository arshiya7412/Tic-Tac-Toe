# Tic Tac Toe: Modern Edition

A sleek, responsive, and glassmorphism-styled Tic Tac Toe game built with React, TypeScript, and Tailwind CSS. Featuring sound effects, a perfectly unbeatable AI using the Minimax algorithm, score tracking, and smooth animations.

## ✨ Features

- **Player vs Player (PvP):** Play locally with a friend.
- **Player vs AI (Easy):** Play against a bot making random moves.
- **Player vs AI (Unbeatable):** Challenge the ultimate Minimax AI—it never loses!
- **Modern UI / Glassmorphism:** Clean, modern interface with beautiful hover effects and a responsive background.
- **Dark/Light Mode:** Seamlessly toggle between dark and light themes.
- **Sound Effects:** Audio feedback for moves, wins, and draws (can be muted).
- **Score Tracking:** Keeps count of X wins, O wins, and draws across the session.
- **Fluid Animations:** Smooth component transitions powered by `motion/react`.

## 🛠️ Technologies Used

- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (Icons)
- **Motion (Framer Motion)** (Animations)
- **Vite** (Build Tool)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tic-tac-toe-modern.git
   cd tic-tac-toe-modern
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the provided local URL (usually `http://localhost:3000`).

## 🧠 How the Game Works

The game board is represented as an array of 9 elements. 
When playing against the **Unbeatable AI**, the game uses the **Minimax Algorithm**. This algorithm works by recursively simulating all possible future moves in the game and choosing the move that guarantees the best possible outcome (either a win or a draw). Because Tic Tac Toe is a solved game, making the mathematically optimal choice every turn ensures the AI can never be beaten.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the issues page if you want to contribute.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
