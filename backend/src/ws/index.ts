import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ClientToServerMessage, ServerToClientMessage, UpdateStatusMessage } from './types.js';
import { ValidationError } from '#/utils/errors.js';

export type * from "./types.js";

// Socket.io server setup
export function createWebSocketServer(httpServer: HttpServer, onConnection: (socket: Socket) => void) {
  const io = new Server<ClientToServerMessage, ServerToClientMessage>(httpServer, {
    cors: {
      origin: "*", // Configure this properly for production
      methods: [ "GET", "POST" ]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    onConnection(socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export const handleWebSocketError = (error: unknown, socket: Socket) => {
  if (error instanceof ValidationError) {
    const errorMessage: UpdateStatusMessage = {
      type: 'UPDATE_STATUS',
      data: { status: 'error', message: error.message }
    };
    socket.emit('UPDATE_STATUS', errorMessage.data);
    return;
  }
  const errorMessage: UpdateStatusMessage = {
    type: 'UPDATE_STATUS',
    data: { status: 'error', message: 'Internal server error' }
  };
  socket.emit('UPDATE_STATUS', errorMessage.data);
};

