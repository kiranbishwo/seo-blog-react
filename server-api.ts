/**
 * API-only server for development. Run with Vite CLI and proxy so tsx never loads vite.config.
 * Usage: npm run dev (runs "vite" + "tsx server-api.ts"); open http://localhost:3000
 */
import { createApp } from "./server-app";

const API_PORT = parseInt(process.env.API_PORT || "3001", 10);
const { app } = createApp({
  baseUrl: "http://localhost:3000", // Vite dev server; sitemap/robots point here
});

const server = app.listen(API_PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${API_PORT} (proxied from Vite on :3000)`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${API_PORT} is already in use. Another API server may be running.`);
    console.error("Stop the other process or run: npm run dev:api:kill\n");
    process.exit(1);
  }
  throw err;
});
