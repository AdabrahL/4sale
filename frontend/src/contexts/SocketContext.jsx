import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Disable socket connection if VITE_SOCKET_URL is not set or explicitly disabled
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const socketEnabled = import.meta.env.VITE_ENABLE_SOCKET === 'true';
    
    if (!socketEnabled || !socketUrl || !user || !user.id) {
      return;
    }

    // Connect to Socket.io server only if enabled
    const newSocket = io(socketUrl, {
      auth: {
        userId: user.id,
        token: localStorage.getItem('AUTH_TOKEN')
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Register user with socket
      newSocket.emit('register', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection failed:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
