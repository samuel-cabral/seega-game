'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/components/game/board';
import { Chat } from '@/components/game/chat';
import { useSocket } from '@/lib/hooks/use-socket';
import { useGameStore } from '@/lib/store/game-store';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { joinGame, surrender } = useSocket();
  const { winner, initializeBoard } = useGameStore();

  useEffect(() => {
    initializeBoard();
  }, []);

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      joinGame(roomId);
      setIsJoined(true);
    }
  };

  const handleSurrender = () => {
    if (isJoined) {
      surrender(roomId);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <form onSubmit={handleJoinGame} className="space-y-4">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Seega - Jogo de Tabuleiro Africano
          </h1>
          <div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Digite o ID da sala..."
              className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Entrar na Sala
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">Seega</h1>
            <Board roomId={roomId} />
            <div className="flex gap-4">
              <button
                onClick={handleSurrender}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Desistir
              </button>
            </div>
            {winner && (
              <div className="bg-green-600 text-white p-4 rounded-md">
                Vencedor: {winner}
              </div>
            )}
          </div>
          <Chat roomId={roomId} />
        </div>
      </div>
    </div>
  );
}
