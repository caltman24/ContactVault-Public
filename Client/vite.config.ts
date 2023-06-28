import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dns from "dns";
import mkcert from "vite-plugin-mkcert";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [
    react(),
    mkcert({
      hosts: ["localhost"],
    }),
  ],
  server: {
    port: 3000,
  },
});
