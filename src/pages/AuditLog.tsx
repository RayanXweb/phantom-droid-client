import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { clientApi } from '../api/client';
import { useToast } from '../components/common/Toast';
import { AuditLog } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter, Calendar, User, Activity, RefreshCw } from 'lucide-react';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const fetchLogs = async () => {
    try {
      const response = await clientApi.getAuditLogs();
      if (response.data.success && response.data.data) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-600/20';
    if (action.includes('DELETE')) return 'text-red-400 bg-red-600/20';
    if (action.includes('UPDATE')) return 'text-blue-400 bg-blue-600/20';
    if (action.includes('LOGIN')) return 'text-purple-400 bg-purple-600/20';
    if (action.includes('QR')) return 'text-amber-400 bg-amber-600/20';
    if (action.includes('REGENERATE')) return 'text-cyan-400 bg-cyan-600/20';
    return 'text-gray-400 bg-gray-600/20';
  };

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="text-gray-400">Track all activities and changes</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search actions or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Log List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading logs...</p>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No logs found</h3>
            <p className="text-gray-400">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getActionColor(log.action)} flex-shrink-0`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p className="truncate max-w-[200px] sm:max-w-[300px]">
                      {log.details && Object.entries(log.details).map(([key, value]) => (
                        <span key={key} className="inline-block mr-2">
                          <span className="text-gray-500">{key}:</span>
                          <span className="text-gray-300">{String(value)}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditLogPage;
