import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_APP_DIR = path.join(ROOT_DIR, 'dist-app');
const ZIP_OUTPUT = path.join(DIST_APP_DIR, 'CrazyCrunch-PWA-Project.zip');
const STAGING_DIR = path.join(ROOT_DIR, 'staging-zip');

if (!fs.existsSync(DIST_APP_DIR)) {
  fs.mkdirSync(DIST_APP_DIR, { recursive: true });
}

// Remove old zip if exists
if (fs.existsSync(ZIP_OUTPUT)) {
  fs.unlinkSync(ZIP_OUTPUT);
}

// Clean staging dir if exists
if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

// Copy essential files to staging
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'README.md',
  'vercel.json',
  'render.yaml'
];

for (const file of filesToCopy) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(STAGING_DIR, file));
  }
}

// Copy directories
const dirsToCopy = ['src', 'public', 'server', 'dist'];

for (const dir of dirsToCopy) {
  const src = path.join(ROOT_DIR, dir);
  const dest = path.join(STAGING_DIR, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Ensure staging server/data has seed data and empty orders
const stagingOrdersFile = path.join(STAGING_DIR, 'server', 'data', 'orders.json');
if (fs.existsSync(stagingOrdersFile)) {
  fs.writeFileSync(stagingOrdersFile, '[]\n', 'utf8');
}

console.log('📦 Staged files for clean distribution. Compressing into ZIP...');

// Use PowerShell Compress-Archive
try {
  execSync(`powershell.exe -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${ZIP_OUTPUT}' -Force"`, {
    stdio: 'inherit'
  });
  console.log(`✅ Successfully created: ${ZIP_OUTPUT}`);
  const stats = fs.statSync(ZIP_OUTPUT);
  console.log(`📦 Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
} finally {
  // Clean staging
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
}
