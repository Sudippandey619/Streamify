import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

console.log('Test: Loading .env file');
console.log('__dirname:', __dirname);
console.log('envPath:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log('dotenv.config result:', result);
  console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ loaded' : '❌ not loaded');
  console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ loaded' : '❌ not loaded');
} else {
  console.log('File not found!');
}
