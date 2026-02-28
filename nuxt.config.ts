import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["./app/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },

  app: {
    head: {
      title: "BodyLog",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1",
        },
        {
          name: "description",
          content: "Minimalist Gym & Weight Tracker with AI Coaching.",
        },
        { name: "theme-color", content: "#229799" },
        { property: "og:title", content: "BodyLog - AI Powered Gym Tracker" },
        {
          property: "og:description",
          content:
            "Track workouts, monitor bulk progress, and get AI analysis.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
      ],
    },
  },

  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/google-fonts", "nuxt-lucide-icons"],

  googleFonts: {
    families: {
      Syne: [400, 500, 600, 700, 800],
      Mynerve: [400],
      "Courier+New": [400, 700],
    },
    display: "swap",
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
  },

  // ── CRITICAL: better-sqlite3 is a native addon (.node binary).
  // It cannot be bundled by Rollup. Node must resolve it from disk.
  // Do NOT change this to externals.inline — that will break the build.
  nitro: {
    rollupConfig: {
      external: ["better-sqlite3"],
    },
  },
});
