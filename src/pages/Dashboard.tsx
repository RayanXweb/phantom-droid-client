import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { clientApi } from '../api/client';
import Layout from '../components/common/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentClients from '../components/dashboard/RecentClients';
import RecentActivity from '../components/dashboard/RecentActivity';
import { DashboardStats as Stats, Client, AuditLog } from '../types';
import { useToast } from '../components/common/Toast';
import { RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await clientApi.getStats();
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Socket event listeners
    const handleClientUpdate = (data: any) => {
      console.log('Client updated:', data);
      fetchStats();
    };

    on('client:connected', handleClientUpdate);
    on('client:disconnected', handleClientUpdate);
    on('client:updated', handleClientUpdate);

    return () => {
      off('client:connected', handleClientUpdate);
      off('client:disconnected', handleClientUpdate);
      off('client:updated', handleClientUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {user?.username}! Here's what's happening with your clients.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && <DashboardStats stats={stats} />}

        {/* Recent Clients and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentClients clients={stats?.recentClients || []} />
          <RecentActivity activities={stats?.recentActivities || []} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
