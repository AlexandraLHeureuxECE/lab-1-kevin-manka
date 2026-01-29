import { useState, useCallback } from 'react';
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
    <div className="min-h-screen bg-game-bg flex flex-col items-center py-12 px-4 select-none">

      {/* Header */}
      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 mb-8 tracking-tight drop-shadow-sm">
        Tic Tac Toe
      </h1>

      {/* Game Status Bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-8 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50 shadow-xl">
        <div className="text-xl md:text-2xl font-medium text-slate-200">
          {getStatusMessage()}
        </div>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-600 shadow-sm"
        >
          Restart
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Player X Toolbar */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-bold tracking-widest text-blue-500/50 uppercase">Player 1</div>
            <DraggablePiece type="X" isTurn={isXNext && !winner && !isDraw} />
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700">
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
          <div className="flex flex-col items-center gap-4">
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
