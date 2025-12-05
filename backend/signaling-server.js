const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://backend.test'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected users
const users = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user
  socket.on('register', ({ userId }) => {
    users.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    // Notify user is online
    io.emit('userOnline', { userId });
  });

  // Handle call signals
  socket.on('callSignal', ({ to, signal, callType }) => {
    const recipientSocket = users.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('incomingCall', {
        from: {
          id: socket.userId,
          name: 'User', // You can pass more user data here
        },
        signal,
        callType
      });
    }
  });

  // Forward signal to caller
  socket.on('answerCall', ({ to, signal }) => {
    const callerSocket = users.get(to);
    if (callerSocket) {
      io.to(callerSocket).emit('callSignal', { signal });
    }
  });

  // Handle call end
  socket.on('endCall', ({ to }) => {
    const recipientSocket = users.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('callEnded');
    }
  });

  // Handle call decline
  socket.on('declineCall', ({ to }) => {
    const callerSocket = users.get(to);
    if (callerSocket) {
      io.to(callerSocket).emit('callDeclined');
    }
  });

  // New message notification
  socket.on('sendMessage', ({ to, message }) => {
    const recipientSocket = users.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('newMessage', { message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ to, isTyping }) => {
    const recipientSocket = users.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('userTyping', { 
        userId: socket.userId, 
        isTyping 
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      users.delete(socket.userId);
      io.emit('userOffline', { userId: socket.userId });
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.io signaling server running on port ${PORT}`);
});
