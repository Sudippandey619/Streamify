import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Audio files
  if (file.fieldname === 'audio') {
    const allowedAudioTypes = /mp3|wav|m4a|flac|ogg/;
    const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /audio/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audio field'));
    }
  }
  
  // Image files for cover art
  if (file.fieldname === 'cover') {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover field'));
    }
  }
  
  cb(new Error('Invalid field name'));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// In-memory storage for uploaded tracks (in production, use a database)
let uploadedTracks = [];
let uploadedAlbums = [];
let uploadedArtists = [];

// Upload a single track
router.post('/track', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;
    
    if (!title || !artist || !req.files.audio) {
      return res.status(400).json({ error: 'Title, artist, and audio file are required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;
    
    // Create URLs for the uploaded files
    const audioUrl = `/api/uploads/${audioFile.filename}`;
    const coverUrl = coverFile ? `/api/uploads/${coverFile.filename}` : 
      'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';

    // Create artist if doesn't exist
    let artistData = uploadedArtists.find(a => a.name.toLowerCase() === artist.toLowerCase());
    if (!artistData) {
      artistData = {
        id: `artist-${uuidv4()}`,
        name: artist,
        imageUrl: coverUrl,
        genres: ['Unknown'],
        followers: 0,
        verified: false,
      };
      uploadedArtists.push(artistData);
    }

    // Create album if doesn't exist
    let albumData = uploadedAlbums.find(a => 
      a.title.toLowerCase() === album?.toLowerCase() && 
      a.artistId === artistData.id
    );
    
    if (!albumData && album) {
      albumData = {
        id: `album-${uuidv4()}`,
        title: album,
        artist: artist,
        artistId: artistData.id,
        coverUrl: coverUrl,
        releaseDate: new Date().toISOString().split('T')[0],
        tracks: []
      };
      uploadedAlbums.push(albumData);
    }

    // Create track
    const newTrack = {
      id: `track-${uuidv4()}`,
      title,
      artist,
      artistId: artistData.id,
      album: album || 'Single',
      albumId: albumData?.id || `album-${uuidv4()}`,
      duration: parseInt(duration) || 180, // Default 3 minutes if not provided
      coverUrl,
      audioUrl,
      releaseDate: new Date().toISOString().split('T')[0],
    };

    uploadedTracks.push(newTrack);

    // Add track to album
    if (albumData) {
      albumData.tracks.push(newTrack);
    }

    res.status(201).json({
      message: 'Track uploaded successfully',
      track: newTrack
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// Get all uploaded tracks
router.get('/tracks', (req, res) => {
  res.json(uploadedTracks);
});

// Get all uploaded albums
router.get('/albums', (req, res) => {
  res.json(uploadedAlbums);
});

// Get all uploaded artists
router.get('/artists', (req, res) => {
  res.json(uploadedArtists);
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete a track
router.delete('/track/:id', (req, res) => {
  const { id } = req.params;
  const trackIndex = uploadedTracks.findIndex(t => t.id === id);
  
  if (trackIndex === -1) {
    return res.status(404).json({ error: 'Track not found' });
  }

  const track = uploadedTracks[trackIndex];
  
  // Delete files from disk
  try {
    const audioPath = path.join(__dirname, 'uploads', path.basename(track.audioUrl));
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    // Only delete cover if it's not used by other tracks
    const coverPath = path.join(__dirname, 'uploads', path.basename(track.coverUrl));
    const otherTracksWithSameCover = uploadedTracks.filter(t => 
      t.id !== id && t.coverUrl === track.coverUrl
    );
    
    if (fs.existsSync(coverPath) && otherTracksWithSameCover.length === 0) {
      fs.unlinkSync(coverPath);
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }

  // Remove from arrays
  uploadedTracks.splice(trackIndex, 1);
  
  // Remove from album
  const album = uploadedAlbums.find(a => a.id === track.albumId);
  if (album) {
    album.tracks = album.tracks.filter(t => t.id !== id);
    
    // Remove album if no tracks left
    if (album.tracks.length === 0) {
      const albumIndex = uploadedAlbums.findIndex(a => a.id === album.id);
      if (albumIndex !== -1) {
        uploadedAlbums.splice(albumIndex, 1);
      }
    }
  }

  res.status(204).send();
});

export { router as uploadRoutes, uploadedTracks, uploadedAlbums, uploadedArtists };