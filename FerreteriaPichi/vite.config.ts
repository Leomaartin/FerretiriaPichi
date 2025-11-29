import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite exponer el servidor hacia afuera
    allowedHosts: [
      "interbranchial-momentously-helga.ngrok-free.dev", // tu dominio ngrok
    ],
  },
});
