import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientApi } from '../api/client';
import { socketClient } from '../api/socket';
import { Client } from '../types';
import { Wifi, WifiOff, Power, PowerOff, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ClientView: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await clientApi.getClient(clientId!);
        if (response.data.success && response.data.data) {
          setClient(response.data.data);
          if (response.data.data.status === 'INACTIVE') {
            setError('Client is inactive. Please contact administrator.');
          } else {
            connectSocket();
          }
        } else {
          setError('Client not found');
        }
      } catch (err) {
        setError('Failed to load client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();

    return () => {
      socketClient.disconnect();
    };
  }, [clientId]);

  const connectSocket = () => {
    const socket = socketClient.connect('');
    
    socket.on('connect', () => {
      setIsConnected(true);
      // Join client room
      socket.emit('client:join', { clientId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('client:session', (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
    });

    socket.on('client:error', (data: { message: string }) => {
      setError(data.message);
    });
  };

  const handleConnect = () => {
    if (!client) return;
    // Connect to client session
    socketClient.emit('client:connect', { clientId: client.id });
  };

  const handleDisconnect = () => {
    socketClient.emit('client:disconnect', { clientId });
    setIsConnected(false);
    setSessionId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading client...</p>
        </div>
      </div>
    );
  }

  if (error && client?.status === 'INACTIVE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PowerOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Client Inactive</h1>
          <p className="text-gray-400">This client has been deactivated. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PowerOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Client Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-600/20 rounded-2xl mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">PD</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">PHANTOM DROID</h1>
          <p className="text-gray-400 text-sm mt-1">Client: {client?.code}</p>
        </div>

        {/* Client Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <span className="text-gray-400 text-sm">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-gray-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <span className="text-gray-400 text-sm">Client Name</span>
            <span className="text-white text-sm font-medium">{client?.name}</span>
          </div>

          {sessionId && (
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400 text-sm">Session</span>
              <span className="text-emerald-400 text-sm font-medium">Active</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              <Power className="w-4 h-4" />
              Connect
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              <PowerOff className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-center text-xs text-gray-500">
            Phantom Droid Client v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientView;
