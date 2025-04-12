import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist', // output directory
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // main entry
      },
      output: {
        // Optional: clean chunk naming
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // Separate large libs or shared code
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/')) {
            return 'src';
          }
        }
      }
    }
  }
});