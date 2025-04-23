'use client';

import { useGameStore } from '@/lib/store/game-store';
import { cn } from '@/lib/utils';
import { useSocket } from '@/lib/hooks/use-socket';

interface BoardProps {
  roomId: string;
}

export function Board({ roomId }: BoardProps) {
  const { 
    board, 
    currentPlayer, 
    selectedPiece, 
    phase, 
    selectPiece, 
    placePiece 
  } = useGameStore();
  const { emitMove } = useSocket();

  const handleCellClick = (x: number, y: number) => {
    // Não permitir colocar peças no centro do tabuleiro durante a fase de colocação
    if (phase === 'placement' && x === 2 && y === 2) {
      return;
    }

    if (phase === 'placement') {
      // Lógica de colocação de peças
      if (board[y][x] === null) {
        placePiece({ x, y });
      }
      return;
    }

    if (selectedPiece) {
      // Verificar se o movimento é válido (apenas uma casa adjacente)
      const dx = Math.abs(x - selectedPiece.x);
      const dy = Math.abs(y - selectedPiece.y);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Movimento de peça
        emitMove(roomId, selectedPiece, { x, y });
      }
    } else if (board[y][x] === currentPlayer) {
      // Seleção de peça
      selectPiece({ x, y });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1 bg-neutral-800 p-2 rounded-lg">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              className={cn(
                "w-16 h-16 rounded-md transition-colors relative",
                cell === 'black' && "bg-black border-2 border-neutral-700",
                cell === 'white' && "bg-white border-2 border-neutral-300",
                cell === null && "bg-neutral-600",
                selectedPiece?.x === x && selectedPiece?.y === y && "ring-2 ring-yellow-400",
                !cell && "hover:bg-neutral-500",
                x === 2 && y === 2 && phase === 'placement' && "bg-neutral-400 cursor-not-allowed"
              )}
              onClick={() => handleCellClick(x, y)}
              disabled={phase === 'placement' && x === 2 && y === 2}
            >
              {cell && (
                <div className={cn(
                  "absolute inset-2 rounded-full",
                  cell === 'black' ? "bg-neutral-900" : "bg-neutral-100"
                )} />
              )}
            </button>
          ))
        )}
      </div>
      <div className="text-white text-center">
        <p>Fase: {phase === 'placement' ? 'Colocação' : 'Movimento'}</p>
        <p>Jogador Atual: {currentPlayer === 'black' ? 'Preto' : 'Branco'}</p>
      </div>
    </div>
  );
} 