'use client';

import { useGameStore } from '@/lib/store/game-store';
import { cn } from '@/lib/utils';
import { useSocket } from '@/lib/hooks/use-socket';

interface BoardProps {
  roomId: string;
}

export function Board({ roomId }: BoardProps) {
  const { board, currentPlayer, selectedPiece, phase, selectPiece } = useGameStore();
  const { emitMove } = useSocket();

  const handleCellClick = (x: number, y: number) => {
    if (phase === 'placement') {
      // Lógica de colocação de peças
      return;
    }

    if (selectedPiece) {
      // Movimento de peça
      emitMove(roomId, selectedPiece, { x, y });
    } else if (board[y][x] === currentPlayer) {
      // Seleção de peça
      selectPiece({ x, y });
    }
  };

  return (
    <div className="grid grid-cols-5 gap-1 bg-neutral-800 p-2 rounded-lg">
      {board.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`${x}-${y}`}
            className={cn(
              "w-16 h-16 rounded-md transition-colors",
              cell === 'black' && "bg-black",
              cell === 'white' && "bg-white",
              cell === null && "bg-neutral-600",
              selectedPiece?.x === x && selectedPiece?.y === y && "ring-2 ring-yellow-400",
              !cell && "hover:bg-neutral-500"
            )}
            onClick={() => handleCellClick(x, y)}
          />
        ))
      )}
    </div>
  );
} 