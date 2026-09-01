import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
  QrCode,
} from 'lucide-react';
import { DashboardStats as Stats } from '../../types';

interface DashboardStatsProps {
  stats: Stats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Active Clients',
      value: stats.activeClients,
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Inactive Clients',
      value: stats.inactiveClients,
      icon: UserX,
      color: 'red',
    },
    {
      title: 'Online Clients',
      value: stats.onlineClients,
      icon: Wifi,
      color: 'emerald',
    },
    {
      title: 'Offline Clients',
      value: stats.offlineClients,
      icon: WifiOff,
      color: 'gray',
    },
    {
      title: 'Total QR Codes',
      value: stats.totalQR,
      icon: QrCode,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; glow: string }> = {
      indigo: { bg: 'bg-indigo-600/20', icon: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
      green: { bg: 'bg-green-600/20', icon: 'text-green-400', glow: 'shadow-green-500/20' },
      red: { bg: 'bg-red-600/20', icon: 'text-red-400', glow: 'shadow-red-500/20' },
      emerald: { bg: 'bg-emerald-600/20', icon: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
      gray: { bg: 'bg-gray-600/20', icon: 'text-gray-400', glow: 'shadow-gray-500/20' },
      purple: { bg: 'bg-purple-600/20', icon: 'text-purple-400', glow: 'shadow-purple-500/20' },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card) => {
        const colors = getColorClasses(card.color);
        return (
          <div
            key={card.title}
            className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg ${colors.glow}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${colors.bg}`}>
                <card.icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
