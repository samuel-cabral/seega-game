'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/game-store';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { 
    placePiece, 
    movePiece, 
    setWinner, 
    addMessage,
    initializeBoard 
  } = useGameStore();

  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      
      socketRef.current = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });

      socketRef.current.on('connect', () => {
        console.log('Conectado ao servidor');
      });

      socketRef.current.on('game-start', (data: { firstPlayer: string }) => {
        console.log('Jogo iniciado, primeiro jogador:', data.firstPlayer);
        initializeBoard();
      });

      socketRef.current.on('piece-placed', (data: {
        position: { x: number, y: number }
      }) => {
        placePiece(data.position);
      });

      socketRef.current.on('piece-moved', (data: {
        from: { x: number, y: number },
        to: { x: number, y: number }
      }) => {
        movePiece(data.from, data.to);
      });

      socketRef.current.on('game-over', (data: {
        winner: string,
        reason: string
      }) => {
        setWinner(data.winner);
      });

      socketRef.current.on('chat-message', (data: {
        playerId: string,
        message: string
      }) => {
        addMessage(data.playerId, data.message);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Desconectado do servidor');
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinGame = (roomId: string) => {
    socketRef.current?.emit('join-game', roomId);
  };

  const emitPlacePiece = (roomId: string, position: { x: number, y: number }) => {
    socketRef.current?.emit('place-piece', { roomId, position });
  };

  const emitMove = (roomId: string, from: { x: number, y: number }, to: { x: number, y: number }) => {
    socketRef.current?.emit('move-piece', { roomId, from, to });
  };

  const surrender = (roomId: string) => {
    socketRef.current?.emit('surrender', roomId);
  };

  const sendMessage = (roomId: string, message: string) => {
    socketRef.current?.emit('chat-message', { roomId, message });
  };

  return {
    socket: socketRef.current,
    joinGame,
    emitPlacePiece,
    emitMove,
    surrender,
    sendMessage,
  };
} 