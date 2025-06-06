import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path"; import { componentTagger } from "lovable-tagger";
export default defineConfig(({ }) => ({ 
  server: { 
    host: "::",
    port: 8080,
  }, plugins: [ 
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: { outDir: 'docs', },
  resolve: { alias: { "@": path.resolve(__dirname, "./src"), }, },}));
