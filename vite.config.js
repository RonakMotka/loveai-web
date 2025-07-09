import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import crypto from "crypto";

if (!globalThis.crypto) {
  globalThis.crypto = {
    getRandomValues: (buffer) => crypto.randomFillSync(buffer),
  };
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
