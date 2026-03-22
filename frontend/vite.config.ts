import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  cacheDir: "/tmp/vite-cache",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
