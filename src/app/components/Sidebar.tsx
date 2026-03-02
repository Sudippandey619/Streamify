import React from 'react';
import { Home, Search, Library, Plus, Heart, Settings, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'music-stream', label: 'Music Stream', icon: Music },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const libraryItems = [
    { id: 'liked', label: 'Liked Songs', icon: Heart },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-black flex flex-col h-full"
    >
      {/* Main Navigation */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg" />
          <span className="text-white text-xl font-bold">Streamify</span>
        </div>

        <nav className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={24} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Library Section */}
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('library')}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <Library size={20} />
            <span className="font-medium">Library</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </motion.button>
        </div>

        <div className="space-y-2">
          {libraryItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
          
          {/* Admin Link */}
          <motion.button
            onClick={() => onNavigate('admin')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
            whileHover={{ x: 4 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium">Music Manager</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-zinc-800">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-4 cursor-pointer"
        >
          <p className="text-white text-sm font-semibold mb-1">Premium</p>
          <p className="text-white text-xs opacity-80">Upgrade for ad-free music</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
