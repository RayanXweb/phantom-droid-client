import React from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface RecentClientsProps {
  clients: Client[];
}

const RecentClients: React.FC<RecentClientsProps> = ({ clients }) => {
  const getStatusColor = (status: string, isOnline: boolean) => {
    if (isOnline) return 'bg-emerald-500';
    if (status === 'ACTIVE') return 'bg-green-500';
    if (status === 'INACTIVE') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Clients</h3>
        <Link
          to="/clients"
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No clients yet</p>
          </div>
        ) : (
          clients.slice(0, 5).map((client) => (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="block bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status, client.isOnline)}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{client.name}</p>
                    <p className="text-xs text-gray-400">
                      {client.code} • {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {client.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentClients;
