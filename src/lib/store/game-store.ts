import { create } from 'zustand';

export type Player = 'black' | 'white';
export type Cell = null | Player;
export type Position = { x: number; y: number };
export type GamePhase = 'placement' | 'movement';

interface GameState {
  board: Cell[][];
  currentPlayer: Player;
  phase: GamePhase;
  selectedPiece: Position | null;
  messages: { playerId: string; message: string }[];
  winner: string | null;
  piecesPlaced: { black: number; white: number };
  
  // Ações
  initializeBoard: () => void;
  placePiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  selectPiece: (position: Position) => void;
  addMessage: (playerId: string, message: string) => void;
  setWinner: (playerId: string) => void;
  surrender: () => void;
}

const PIECES_PER_PLAYER = 12;

export const useGameStore = create<GameState>((set) => ({
  board: Array(5).fill(null).map(() => Array(5).fill(null)),
  currentPlayer: 'black',
  phase: 'placement',
  selectedPiece: null,
  messages: [],
  winner: null,
  piecesPlaced: { black: 0, white: 0 },

  initializeBoard: () => {
    set({
      board: Array(5).fill(null).map(() => Array(5).fill(null)),
      currentPlayer: 'black',
      phase: 'placement',
      selectedPiece: null,
      messages: [],
      winner: null,
      piecesPlaced: { black: 0, white: 0 },
    });
  },

  placePiece: (position) => {
    set((state) => {
      if (state.phase !== 'placement' || 
          state.board[position.y][position.x] !== null ||
          (position.x === 2 && position.y === 2)) {
        return state;
      }

      const newBoard = [...state.board];
      newBoard[position.y][position.x] = state.currentPlayer;

      const newPiecesPlaced = {
        ...state.piecesPlaced,
        [state.currentPlayer]: state.piecesPlaced[state.currentPlayer] + 1,
      };

      // Verificar se todos as peças foram colocadas
      const allPiecesPlaced = 
        newPiecesPlaced.black === PIECES_PER_PLAYER && 
        newPiecesPlaced.white === PIECES_PER_PLAYER;

      return {
        board: newBoard,
        currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
        piecesPlaced: newPiecesPlaced,
        phase: allPiecesPlaced ? 'movement' : 'placement',
      };
    });
  },

  movePiece: (from, to) => {
    set((state) => {
      if (state.phase !== 'movement' || 
          state.board[from.y][from.x] !== state.currentPlayer ||
          state.board[to.y][to.x] !== null) {
        return state;
      }

      // Verificar se o movimento é válido (apenas uma casa adjacente)
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
        return state;
      }

      const newBoard = [...state.board];
      newBoard[to.y][to.x] = state.board[from.y][from.x];
      newBoard[from.y][from.x] = null;

      // Verificar capturas
      const captures = checkCaptures(to, newBoard, state.currentPlayer);
      captures.forEach(pos => {
        newBoard[pos.y][pos.x] = null;
      });

      // Verificar condição de vitória
      const opponent = state.currentPlayer === 'black' ? 'white' : 'black';
      const opponentPieces = countPieces(newBoard, opponent);
      const hasValidMoves = checkValidMoves(newBoard, opponent);

      if (opponentPieces === 0 || !hasValidMoves) {
        return {
          board: newBoard,
          winner: state.currentPlayer,
          selectedPiece: null,
        };
      }

      return {
        board: newBoard,
        currentPlayer: opponent,
        selectedPiece: null,
      };
    });
  },

  selectPiece: (position) => {
    set((state) => ({
      selectedPiece: position,
    }));
  },

  addMessage: (playerId, message) => {
    set((state) => ({
      messages: [...state.messages, { playerId, message }],
    }));
  },

  setWinner: (playerId) => {
    set({ winner: playerId });
  },

  surrender: () => {
    set((state) => ({
      winner: state.currentPlayer === 'black' ? 'white' : 'black',
    }));
  },
}));

// Função auxiliar para verificar capturas
function checkCaptures(position: Position, board: Cell[][], player: Player): Position[] {
  const captures: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // Norte
    { x: 1, y: 0 },  // Leste
    { x: 0, y: 1 },  // Sul
    { x: -1, y: 0 }, // Oeste
  ];

  directions.forEach(dir => {
    const pos1 = { x: position.x + dir.x, y: position.y + dir.y };
    const pos2 = { x: position.x + dir.x * 2, y: position.y + dir.y * 2 };

    if (isValidPosition(pos1) && isValidPosition(pos2) &&
        board[pos1.y][pos1.x] === (player === 'black' ? 'white' : 'black') &&
        board[pos2.y][pos2.x] === player) {
      captures.push(pos1);
    }
  });

  return captures;
}

function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x < 5 && pos.y >= 0 && pos.y < 5;
}

function countPieces(board: Cell[][], player: Player): number {
  return board.reduce((count, row) => 
    count + row.filter(cell => cell === player).length, 0);
}

function checkValidMoves(board: Cell[][], player: Player): boolean {
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (board[y][x] === player) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dy, dx] of directions) {
          const newY = y + dy;
          const newX = x + dx;
          if (isValidPosition({ x: newX, y: newY }) && board[newY][newX] === null) {
            return true;
          }
        }
      }
    }
  }
  return false;
} 