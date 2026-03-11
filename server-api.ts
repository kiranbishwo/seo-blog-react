/**
 * API-only server for development. Run with Vite CLI and proxy so tsx never loads vite.config.
 * Usage: npm run dev (runs "vite" + "tsx server-api.ts"); open http://localhost:3000
 */
import { createApp } from "./server-app";

const API_PORT = 3001;
const { app } = createApp({
  baseUrl: "http://localhost:3000", // Vite dev server; sitemap/robots point here
});

app.listen(API_PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${API_PORT} (proxied from Vite on :3000)`);
});
