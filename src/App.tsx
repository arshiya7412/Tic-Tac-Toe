import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Circle, RotateCcw, Volume2, VolumeX, Moon, Sun, User, Cpu, Home, Trophy } from 'lucide-react';

type GameMode = 'pvp' | 'ai-easy' | 'ai-hard';
type Player = 'X' | 'O' | null;
type WinData = { winner: Player | 'draw'; line: number[] } | null;

// Audio Synthesis Utility
const Sfx = {
  play(freq: number, type: OscillatorType, dur: number, vol = 0.1) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      // Audio not supported or enabled
    }
  },
  moveX: () => Sfx.play(400, 'sine', 0.1),
  moveO: () => Sfx.play(600, 'sine', 0.15),
  win: () => {
    Sfx.play(400, 'triangle', 0.1);
    setTimeout(() => Sfx.play(600, 'triangle', 0.2), 100);
    setTimeout(() => Sfx.play(800, 'triangle', 0.4), 200);
  },
  draw: () => Sfx.play(200, 'sawtooth', 0.4)
};

// Core Game Logic
const checkWinner = (squares: Player[]): WinData => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (!squares.includes(null)) return { winner: 'draw', line: [] };
  return null;
};

// Minimax algorithm for unbeatable AI
const minimax = (board: Player[], player: 'X' | 'O'): { score: number; index?: number } => {
  const winData = checkWinner(board);
  if (winData?.winner === 'X') return { score: -10 };
  if (winData?.winner === 'O') return { score: 10 };
  if (winData?.winner === 'draw') return { score: 0 };

  const availSpots = board.map((val, idx) => (val === null ? idx : null)).filter(v => v !== null) as number[];
  const moves: { score: number; index: number }[] = [];

  for (let i = 0; i < availSpots.length; i++) {
    const index = availSpots[i];
    board[index] = player;
    const result = minimax(board, player === 'O' ? 'X' : 'O');
    moves.push({ index, score: result.score });
    board[index] = null;
  }

  let bestMove = 0;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
};

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const winData = checkWinner(board);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (winData) {
      if (soundEnabled) {
        if (winData.winner === 'draw') Sfx.draw();
        else Sfx.win();
      }
      if (winData.winner !== 'draw') {
         setScores(s => ({ ...s, [winData.winner as 'X'|'O']: s[winData.winner as 'X'|'O'] + 1}));
      } else {
         setScores(s => ({ ...s, draw: s.draw + 1 }));
      }
    }
  }, [winData?.winner]); // Only trigger when winner state changes

  useEffect(() => {
    if (gameState === 'playing' && gameMode.startsWith('ai-') && !isXNext && !winData) {
      const makeAIMove = () => {
        const tempBoard = [...board];
        let bestIndex = -1;

        if (gameMode === 'ai-easy') {
          const emptySpots = tempBoard.map((v, i) => (v === null ? i : null)).filter(v => v !== null) as number[];
          bestIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        } else {
          bestIndex = minimax(tempBoard, 'O').index!;
        }

        if (bestIndex !== -1 && bestIndex !== undefined) {
          const newBoard = [...tempBoard];
          newBoard[bestIndex] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          if (soundEnabled) Sfx.moveO();
        }
      };
      const timer = setTimeout(makeAIMove, 400); // UI delay for realism
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, gameMode, winData, gameState, soundEnabled]);

  const handleCellClick = (index: number) => {
    if (board[index] || winData) return;
    if (gameMode.startsWith('ai-') && !isXNext) return; // Wait for AI

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    if (soundEnabled) {
      isXNext ? Sfx.moveX() : Sfx.moveO();
    }

    setIsXNext(!isXNext);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const backToMenu = () => {
    resetBoard();
    setGameState('menu');
    setScores({ X: 0, O: 0, draw: 0 });
  };

  const bgStyle = isDarkMode
    ? 'bg-[#0f172a] text-slate-100'
    : 'bg-slate-100 text-slate-900';

  const glassPanel = isDarkMode
    ? 'bg-white/5 border border-white/10 shadow-2xl backdrop-blur-2xl'
    : 'bg-black/5 border border-black/10 shadow-2xl backdrop-blur-xl';

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${bgStyle}`}
      style={{ backgroundImage: isDarkMode ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' : 'none' }}
    >
      <header className="p-4 sm:px-10 sm:pt-8 sm:pb-4 flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            TIC TAC TOE
          </h1>
          <p className="text-[8px] md:text-xs uppercase tracking-[0.3em] text-slate-400 font-bold opacity-70">Strategic Grid Simulation</p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {gameState === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full p-8 rounded-3xl ${glassPanel} flex flex-col gap-6 text-center`}
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                  Select Mode
                </h2>
                <p className="text-sm opacity-70 font-medium">Challenge a friend or beat the AI</p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => { setGameMode('pvp'); setGameState('playing'); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-semibold"
                >
                  <User className="text-blue-500" /> Player vs Player
                </button>
                <button
                  onClick={() => { setGameMode('ai-easy'); setGameState('playing'); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-semibold"
                >
                  <Cpu className="text-emerald-500" /> AI (Standard)
                </button>
                <button
                  onClick={() => { setGameMode('ai-hard'); setGameState('playing'); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all font-semibold"
                >
                  <Trophy className="text-red-500" /> AI (Unbeatable)
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-lg w-full p-6 sm:p-8 rounded-3xl ${glassPanel} flex flex-col relative`}
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <button onClick={backToMenu} title="Main Menu" className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}>
                  <Home size={20} />
                </button>
                <div className="flex gap-2 sm:gap-4 flex-wrap justify-center w-full max-w-[300px]">
                  <div className={`flex flex-col flex-1 min-w-[70px] p-3 pt-2 pb-1 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 text-slate-400">Player X</span>
                    <span className="text-xl font-mono font-bold text-blue-400">{scores.X.toString().padStart(2, '0')}</span>
                  </div>
                  <div className={`flex flex-col flex-1 min-w-[70px] p-3 pt-2 pb-1 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10 opacity-70' : 'bg-black/5 border border-black/10 opacity-70'}`}>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 text-slate-400">Draws</span>
                    <span className="text-xl font-mono font-bold text-slate-500">{scores.draw.toString().padStart(2, '0')}</span>
                  </div>
                  <div className={`flex flex-col flex-1 min-w-[70px] p-3 pt-2 pb-1 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 text-slate-400">Player O</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">{scores.O.toString().padStart(2, '0')}</span>
                  </div>
                </div>
                <button onClick={resetBoard} title="Restart" className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}>
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex justify-center mb-6">
                {!winData ? (
                  <div className={`flex items-center gap-3 p-3 px-5 rounded-xl ${isXNext ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isXNext ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                    <p className={`text-xs font-semibold ${isXNext ? 'text-blue-400' : 'text-emerald-400'}`}>
                      PLAYER {isXNext ? 'X' : 'O'} TURN
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 px-5 rounded-xl bg-white/10 border border-white/20">
                    <p className="text-sm font-bold tracking-wide">
                      {winData.winner === 'draw' ? "IT'S A DRAW" : `PLAYER ${winData.winner} WINS`}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 relative aspect-square z-10 w-full max-w-[350px] mx-auto">
                {board.map((cell, index) => {
                  const isWinningCell = winData?.line.includes(index);
                  const canClick = !cell && !winData && (gameMode === 'pvp' || isXNext);
                  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  };

                  return (
                    <motion.button
                      key={index}
                      whileHover={canClick ? { scale: 0.95 } : {}}
                      whileTap={canClick ? { scale: 0.90 } : {}}
                      onClick={() => handleCellClick(index)}
                      onMouseMove={handleMouseMove}
                      className={`cell
                        relative w-full aspect-square rounded-2xl flex items-center justify-center
                        ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}
                        transition-all duration-300 shadow-xl overflow-hidden
                        ${isWinningCell ? (cell === 'X' ? 'bg-blue-500/30 border-blue-500/50' : 'bg-emerald-500/30 border-emerald-500/50') : ''}
                        ${canClick ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}
                      `}
                    >
                      <AnimatePresence>
                        {cell && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={cell === 'X' ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]'}
                          >
                            {cell === 'X' ? <X className="w-16 h-16 md:w-20 md:h-20" strokeWidth={2.5} /> : <Circle className="w-14 h-14 md:w-16 md:h-16" strokeWidth={3} />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {winData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-3xl"
                  >
                    <motion.div
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className={`p-8 rounded-2xl flex flex-col items-center gap-4 ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'} shadow-2xl text-center w-[85%] max-w-sm`}
                    >
                      <div className="text-4xl mb-2">
                        {winData.winner === 'draw' ? '🤝' : '🏆'}
                      </div>
                      <h2 className="text-2xl font-bold">
                        {winData.winner === 'draw' ? "Match Drawn!" : `Player ${winData.winner} won!`}
                      </h2>
                      <p className="text-sm opacity-70 mb-2">
                        {winData.winner !== 'draw' ? 'Well played.' : 'A tough battle.'}
                      </p>
                      <button
                        onClick={resetBoard}
                        className={`mt-4 w-full py-4 rounded-2xl font-bold text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl active:scale-95 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-blue-400 hover:text-white' : 'bg-slate-900 text-white hover:bg-blue-500'}`}
                      >
                        REBOOT SYSTEM
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
