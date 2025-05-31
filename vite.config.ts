import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// It seems 'componentTagger' might be conditionally imported based on 'mode'.
// Ensure 'lovable-tagger' is installed if 'componentTagger' is used.
// import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({ // Make sure 'mode' is destructured here
  server: {
    host: "::",
    port: 8080,
  },
  base: '/story-point-showdown-antics/', // <-- THIS IS THE CRUCIAL CHANGE
  plugins: [
    react(),
    mode === 'development' &&
    // componentTagger(), // Ensure lovable-tagger is installed if you uncomment this
  ].filter(Boolean),
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
