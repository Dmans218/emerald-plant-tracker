#!/usr/bin/env bun

// Simple static file server for React development
import { serve, file } from 'bun';
import { watch } from 'fs';
import path from 'path';

const PORT = 3000;
const API_PROXY_TARGET = 'http://localhost:420';

// Serve pre-built React app with API proxy
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Proxy API requests to backend
    if (url.pathname.startsWith('/api')) {
      try {
        const backendUrl = `${API_PROXY_TARGET}${url.pathname}${url.search}`;
        return fetch(backendUrl, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
      } catch (error) {
        console.error('API Proxy error:', error);
        return new Response('Backend unavailable', { status: 502 });
      }
    }
    
    // Serve static files from build directory
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    
    try {
      // First try to serve from build directory (for CSS, JS, assets)
      const buildFile = await file(path.join('./build', filePath));
      if (await buildFile.exists()) {
        const contentType = getContentType(filePath);
        return new Response(buildFile, {
          headers: { 'Content-Type': contentType },
        });
      }
      
      // Then try public directory for static assets
      const publicFile = await file(path.join('./public', filePath));
      if (await publicFile.exists()) {
        const contentType = getContentType(filePath);
        return new Response(publicFile, {
          headers: { 'Content-Type': contentType },
        });
      }
      
      // For SPA routing, serve index.html
      if (!filePath.includes('.')) {
        const indexFile = await file('./build/index.html');
        return new Response(indexFile, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Server error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return types[ext] || 'text/plain';
}

console.log(`🌿 Emerald Plant Tracker (Bun + React) running at http://localhost:${PORT}`);
console.log(`🔗 API proxy: ${API_PROXY_TARGET}`);
console.log(`📁 Serving from: ./build directory`);

// Watch for changes and rebuild automatically
watch('./src', { recursive: true }, async (eventType, filename) => {
  if (filename && (filename.endsWith('.js') || filename.endsWith('.jsx') || filename.endsWith('.css'))) {
    console.log(`🔄 File changed: ${filename} - Rebuilding...`);
    try {
      // Rebuild the app
      const proc = Bun.spawn(['bun', 'run', 'build'], { 
        cwd: process.cwd()
      });
      
      const success = (await proc.exited) === 0;
      if (success) {
        console.log(`✅ Rebuild completed`);
      } else {
        console.error(`❌ Rebuild failed`);
      }
    } catch (error) {
      console.error('Rebuild error:', error);
    }
  }
}); 