import fs from 'node:fs';
try {
  fs.copyFileSync('dist/index.html', 'dist/404.html');
  console.log('Successfully created dist/404.html');
} catch (err) {
  console.error('Failed to copy 404.html:', err);
}
