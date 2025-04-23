'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useSocket } from '@/lib/hooks/use-socket';

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const [message, setMessage] = useState('');
  const { messages } = useGameStore();
  const { sendMessage } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(roomId, message);
      setMessage('');
    }
  };

  return (
    <div className="w-80 h-[400px] bg-neutral-800 rounded-lg p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="bg-neutral-700 p-2 rounded-md"
          >
            <span className="text-xs text-neutral-400">
              {msg.playerId}:
            </span>
            <p className="text-white">{msg.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-neutral-700 text-white rounded-md px-3 py-2"
          placeholder="Digite sua mensagem..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
} 