import React, { useState } from 'react';
import { Client } from '../../types';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: client?.name || '',
    status: client?.status || 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Client name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Client Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter client name"
          disabled={loading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as 'ACTIVE' | 'INACTIVE',
            }))
          }
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            client ? 'Update Client' : 'Create Client'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
