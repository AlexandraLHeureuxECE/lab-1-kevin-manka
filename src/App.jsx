import { useState, useCallback, useEffect } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import Square from './components/Square';
import DraggablePiece from './components/DraggablePiece';
import Piece from './components/Piece';
import clsx from 'clsx';

const WIN_CONDITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const calculateWinner = useCallback((squares) => {
    for (let i = 0; i < WIN_CONDITIONS.length; i++) {
      const [a, b, c] = WIN_CONDITIONS[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: WIN_CONDITIONS[i] };
      }
    }
    return null;
  }, []);

  const winInfo = calculateWinner(board);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.line || [];
  const isDraw = !winner && board.every((square) => square !== null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && !board[over.id]) {
      const pieceType = active.data.current.type;

      // Validate turn
      if ((isXNext && pieceType !== 'X') || (!isXNext && pieceType !== 'O')) return;

      const newBoard = [...board];
      newBoard[over.id] = pieceType;
      setBoard(newBoard);
      setIsXNext(!isXNext);

      // Play sound effect? (Optional, maybe later)
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const getStatusMessage = () => {
    if (winner) return <span className={winner === 'X' ? 'text-blue-400' : 'text-red-400'}>Winner: {winner}!</span>;
    if (isDraw) return <span className="text-slate-400">It's a Draw!</span>;
    return (
      <>
        Player <span className={isXNext ? 'text-blue-400 font-bold' : 'text-red-400 font-bold'}>{isXNext ? 'X' : 'O'}</span>'s Turn
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-game-bg flex flex-col items-center justify-center p-4 select-none">

      {/* Header */}
      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 mb-8 tracking-tight drop-shadow-sm">
        Tic Tac Toe
      </h1>

      {/* Game Status Bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-8 bg-game-board/50 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl transition-colors duration-300">
        <div className="text-xl md:text-2xl font-medium text-game-text">
          {getStatusMessage()}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 bg-game-bg hover:bg-opacity-80 text-game-text rounded-lg transition-colors border border-white/10 shadow-sm"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-game-bg hover:bg-opacity-80 text-game-text rounded-lg text-sm font-semibold transition-colors border border-white/10 shadow-sm"
          >
            Restart
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Player X Toolbar */}
          <div className="flex flex-col items-center gap-4 min-w-[100px]">
            <div className="h-4">
              {!(isXNext && !winner && !isDraw) && !winner && !isDraw && (
                <div className="text-xs font-medium text-slate-400 whitespace-nowrap animate-pulse">
                  Wait your turn
                </div>
              )}
            </div>
            <div className="text-sm font-bold tracking-widest text-blue-500/50 uppercase">Player 1</div>
            <DraggablePiece type="X" isTurn={isXNext && !winner && !isDraw} />
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 bg-game-board rounded-3xl shadow-2xl border border-white/5 transition-colors duration-300">
            {board.map((square, index) => (
              <Square
                key={index}
                id={index}
                piece={square}
                isWinningSquare={winningLine.includes(index)}
              />
            ))}
          </div>

          {/* Player O Toolbar */}
          <div className="flex flex-col items-center gap-4 min-w-[100px]">
            <div className="h-4">
              {(isXNext && !winner && !isDraw) && !winner && !isDraw && (
                <div className="text-xs font-medium text-slate-400 whitespace-nowrap animate-pulse">
                  Wait your turn
                </div>
              )}
            </div>
            <div className="text-sm font-bold tracking-widest text-red-500/50 uppercase">Player 2</div>
            <DraggablePiece type="O" isTurn={!isXNext && !winner && !isDraw} />
          </div>
        </div>

        <DragOverlay dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeId ? (
            <Piece
              type={activeId.includes('X') ? 'X' : 'O'}
              className="cursor-grabbing scale-110 shadow-2xl ring-4 ring-white/10"
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-12 text-slate-500 text-sm font-medium">
        Drag pieces to the board to play
      </div>
    </div>
  );
}
