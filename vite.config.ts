import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    allowedHosts: ["10.196.25.95", "localhost", "127.0.0.1"],
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ["gsap", "gsap/ScrollTrigger", "gsap/ScrollToPlugin"],
          motion: ["motion/react"],
          icons: ["@phosphor-icons/react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "gsap",
      "gsap/ScrollTrigger",
      "gsap/ScrollToPlugin",
      "motion/react",
      "react",
      "react-dom",
      "react-dom/client",
    ],
  },
})