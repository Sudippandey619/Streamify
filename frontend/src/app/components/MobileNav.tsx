import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
  ];

  return (
    <div className="md:hidden fixed bottom-24 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 flex-1"
              whileTap={{ scale: 0.95 }}
            >
              <Icon
                size={24}
                className={isActive ? 'text-white' : 'text-zinc-400'}
              />
              <span
                className={`text-xs ${
                  isActive ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
