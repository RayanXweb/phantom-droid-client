import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ClientForm from '../components/clients/ClientForm';
import { clientApi } from '../api/client';
import { useToast } from '../components/common/Toast';
import { Client } from '../types';
import { ArrowLeft, QrCode, Copy, ExternalLink, Power, PowerOff, RefreshCw, Trash2 } from 'lucide-react';
import ClientStatusBadge from '../components/clients/ClientStatusBadge';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClient = async () => {
    try {
      const response = await clientApi.getClient(id!);
      if (response.data.success && response.data.data) {
        setClient(response.data.data);
      } else {
        showToast('Client not found', 'error');
        navigate('/clients');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      showToast('Failed to load client', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleUpdate = async (data: Partial<Client>) => {
    try {
      const response = await clientApi.updateClient(id!, data);
      if (response.data.success) {
        showToast('Client updated successfully', 'success');
        setEditing(false);
        fetchClient();
      }
    } catch (error) {
      console.error('Error updating client:', error);
      showToast('Failed to update client', 'error');
    }
  };

  const handleAction = async (action: string) => {
    if (!client) return;
    setActionLoading(true);

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await clientApi.activateClient(client.id);
          showToast('Client activated', 'success');
          break;
        case 'deactivate':
          response = await clientApi.deactivateClient(client.id);
          showToast('Client deactivated', 'warning');
          break;
        case 'regenerate-url':
          response = await clientApi.regenerateUrl(client.id);
          showToast('URL regenerated', 'success');
          break;
        case 'regenerate-qr':
          response = await clientApi.regenerateQR(client.id);
          showToast('QR regenerated', 'success');
          break;
        case 'delete':
          if (!confirm('Are you sure you want to delete this client?')) {
            setActionLoading(false);
            return;
          }
          response = await clientApi.deleteClient(client.id);
          showToast('Client deleted', 'success');
          navigate('/clients');
          return;
        default:
          return;
      }

      if (response?.data.success) {
        fetchClient();
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showToast(`Failed to ${action.replace('-', ' ')}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied`, 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading client...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white">Client not found</h2>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Back to Clients
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {client.code}
              </code>
              <ClientStatusBadge status={client.status} isOnline={client.isOnline} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {editing ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Edit Client</h2>
            <ClientForm
              client={client}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white">{client.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Code</span>
                    <code className="text-white bg-gray-800 px-2 py-1 rounded text-sm">
                      {client.code}
                    </code>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Status</span>
                    <ClientStatusBadge status={client.status} isOnline={client.isOnline} />
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">QR Status</span>
                    <span className={`text-sm font-medium ${
                      client.qrStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-gray-400'
                    }`}>
                      {client.qrStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white text-sm">
                      {new Date(client.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Last Active</span>
                    <span className="text-white text-sm">
                      {client.lastActive ? new Date(client.lastActive).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(client.url, 'Client URL')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">Copy URL</span>
                    </div>
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">
                      {client.url}
                    </span>
                  </button>

                  <a
                    href={`/c/${client.code}`}
                    target="_blank"
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">Open Client</span>
                    </div>
                  </a>

                  <button
                    onClick={() => navigate(`/clients/${client.id}/qr`)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <QrCode className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">View QR Code</span>
                    </div>
                  </button>

                  <div className="border-t border-gray-800 my-2 pt-2 space-y-2">
                    {client.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleAction('deactivate')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <PowerOff className="w-4 h-4" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('activate')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Power className="w-4 h-4" />
                        Activate
                      </button>
                    )}

                    <button
                      onClick={() => handleAction('regenerate-url')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate URL
                    </button>

                    <button
                      onClick={() => handleAction('regenerate-qr')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate QR
                    </button>

                    <button
                      onClick={() => handleAction('delete')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Client
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ClientDetail;
