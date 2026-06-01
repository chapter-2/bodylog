import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["./app/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
  },

  app: {
    head: {
      title: "BodyLog",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
        { rel: "manifest", href: "/manifest.json" },
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

  nitro: {
    rollupConfig: {
      external: ["better-sqlite3"],
    },
  },
});
