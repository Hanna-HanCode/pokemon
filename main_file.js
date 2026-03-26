import { execSync } from 'child_process';

async function start() {
  console.log('[DEPLOY] Version: 1.0.8 - Resolved Peer Dependency Conflict');

  try {
    console.log('[DEPLOY] Running build command...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('[DEPLOY] Build completed successfully.');
  } catch (error) {
    console.error('[DEPLOY] Build failed:', error);
  }

  console.log('[DEPLOY] Starting server...');
  await import('./build/index.js');
}

start();
