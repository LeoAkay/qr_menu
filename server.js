const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');
const next = require('next');
const os = require('os'); // <-- Ekledik

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Aktif IPv4 bulucu fonksiyon
function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  
  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (companyId) => {
      socket.join(companyId);
      console.log(`Socket ${socket.id} joined company room: ${companyId}`);
    });

    socket.on('test', (data) => {
      console.log('Test event received from client:', data);
      socket.emit('test-response', { message: 'Test response from server' });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io available globally
  global.io = io;

  // Handle all other requests with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    const ipv4 = getLocalIPv4();
    console.log(`> Ready on http://localhost:${PORT}`);
    if (ipv4) {
      console.log(`> Ready on http://${ipv4}:${PORT}`);
    } else {
      console.log('> No external IPv4 address found');
    }
    console.log('> WebSocket server is running');
  });
});
