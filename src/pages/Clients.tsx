import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import { clientApi } from '../api/client';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../components/common/Toast';
import { Client } from '../types';
import { Plus, Search, Filter } from 'lucide-react';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { on, off } = useSocket();
  const { showToast } = useToast();

  const fetchClients = async () => {
    try {
      const response = await clientApi.getClients();
      if (response.data.success && response.data.data) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Socket event listeners
    const handleClientUpdate = (data: any) => {
      fetchClients();
    };

    on('client:created', handleClientUpdate);
    on('client:updated', handleClientUpdate);
    on('client:deleted', handleClientUpdate);

    return () => {
      off('client:created', handleClientUpdate);
      off('client:updated', handleClientUpdate);
      off('client:deleted', handleClientUpdate);
    };
  }, []);

  const handleCreateClient = async (data: Partial<Client>) => {
    try {
      const response = await clientApi.createClient(data);
      if (response.data.success) {
        showToast('Client created successfully', 'success');
        setShowCreateModal(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      showToast('Failed to create client', 'error');
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-gray-400">Manage your clients and their QR codes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors duration-200">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Client List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading clients...</p>
            </div>
          </div>
        ) : (
          <ClientList
            clients={filteredClients}
            onRefresh={fetchClients}
          />
        )}

        {/* Create Client Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Create New Client</h2>
              <ClientForm
                onSubmit={handleCreateClient}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
