
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to ensure Node.js types are correctly used for the config execution context.
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  // Using imported process.cwd() instead of the global process to resolve typing issues.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Provide a fallback for process.env to prevent "process is not defined" errors
      'process.env': env 
    }
  };
});
