import { Server as NetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export function initSocketServer(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
    });

    // Configuração dos eventos do jogo
    io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);

      // Eventos do jogo
      socket.on('join-game', (roomId: string) => {
        socket.join(roomId);
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room?.size === 2) {
          io.to(roomId).emit('game-start', { 
            firstPlayer: Array.from(room)[Math.floor(Math.random() * 2)] 
          });
        }
      });

      socket.on('move-piece', (data: { 
        roomId: string, 
        from: { x: number, y: number }, 
        to: { x: number, y: number } 
      }) => {
        socket.to(data.roomId).emit('piece-moved', data);
      });

      socket.on('surrender', (roomId: string) => {
        io.to(roomId).emit('game-over', { 
          winner: socket.id,
          reason: 'surrender'
        });
      });

      socket.on('chat-message', (data: { roomId: string, message: string }) => {
        io.to(data.roomId).emit('chat-message', {
          playerId: socket.id,
          message: data.message
        });
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  return res.socket.server.io;
} 