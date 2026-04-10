// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [vue({ appEntrypoint: "/src/pages/_app" })],
  vite: {
    // @ts-ignore - version mismatch between astro's vite and @tailwindcss/vite
    plugins: [tailwindcss()],
  },
});
