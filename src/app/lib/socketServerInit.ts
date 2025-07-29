import { getIO } from './socketServer';

export const initializeSocketServer = (server: any) => {
  if (!server.io) {
    const io = getIO();
    io.attach(server);
    server.io = io;
    console.log('[Socket.IO] Server attached');
  }
};
