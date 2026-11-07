import type { MetadataRoute } from "next";

// מה שהטלפון קורא כשמוסיפים את הפאנל למסך הבית: שם, אייקון, צבעים, ולפתוח בלי שורת הכתובת
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hangist Tun",
    short_name: "Hangist Tun",
    description: "My quiet home",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1321",
    theme_color: "#0d1321",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}