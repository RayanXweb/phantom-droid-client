import React from 'react';
import { Menu, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Connection status */}
            <div className="hidden sm:flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm text-white hidden sm:block">
                {user?.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
