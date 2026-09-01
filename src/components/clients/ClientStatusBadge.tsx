import React from 'react';

interface ClientStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  isOnline: boolean;
}

const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({
  status,
  isOnline,
}) => {
  const getStatusConfig = () => {
    if (isOnline) {
      return {
        label: 'Online',
        color: 'bg-emerald-500',
        text: 'text-emerald-400',
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-green-500',
          text: 'text-green-400',
        };
      case 'INACTIVE':
        return {
          label: 'Inactive',
          color: 'bg-red-500',
          text: 'text-red-400',
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          color: 'bg-yellow-500',
          text: 'text-yellow-400',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-500',
          text: 'text-gray-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs font-medium">{config.label}</span>
    </span>
  );
};

export default ClientStatusBadge;
