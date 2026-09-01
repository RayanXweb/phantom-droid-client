import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  QrCode,
  Copy,
  ExternalLink,
  Download,
} from 'lucide-react';
import { clientApi } from '../../api/client';
import { useToast } from '../common/Toast';
import ClientStatusBadge from './ClientStatusBadge';

interface ClientListProps {
  clients: Client[];
  onRefresh: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleAction = async (
    action: string,
    clientId: string,
    clientName: string
  ) => {
    if (loading) return;
    setLoading(clientId);

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await clientApi.activateClient(clientId);
          showToast(`${clientName} activated successfully`, 'success');
          break;
        case 'deactivate':
          response = await clientApi.deactivateClient(clientId);
          showToast(`${clientName} deactivated successfully`, 'warning');
          break;
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${clientName}?`)) {
            setLoading(null);
            return;
          }
          response = await clientApi.deleteClient(clientId);
          showToast(`${clientName} deleted successfully`, 'success');
          break;
        case 'regenerate':
          response = await clientApi.regenerateUrl(clientId);
          showToast(`URL regenerated for ${clientName}`, 'success');
          break;
        case 'regenerate-qr':
          response = await clientApi.regenerateQR(clientId);
          showToast(`QR regenerated for ${clientName}`, 'success');
          break;
        default:
          return;
      }

      if (response?.data.success) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error ${action} client:`, error);
      showToast(`Failed to ${action} client`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'success');
  };

  if (clients.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
        <QrCode className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
        <p className="text-gray-400">Get started by creating your first client.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                QR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-800/30 transition-colors duration-200"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-400">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link
                        to={`/clients/${client.id}`}
                        className="text-sm font-medium text-white hover:text-indigo-400 transition-colors"
                      >
                        {client.name}
                      </Link>
                      <div className="flex items-center gap-2 sm:hidden">
                        <ClientStatusBadge
                          status={client.status}
                          isOnline={client.isOnline}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                    {client.code}
                  </code>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <ClientStatusBadge
                    status={client.status}
                    isOnline={client.isOnline}
                  />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`text-xs font-medium ${
                      client.qrStatus === 'ACTIVE'
                        ? 'text-emerald-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {client.qrStatus}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(client.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Quick actions */}
                    <button
                      onClick={() => copyToClipboard(client.url, 'Client URL')}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Copy URL"
                      disabled={loading === client.id}
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/c/${client.code}`}
                      target="_blank"
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Open Client"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/clients/${client.id}/qr`}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Link>

                    <div className="relative group">
                      <button
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          <Link
                            to={`/clients/${client.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>

                          {client.status === 'ACTIVE' ? (
                            <button
                              onClick={() =>
                                handleAction('deactivate', client.id, client.name)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors w-full"
                              disabled={loading === client.id}
                            >
                              <PowerOff className="w-4 h-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleAction('activate', client.id, client.name)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-gray-700 transition-colors w-full"
                              disabled={loading === client.id}
                            >
                              <Power className="w-4 h-4" />
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleAction('regenerate', client.id, client.name)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 transition-colors w-full"
                            disabled={loading === client.id}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate URL
                          </button>

                          <button
                            onClick={() =>
                              handleAction('regenerate-qr', client.id, client.name)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:bg-gray-700 transition-colors w-full"
                            disabled={loading === client.id}
                          >
                            <QrCode className="w-4 h-4" />
                            Regenerate QR
                          </button>

                          <div className="border-t border-gray-700 my-1"></div>

                          <button
                            onClick={() =>
                              handleAction('delete', client.id, client.name)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors w-full"
                            disabled={loading === client.id}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
