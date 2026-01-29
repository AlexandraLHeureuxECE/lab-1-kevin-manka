import clsx from 'clsx';
import { forwardRef } from 'react';

const Piece = forwardRef(({ type, className, style, ...props }, ref) => {
    const isX = type === 'X';

    return (
        <div
            ref={ref}
            style={style}
            className={clsx(
                "w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-4xl md:text-5xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing",
                isX
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30 text-white"
                    : "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30 text-white",
                className
            )}
            {...props}
        >
            {type}
        </div>
    );
});

Piece.displayName = 'Piece';

export default Piece;
