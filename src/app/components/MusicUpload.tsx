import React, { useState } from 'react';
import { Upload, Music, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFormData {
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioFile: File | null;
  coverFile: File | null;
}

interface MusicUploadProps {
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export default function MusicUpload({ onUploadSuccess, onClose }: MusicUploadProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    artist: '',
    album: '',
    duration: '',
    audioFile: null,
    coverFile: null,
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'cover') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [`${fileType}File`]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist || !formData.audioFile) {
      setErrorMessage('Title, artist, and audio file are required');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('album', formData.album);
      formDataToSend.append('duration', formData.duration || '180');
      formDataToSend.append('audio', formData.audioFile);
      
      if (formData.coverFile) {
        formDataToSend.append('cover', formData.coverFile);
      }

      const response = await fetch('/api/upload/track', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadStatus('success');
      setFormData({
        title: '',
        artist: '',
        album: '',
        duration: '',
        audioFile: null,
        coverFile: null,
      });
      
      // Reset file inputs
      const audioInput = document.getElementById('audio-file') as HTMLInputElement;
      const coverInput = document.getElementById('cover-file') as HTMLInputElement;
      if (audioInput) audioInput.value = '';
      if (coverInput) coverInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Music
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {uploadStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">Track uploaded successfully!</span>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Audio File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Audio File *
          </label>
          <div className="relative">
            <input
              id="audio-file"
              type="file"
              accept=".mp3,.wav,.m4a,.flac,.ogg"
              onChange={(e) => handleFileChange(e, 'audio')}
              className="hidden"
              required
            />
            <label
              htmlFor="audio-file"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
            >
              <div className="text-center">
                <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">
                  {formData.audioFile ? (
                    <>
                      <span className="text-white">{formData.audioFile.name}</span>
                      <br />
                      <span className="text-sm">{formatFileSize(formData.audioFile.size)}</span>
                    </>
                  ) : (
                    'Click to select audio file'
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: MP3, WAV, M4A, FLAC, OGG
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Cover Art Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cover Art (Optional)
          </label>
          <div className="relative">
            <input
              id="cover-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileChange(e, 'cover')}
              className="hidden"
            />
            <label
              htmlFor="cover-file"
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
            >
              <div className="text-center">
                <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-gray-400 text-sm">
                  {formData.coverFile ? (
                    <>
                      <span className="text-white">{formData.coverFile.name}</span>
                      <br />
                      <span className="text-xs">{formatFileSize(formData.coverFile.size)}</span>
                    </>
                  ) : (
                    'Click to select cover image'
                  )}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Track Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter track title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artist *
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter artist name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Album
            </label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter album name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="180"
              min="1"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={uploading || !formData.title || !formData.artist || !formData.audioFile}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Track
              </>
            )}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}