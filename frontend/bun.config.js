// Bun configuration for React development and builds
export default {
  // Development server configuration
  dev: {
    port: 3000,
    host: 'localhost',
    hot: true,
  },
  
  // Build configuration
  build: {
    entrypoints: ['./src/index.js'],
    outdir: './build',
    target: 'browser',
    format: 'esm',
    splitting: true,
    sourcemap: 'external',
    minify: true,
    external: [], // Don't externalize dependencies for browser builds
    define: {
      // Define Node.js globals for browser compatibility
      'process.env.NODE_ENV': '"development"',
      'process.env': '{}',
      'global': 'globalThis',
    },
  },
  
  // Test configuration
  test: {
    root: './src',
    environment: 'jsdom',
  },
}; 