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

  // This should not be called in the client-side code
  // The server is set up in server.js
  console.warn('getIO called but no server instance found');
  return null;
};

// Emit event helper
export const emitNewOrder = (companyId: string, order: any) => {
  const io = getIO();
  if (io) {
    console.log(`Emitting new order to company ${companyId}:`, order.id);
    io.to(companyId).emit('new-order', order);
  } else {
    console.warn('Cannot emit order - WebSocket server not available');
  }
};
