// Simple API test script
// Run with: node test-api.js

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${description} - OK`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
    
    return data;
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Make sure the backend server is running on port 3001');
  
  // Test all endpoints
  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/tracks', 'Get All Tracks');
  await testEndpoint('/tracks/track-1', 'Get Track by ID');
  await testEndpoint('/albums', 'Get All Albums');
  await testEndpoint('/albums/album-1', 'Get Album by ID');
  await testEndpoint('/playlists', 'Get All Playlists');
  await testEndpoint('/playlists/playlist-1', 'Get Playlist by ID');
  await testEndpoint('/artists', 'Get All Artists');
  await testEndpoint('/artists/artist-1', 'Get Artist by ID');
  await testEndpoint('/search?q=neon', 'Search Content');
  
  console.log('\n🏁 API Tests Complete!');
}

runTests().catch(console.error);