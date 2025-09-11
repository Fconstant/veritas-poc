import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  UpdateStatus,
} from './types.js';
import { ValidationError } from '#/utils/errors.js';

export type * from './types.js';

// Socket.io server setup
export function createWebSocketServer(
  httpServer: HttpServer,
  onConnection: (socket: Socket) => void,
) {
  const io = new Server<ServerToClientEvents, ClientToServerEvents>(
    httpServer,
    {
      cors: {
        origin: '*', // Configure this properly for production
        methods: ['GET', 'POST'],
      },
    },
  );

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    onConnection(socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export const handleWebSocketError = (
  error: unknown,
  socket: Socket,
  fingerprint: string,
) => {
  if (error instanceof ValidationError) {
    const errorMessage: UpdateStatus = {
      data: { status: 'EXCEPTION', message: error.message },
      meta: { fingerprint },
    };
    socket.emit('UPDATE_STATUS', errorMessage);
    return;
  }
  const errorMessage: UpdateStatus = {
    data: { status: 'EXCEPTION', message: 'Internal server error' },
    meta: { fingerprint },
  };
  socket.emit('UPDATE_STATUS', errorMessage);
};
