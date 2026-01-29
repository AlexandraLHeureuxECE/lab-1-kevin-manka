import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Piece from './Piece';
import clsx from 'clsx';

export default function DraggablePiece({ type, isTurn }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `draggable-${type}`,
        data: { type },
        disabled: !isTurn,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                className={clsx("opacity-30 blur-sm grayscale w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-700")}
            />
        );
    }

    return (
        <div className={clsx("relative", !isTurn && "opacity-50 grayscale cursor-not-allowed pointer-events-none")}>
            <Piece
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                type={type}
                className={clsx(!isTurn && "cursor-not-allowed hover:scale-100 shadow-none")}
            />
        </div>
    );
}
