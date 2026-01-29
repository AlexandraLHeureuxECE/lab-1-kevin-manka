import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import Piece from './Piece';

export default function Square({ id, piece, isWinningSquare }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        disabled: !!piece, // Disable dropping if already occupied
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center transition-all duration-300",
                "border-2 border-game-border",
                !piece && "bg-game-board/50 hover:bg-game-board/80",
                isOver && !piece && "bg-game-board ring-2 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]",
                isWinningSquare && "bg-emerald-900/20 border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]"
            )}
        >
            {piece && (
                <Piece
                    type={piece}
                    className={clsx(
                        "cursor-default hover:scale-100 shadow-md",
                        isWinningSquare && "animate-pop scale-110 shadow-emerald-500/40"
                    )}
                />
            )}
        </div>
    );
}
