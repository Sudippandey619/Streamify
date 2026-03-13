import React, { useState, useEffect } from 'react';
import { Plus, Music, Trash2, Upload, RefreshCw, Headphones } from 'lucide-react';
import MusicUpload from '@/app/components/MusicUpload';
import { SearchComponent } from '@/app/components/MusicSearch';
import { Track } from '@/types/music';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'manage'>('search');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUploadedTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload/tracks');
      if (response.ok) {
        const tracks = await response.json();
        setUploadedTracks(tracks);
      }
    } catch (error) {
      console.error('Failed to fetch uploaded tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadedTracks();
  }, []);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchUploadedTracks();
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(trackId);
      const response = await fetch(`/api/upload/track/${trackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadedTracks(prev => prev.filter(track => track.id !== trackId));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete track: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete track');
    } finally {
      setDeleting(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showUpload) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6">
        <MusicUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUpload(false)}
        />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchComponent apiBaseUrl="http://localhost:3001/api" />;
      case 'upload':
        return (
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Upload Your Music</h3>
              <p className="text-gray-400 mb-6">
                Add your own audio files to the music library
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Upload
              </button>
            </div>
          </div>
        );
      case 'manage':
        return (
          <div className="bg-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Uploaded Tracks</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading tracks...</p>
              </div>
            ) : uploadedTracks.length === 0 ? (
              <div className="p-8 text-center">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No tracks uploaded yet</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload Your First Track
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {uploadedTracks.map((track) => (
                  <div key={track.id} className="p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-colors">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{track.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                      {track.album && (
                        <p className="text-gray-500 text-xs truncate">{track.album}</p>
                      )}
                    </div>

                    <div className="text-gray-400 text-sm">
                      {formatDuration(track.duration)}
                    </div>

                    <div className="text-gray-500 text-xs">
                      {track.releaseDate}
                    </div>

                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      disabled={deleting === track.id}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      title="Delete track"
                    >
                      {deleting === track.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Music Management</h1>
            <p className="text-gray-400">Manage your music library and integrate with streaming services</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchUploadedTracks}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'search'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Music className="w-4 h-4" />
            Search Music
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Music
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'manage'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Music className="w-4 h-4" />
            Manage Uploads
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Tracks</p>
                <p className="text-2xl font-bold text-white">{uploadedTracks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Storage Used</p>
                <p className="text-2xl font-bold text-white">
                  {uploadedTracks.length > 0 ? `~${(uploadedTracks.length * 4).toFixed(1)} MB` : '0 MB'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Headphones className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Music Sources</p>
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-xs text-gray-500">Jamendo + Uploads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}