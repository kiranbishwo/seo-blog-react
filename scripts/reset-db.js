/**
 * Deletes blog.db so the next server start creates a fresh DB with admin + basic seed.
 * Stop the dev server before running: npm run db:reset
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "blog.db");
try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("Deleted blog.db. Restart the server for a fresh DB with admin + basic seed.");
  } else {
    console.log("No blog.db found. Start the server to create a fresh DB.");
  }
} catch (e) {
  console.error("Could not delete blog.db (stop the server first):", e.message);
  process.exit(1);
}
