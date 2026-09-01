import React from 'react';
import { AuditLog } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Activity, UserPlus, UserX, QrCode, RefreshCw } from 'lucide-react';

interface RecentActivityProps {
  activities: AuditLog[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return UserPlus;
    if (action.includes('DELETE')) return UserX;
    if (action.includes('QR')) return QrCode;
    if (action.includes('REGENERATE')) return RefreshCw;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-600/20';
    if (action.includes('DELETE')) return 'text-red-400 bg-red-600/20';
    if (action.includes('QR')) return 'text-purple-400 bg-purple-600/20';
    return 'text-blue-400 bg-blue-600/20';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity) => {
            const Icon = getActionIcon(activity.action);
            const colorClass = getActionColor(activity.action);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {activity.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    by {activity.username} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
