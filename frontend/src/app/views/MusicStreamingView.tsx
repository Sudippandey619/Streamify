import React from 'react';
import { motion } from 'motion/react';
import { SearchComponent } from '../components/MusicSearch';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { Music } from 'lucide-react';

export function MusicStreamingView() {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-sm bg-slate-900/95 border-b border-slate-800 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Streamify
              </h1>
              <p className="text-sm text-slate-400">
                Discover and Play Music
              </p>
            </div>
          </div>

          <DarkModeToggle />
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
        <SearchComponent apiBaseUrl="http://localhost:3001/api" />
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-slate-800 bg-slate-900/50 py-6 mt-8"
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-3">
            Streamify - Your music streaming application
          </p>
          <div className="flex justify-center gap-4 text-xs flex-wrap">
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              About
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Privacy
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Terms
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">
              © 2026 Streamify
            </span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
