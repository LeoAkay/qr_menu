// lib/socketServer.ts
import { Server } from 'socket.io';

// Ensure single instance of io in development with hot reloads
declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

export const getIO = () => {
  if (global.io) {
    return global.io;
  }

  const io = new Server({
    cors: {
      origin: '*', // Adjust this to your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('join', (companyId) => {
      socket.join(companyId);
      console.log(`Socket joined company room: ${companyId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  global.io = io;

  return io;
};

// Emit event helper
export const emitNewOrder = (companyId: string, order: any) => {
  const io = getIO();
  io.to(companyId).emit('new-order', order);
};
