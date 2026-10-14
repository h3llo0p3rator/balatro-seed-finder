import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Project Pages URL: https://h3llo0p3rator.github.io/balatro-seed-finder/
export default defineConfig({
  plugins: [react()],
  base: "/balatro-seed-finder/",
});
