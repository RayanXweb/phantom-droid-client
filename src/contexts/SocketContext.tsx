import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { socketClient } from '../api/socket';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
  isConnected: boolean;
  socket: any;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = socketClient.connect(token);
      
      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      return () => {
        socketClient.disconnect();
        setIsConnected(false);
      };
    } else {
      socketClient.disconnect();
      setIsConnected(false);
    }
  }, [token, isAuthenticated]);

  const emit = (event: string, data?: any) => {
    socketClient.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketClient.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketClient.off(event, callback);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        socket: socketClient.getSocket(),
        emit,
        on,
        off,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
