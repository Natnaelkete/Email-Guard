// Inject environment variables into built files
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const distDir = path.join(__dirname, '..', 'dist');
const configFile = path.join(distDir, 'config.js');

console.log('🔧 Injecting environment variables...');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. AI will require user token.');
  console.log('   Create .env file with GITHUB_TOKEN=your_token');
  return;
}

// Read the GitHub token from .env
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.log('⚠️  GITHUB_TOKEN not found in .env file');
  console.log('   AI functionality will require user token');
  return;
}

// Read the config.js file
if (!fs.existsSync(configFile)) {
  console.error('❌ config.js not found in dist folder');
  process.exit(1);
}

let configContent = fs.readFileSync(configFile, 'utf8');

// Replace the placeholder with actual token
configContent = configContent.replace('__GITHUB_TOKEN__', githubToken);

// Write back to file
fs.writeFileSync(configFile, configContent, 'utf8');

console.log('✅ GitHub token injected successfully!');
console.log('   Token length:', githubToken.length, 'characters');
console.log('   AI detection will work automatically');
