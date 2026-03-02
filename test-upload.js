// Test script for music upload functionality
// Run with: node test-upload.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUploadEndpoints() {
  const API_BASE = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Upload System...');
  console.log('Make sure the backend server is running on port 3001\n');

  try {
    // Test 1: Check upload endpoints exist
    console.log('1. Testing upload endpoints...');
    
    const uploadTracksResponse = await fetch(`${API_BASE}/upload/tracks`);
    if (uploadTracksResponse.ok) {
      const tracks = await uploadTracksResponse.json();
      console.log(`✅ Upload tracks endpoint - OK (${tracks.length} tracks)`);
    } else {
      console.log('❌ Upload tracks endpoint - FAILED');
    }

    // Test 2: Check if uploads directory exists
    console.log('\n2. Checking uploads directory...');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Uploads directory exists');
      const files = fs.readdirSync(uploadsDir);
      console.log(`   Files in uploads: ${files.length}`);
      
      if (files.length > 1) { // More than just .gitkeep
        console.log(`   Uploaded files: ${files.filter(f => f !== '.gitkeep').join(', ')}`);
      }
    } else {
      console.log('❌ Uploads directory missing');
    }

    // Test 3: Check file serving
    console.log('\n3. Testing file serving...');
    const fileResponse = await fetch(`${API_BASE}/upload/uploads/test.txt`);
    if (fileResponse.status === 404) {
      console.log('✅ File serving endpoint responds (404 expected for non-existent file)');
    } else {
      console.log('⚠️  File serving endpoint unexpected response');
    }

    console.log('\n🎉 Upload system tests complete!');
    console.log('\nTo test file upload:');
    console.log('1. Start the frontend: npm run dev:full');
    console.log('2. Go to http://localhost:5173');
    console.log('3. Click "Music Manager" in sidebar');
    console.log('4. Upload an audio file');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running:');
    console.log('cd backend && npm run dev');
  }
}

testUploadEndpoints();