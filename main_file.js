import { execSync } from 'child_process';

console.log('[DEPLOY] Version: 1.0.6 - Forced Programmatic Build');

try {
  console.log('[DEPLOY] Running build command...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('[DEPLOY] Build completed successfully.');
} catch (error) {
  console.error('[DEPLOY] Build failed:', error);
}

import './build/index.js';
