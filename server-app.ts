/**
 * Shared Express app with all API routes. Used by server.ts (full app with Vite/static)
 * and server-api.ts (API-only for dev with Vite CLI + proxy).
 */
import express from "express";
import { createRequire } from "module";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import nodemailer from "nodemailer";

const require = createRequire(import.meta.url);
const session = require("express-session");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("blog.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    team_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    slug TEXT UNIQUE
  );
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    slug TEXT UNIQUE
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_published INTEGER DEFAULT 0,
    reading_time INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
  );
`);

// Migration: add username, bio, avatar_url to users (for author display)
const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
if (!userCols.some((c) => c.name === "username")) {
  db.prepare("ALTER TABLE users ADD COLUMN username TEXT").run();
}
if (!userCols.some((c) => c.name === "bio")) {
  db.prepare("ALTER TABLE users ADD COLUMN bio TEXT").run();
}
if (!userCols.some((c) => c.name === "avatar_url")) {
  db.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
}

// Migration: add user_id to posts (content creator = author)
const postCols = db.prepare("PRAGMA table_info(posts)").all() as { name: string }[];
if (!postCols.some((c) => c.name === "user_id")) {
  db.prepare("ALTER TABLE posts ADD COLUMN user_id INTEGER REFERENCES users(id)").run();
}

// Backfill user_id from author_id (existing DBs that had authors table and author_id on users)
const postColsAfter = db.prepare("PRAGMA table_info(posts)").all() as { name: string }[];
const hasAuthorIdOnPosts = postColsAfter.some((c) => c.name === "author_id");
const userColsAfter = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
const hasAuthorIdOnUsers = userColsAfter.some((c) => c.name === "author_id");
const authorTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='authors'").get();
if (hasAuthorIdOnPosts && authorTableExists && hasAuthorIdOnUsers) {
  const postsToBackfill = db.prepare("SELECT id, author_id FROM posts WHERE user_id IS NULL AND author_id IS NOT NULL").all() as { id: number; author_id: number }[];
  for (const row of postsToBackfill) {
    const u = db.prepare("SELECT id FROM users WHERE author_id = ?").get(row.author_id) as { id: number } | undefined;
    if (u) db.prepare("UPDATE posts SET user_id = ? WHERE id = ?").run(u.id, row.id);
  }
}

// Backfill username for users that don't have one (from authors table or email)
if (authorTableExists && hasAuthorIdOnUsers) {
  const usersWithAuthor = db.prepare("SELECT u.id, a.username FROM users u JOIN authors a ON u.author_id = a.id WHERE u.username IS NULL OR u.username = ''").all() as { id: number; username: string }[];
  const used = new Set<string>();
  for (const row of usersWithAuthor) {
    let uname = row.username;
    let n = 0;
    while (used.has(uname)) {
      n++;
      uname = row.username + "_" + n;
    }
    used.add(uname);
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(uname, row.id);
  }
}
const usersWithoutUsername = db.prepare("SELECT id, email FROM users WHERE username IS NULL OR username = ''").all() as { id: number; email: string }[];
const usedUsernames = new Set<string>();
for (const u of usersWithoutUsername) {
  let base = u.email.replace(/@.*/, "").replace(/[^a-z0-9]/gi, "") || "user";
  let username = base;
  let n = 0;
  while (usedUsernames.has(username)) {
    n++;
    username = base + "_" + n;
  }
  usedUsernames.add(username);
  db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, u.id);
}

// Remove authors table so there is no conflict; all author data now comes from users (creator = author).
// Disable FK checks so we can drop authors even if posts/users still have FK references to it (legacy schema).
db.prepare("PRAGMA foreign_keys = OFF").run();
db.prepare("DROP TABLE IF EXISTS authors").run();
db.prepare("PRAGMA foreign_keys = ON").run();

// Advanced settings tables
db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    project_name TEXT DEFAULT 'Lumina',
    primary_color TEXT DEFAULT '#059669',
    secondary_color TEXT DEFAULT '#10b981',
    footer_copyright TEXT DEFAULT '',
    google_analytics_script TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS legal_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    host TEXT DEFAULT '',
    port INTEGER DEFAULT 587,
    secure INTEGER DEFAULT 0,
    user TEXT DEFAULT '',
    password TEXT DEFAULT '',
    from_email TEXT DEFAULT '',
    from_name TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Seed single-row tables for settings if empty
const siteSettingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
if (siteSettingsCount.count === 0) {
  db.prepare(`
    INSERT INTO site_settings (id, project_name, primary_color, secondary_color, footer_copyright, google_analytics_script)
    VALUES (1, 'Lumina', '#059669', '#10b981', '', '')
  `).run();
}
const smtpSettingsCount = db.prepare("SELECT COUNT(*) as count FROM smtp_settings").get() as { count: number };
if (smtpSettingsCount.count === 0) {
  db.prepare(`
    INSERT INTO smtp_settings (id, host, port, secure, user, password, from_email, from_name)
    VALUES (1, '', 587, 0, '', '', '', '')
  `).run();
}
const legalSlugs = ["terms", "privacy", "cookies"];
for (const slug of legalSlugs) {
  const existing = db.prepare("SELECT 1 FROM legal_pages WHERE slug = ?").get(slug);
  if (!existing) {
    const title = slug === "terms" ? "Terms of Service" : slug === "privacy" ? "Privacy Policy" : "Cookie Policy";
    db.prepare("INSERT INTO legal_pages (slug, title, content) VALUES (?, ?, '')").run(slug, title);
  }
}

// Migration: add contact info columns to site_settings
for (const col of ["contact_email", "contact_phone", "contact_address", "contact_success_message"]) {
  const cols = db.prepare("PRAGMA table_info(site_settings)").all() as { name: string }[];
  if (!cols.some((c) => c.name === col)) {
    db.prepare(`ALTER TABLE site_settings ADD COLUMN ${col} TEXT DEFAULT ''`).run();
  }
}

// Contact form submissions
db.exec(`
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Fresh DB seed: one admin user + minimal data (one team, one category, one tag, one sample post)
const teamCount = db.prepare("SELECT COUNT(*) as count FROM teams").get() as { count: number };
if (teamCount.count === 0) {
  db.prepare("INSERT INTO teams (name, slug) VALUES (?, ?)").run("Default", "default");
  const defaultTeamId = db.prepare("SELECT id FROM teams WHERE slug = ?").get("default") as { id: number };
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(`
    INSERT INTO users (email, password_hash, name, team_id, role, username)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run("admin@lumina.com", hash, "Admin", defaultTeamId.id, "admin", "admin");
  const adminUser = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@lumina.com") as { id: number };
  db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run("General", "general");
  db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run("Blog", "blog");
  db.prepare(`
    INSERT INTO posts (title, slug, content, excerpt, featured_image, user_id, category_id, is_published, reading_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Welcome to your blog",
    "welcome",
    "# Welcome\n\nThis is your first post. Edit or delete it and start writing.",
    "Your first post.",
    "",
    adminUser.id,
    1,
    1,
    1
  );
}

const postsBaseQuery = `
  SELECT p.*, u.name as author_name, u.username as author_username, u.avatar_url as author_avatar, c.name as category_name, c.slug as category_slug
  FROM posts p
  JOIN users u ON p.user_id = u.id
  JOIN categories c ON p.category_id = c.id
  WHERE p.is_published = 1
`;

function addTagsToPosts(posts: any[]) {
  return posts.map((p) => {
    const tags = db.prepare(`
      SELECT t.id, t.name, t.slug FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `).all(p.id);
    return { ...p, tags };
  });
}

const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "") || ".jpg";
      const safe = (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, `${Date.now()}-${safe}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    cb(null, ok);
  },
});

export function createApp(options: { baseUrl?: string }) {
  const baseUrl = options.baseUrl || "http://localhost:3000";
  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  type SessionWithUser = { userId?: number; email?: string; name?: string; teamId?: number; teamName?: string; role?: "admin" | "member" };
  const sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-in-production";
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  type SessionUser = { id: number; email: string; name: string; team_id: number; team_name: string; role: "admin" | "member" };
  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const sess = req.session as SessionWithUser;
    if (sess?.userId == null) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const row = db.prepare(`
      SELECT u.id, u.email, u.name, u.team_id, u.role, t.name as team_name
      FROM users u
      JOIN teams t ON t.id = u.team_id
      WHERE u.id = ?
    `).get(sess.userId) as { id: number; email: string; name: string; team_id: number; team_name: string; role: "admin" | "member" } | undefined;
    if (!row) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found" });
    }
    (req as express.Request & { user: SessionUser }).user = {
      id: row.id,
      email: row.email,
      name: row.name,
      team_id: row.team_id,
      team_name: row.team_name,
      role: row.role,
    };
    next();
  }
  function requireRole(role: "admin" | "member") {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as express.Request & { user?: SessionUser }).user;
      if (!user || user.role !== role) return res.status(403).json({ error: "Forbidden" });
      next();
    };
  }

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = db.prepare(`
      SELECT u.id, u.email, u.name, u.team_id, u.password_hash, u.role, t.name as team_name
      FROM users u
      JOIN teams t ON t.id = u.team_id
      WHERE u.email = ?
    `).get(email) as { id: number; email: string; name: string; team_id: number; password_hash: string; role: "admin" | "member"; team_name: string } | undefined;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const sess = req.session as SessionWithUser;
    sess.userId = user.id;
    sess.email = user.email;
    sess.name = user.name;
    sess.teamId = user.team_id;
    sess.teamName = user.team_name;
    sess.role = user.role;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        team_id: user.team_id,
        team_name: user.team_name,
        role: user.role,
      },
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const sess = req.session as SessionWithUser;
    if (sess?.userId == null) return res.status(401).json({ error: "Not authenticated" });
    const row = db.prepare(`
      SELECT u.id, u.email, u.name, u.team_id, u.role, t.name as team_name
      FROM users u
      JOIN teams t ON t.id = u.team_id
      WHERE u.id = ?
    `).get(sess.userId) as { id: number; email: string; name: string; team_id: number; team_name: string; role: "admin" | "member" } | undefined;
    if (!row) return res.status(401).json({ error: "User not found" });
    res.json({
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        team_id: row.team_id,
        team_name: row.team_name,
        role: row.role,
      },
    });
  });

  app.get("/api/posts", (req, res) => {
    const { category, tag, author, q } = req.query;
    let query = postsBaseQuery;
    const params: string[] = [];
    if (category && typeof category === "string") {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (author && typeof author === "string") {
      query += ` AND u.username = ?`;
      params.push(author);
    }
    if (q && typeof q === "string" && q.trim()) {
      const term = `%${q.trim()}%`;
      query += ` AND (p.title LIKE ? OR p.excerpt LIKE ?)`;
      params.push(term, term);
    }
    query += ` ORDER BY p.published_at DESC`;
    let posts = params.length ? db.prepare(query).all(...params) : db.prepare(query).all();
    if (tag && typeof tag === "string") {
      const tagRow = db.prepare("SELECT id FROM tags WHERE slug = ?").get(tag) as { id: number } | undefined;
      if (tagRow) {
        const postIds = db.prepare("SELECT post_id FROM post_tags WHERE tag_id = ?").all(tagRow.id) as { post_id: number }[];
        const ids = new Set(postIds.map((r) => r.post_id));
        posts = (posts as any[]).filter((p) => ids.has(p.id));
      }
    }
    res.json(addTagsToPosts(posts as any[]));
  });

  app.get("/api/posts/:slug", (req, res) => {
    const post = db.prepare(`
      SELECT p.*, u.name as author_name, u.username as author_username, u.bio as author_bio, u.avatar_url as author_avatar, c.name as category_name, c.slug as category_slug
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `).get(req.params.slug);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const tags = db.prepare(`
      SELECT t.* FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `).all(post.id);
    res.json({ ...post, tags });
  });

  app.get("/api/categories", (req, res) => {
    res.json(db.prepare("SELECT * FROM categories").all());
  });
  app.post("/api/categories", (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch {
      res.status(400).json({ error: "Category already exists or invalid data" });
    }
  });
  app.delete("/api/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/tags", (req, res) => {
    res.json(db.prepare("SELECT * FROM tags").all());
  });
  app.post("/api/tags", (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch {
      res.status(400).json({ error: "Tag already exists or invalid data" });
    }
  });
  app.delete("/api/tags/:id", (req, res) => {
    db.prepare("DELETE FROM tags WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/posts", requireAuth, (req, res) => {
    res.json(db.prepare(`
      SELECT p.*, u.name as author_name, u.username as author_username, c.name as category_name
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.published_at DESC
    `).all());
  });
  app.post("/api/admin/posts", requireAuth, (req, res) => {
    const { title, slug, content, excerpt, featured_image, category_id, is_published, reading_time } = req.body;
    const user = (req as express.Request & { user: SessionUser }).user;
    try {
      const result = db.prepare(`
        INSERT INTO posts (title, slug, content, excerpt, featured_image, user_id, category_id, is_published, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, content, excerpt, featured_image, user.id, category_id, is_published ? 1 : 0, reading_time);
      res.json({ id: result.lastInsertRowid });
    } catch {
      res.status(400).json({ error: "Slug must be unique" });
    }
  });
  app.put("/api/admin/posts/:id", requireAuth, (req, res) => {
    const { title, slug, content, excerpt, featured_image, category_id, is_published, reading_time } = req.body;
    try {
      db.prepare(`
        UPDATE posts
        SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?, category_id = ?, is_published = ?, reading_time = ?
        WHERE id = ?
      `).run(title, slug, content, excerpt, featured_image, category_id, is_published ? 1 : 0, reading_time, req.params.id);
      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Update failed" });
    }
  });
  app.delete("/api/admin/posts/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: "/uploads/" + path.basename(req.file.path) });
  });

  app.get("/api/admin/teams", requireAuth, requireRole("admin"), (req, res) => {
    res.json(db.prepare("SELECT * FROM teams ORDER BY name").all());
  });
  app.post("/api/admin/teams", requireAuth, requireRole("admin"), (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Name and slug required" });
    try {
      const result = db.prepare("INSERT INTO teams (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch {
      res.status(400).json({ error: "Team slug must be unique or invalid data" });
    }
  });
  app.put("/api/admin/teams/:id", requireAuth, requireRole("admin"), (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Name and slug required" });
    try {
      db.prepare("UPDATE teams SET name = ?, slug = ? WHERE id = ?").run(name, slug, req.params.id);
      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Update failed" });
    }
  });
  app.delete("/api/admin/teams/:id", requireAuth, requireRole("admin"), (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE team_id = ?").get(id) as { count: number };
    if (userCount.count > 0) return res.status(400).json({ error: "Cannot delete team with members. Move or remove users first." });
    db.prepare("DELETE FROM teams WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/admin/users", requireAuth, requireRole("admin"), (req, res) => {
    const rows = db.prepare(`
      SELECT u.id, u.email, u.name, u.team_id, u.role, u.created_at, t.name as team_name
      FROM users u
      JOIN teams t ON t.id = u.team_id
      ORDER BY u.email
    `).all();
    res.json(rows);
  });
  app.post("/api/admin/users", requireAuth, requireRole("admin"), (req, res) => {
    const { email, password, name, team_id, role } = req.body;
    if (!email || !password || !team_id || !role) return res.status(400).json({ error: "Email, password, team_id, and role required" });
    if (role !== "admin" && role !== "member") return res.status(400).json({ error: "Role must be admin or member" });
    const password_hash = bcrypt.hashSync(password, 10);
    let username = email.replace(/@.*/, "").replace(/[^a-z0-9]/gi, "") || "user";
    if (db.prepare("SELECT 1 FROM users WHERE username = ?").get(username)) {
      username = username + "_" + Date.now();
    }
    try {
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, name, team_id, role, username)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(email, password_hash, name || null, team_id, role, username);
      res.json({ id: result.lastInsertRowid });
    } catch {
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });
  app.put("/api/admin/users/:id", requireAuth, requireRole("admin"), (req, res) => {
    const { name, team_id, role, password } = req.body;
    const id = parseInt(req.params.id, 10);
    if (role !== undefined && role !== "admin" && role !== "member") return res.status(400).json({ error: "Role must be admin or member" });
    const existing = db.prepare("SELECT name, team_id, role FROM users WHERE id = ?").get(id) as { name: string; team_id: number; role: string } | undefined;
    if (!existing) return res.status(404).json({ error: "User not found" });
    const newName = name !== undefined ? name : existing.name;
    const newTeamId = team_id !== undefined ? team_id : existing.team_id;
    const newRole = role !== undefined ? role : existing.role;
    try {
      if (password) {
        const password_hash = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE users SET name = ?, team_id = ?, role = ?, password_hash = ? WHERE id = ?").run(newName, newTeamId, newRole, password_hash, id);
      } else {
        db.prepare("UPDATE users SET name = ?, team_id = ?, role = ? WHERE id = ?").run(newName, newTeamId, newRole, id);
      }
      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Update failed" });
    }
  });
  app.delete("/api/admin/users/:id", requireAuth, requireRole("admin"), (req, res) => {
    const id = parseInt(req.params.id, 10);
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    const target = db.prepare("SELECT role FROM users WHERE id = ?").get(id) as { role: string } | undefined;
    if (adminCount.count <= 1 && target?.role === "admin") return res.status(400).json({ error: "Cannot delete the last admin" });
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Public site settings (no auth)
  app.get("/api/site-settings", (req, res) => {
    const site = db.prepare("SELECT project_name, primary_color, secondary_color, footer_copyright, google_analytics_script, contact_email, contact_phone, contact_address, contact_success_message FROM site_settings WHERE id = 1").get() as {
      project_name: string;
      primary_color: string;
      secondary_color: string;
      footer_copyright: string;
      google_analytics_script: string;
      contact_email: string | null;
      contact_phone: string | null;
      contact_address: string | null;
      contact_success_message: string | null;
    } | undefined;
    const social = db.prepare("SELECT platform, url FROM social_links ORDER BY sort_order, id").all() as { platform: string; url: string }[];
    const legal = db.prepare("SELECT slug, title FROM legal_pages ORDER BY slug").all() as { slug: string; title: string }[];
    res.json({
      projectName: site?.project_name ?? "Lumina",
      primaryColor: site?.primary_color ?? "#059669",
      secondaryColor: site?.secondary_color ?? "#10b981",
      footerCopyright: site?.footer_copyright ?? "",
      googleAnalyticsScript: site?.google_analytics_script ?? "",
      contactEmail: site?.contact_email ?? "",
      contactPhone: site?.contact_phone ?? "",
      contactAddress: site?.contact_address ?? "",
      contactSuccessMessage: site?.contact_success_message ?? "Thanks for reaching out. We'll get back to you soon.",
      socialLinks: social.map((r) => ({ platform: r.platform, url: r.url })),
      legalPages: legal.map((r) => ({ slug: r.slug, title: r.title, path: `/legal/${r.slug}` })),
    });
  });

  // Public contact form submit
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body || {};
    const n = typeof name === "string" ? name.trim() : "";
    const e = typeof email === "string" ? email.trim() : "";
    const m = typeof message === "string" ? message.trim() : "";
    if (!n || !e || !m) return res.status(400).json({ error: "Name, email, and message are required." });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e)) return res.status(400).json({ error: "Invalid email address." });
    db.prepare("INSERT INTO contact_requests (name, email, message) VALUES (?, ?, ?)").run(n, e, m);
    res.json({ success: true });
  });

  app.get("/api/legal/:slug", (req, res) => {
    const page = db.prepare("SELECT slug, title, content FROM legal_pages WHERE slug = ?").get(req.params.slug) as { slug: string; title: string; content: string } | undefined;
    if (!page) return res.status(404).json({ error: "Not found" });
    res.json({ slug: page.slug, title: page.title, content: page.content });
  });

  // Admin settings (require admin)
  app.get("/api/admin/settings", requireAuth, requireRole("admin"), (req, res) => {
    const site = db.prepare("SELECT * FROM site_settings WHERE id = 1").get() as Record<string, unknown> | undefined;
    const social = db.prepare("SELECT * FROM social_links ORDER BY sort_order, id").all();
    const legal = db.prepare("SELECT * FROM legal_pages ORDER BY slug").all();
    const smtp = db.prepare("SELECT id, host, port, secure, user, from_email, from_name, updated_at FROM smtp_settings WHERE id = 1").get() as Record<string, unknown> | undefined;
    const smtpWithMask = smtp ? { ...smtp, password: smtp.password ? "********" : "" } : null;
    res.json({
      site: site ?? null,
      social,
      legal,
      smtp: smtpWithMask,
    });
  });

  app.put("/api/admin/settings/site", requireAuth, requireRole("admin"), (req, res) => {
    const { projectName, primaryColor, secondaryColor, footerCopyright, googleAnalyticsScript, contactEmail, contactPhone, contactAddress, contactSuccessMessage } = req.body || {};
    db.prepare(`
      UPDATE site_settings SET
        project_name = COALESCE(?, project_name),
        primary_color = COALESCE(?, primary_color),
        secondary_color = COALESCE(?, secondary_color),
        footer_copyright = COALESCE(?, footer_copyright),
        google_analytics_script = COALESCE(?, google_analytics_script),
        contact_email = COALESCE(?, contact_email),
        contact_phone = COALESCE(?, contact_phone),
        contact_address = COALESCE(?, contact_address),
        contact_success_message = COALESCE(?, contact_success_message),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      projectName ?? null,
      primaryColor ?? null,
      secondaryColor ?? null,
      footerCopyright ?? null,
      googleAnalyticsScript ?? null,
      contactEmail ?? null,
      contactPhone ?? null,
      contactAddress ?? null,
      contactSuccessMessage ?? null
    );
    res.json({ success: true });
  });

  app.get("/api/admin/contact-requests", requireAuth, requireRole("admin"), (req, res) => {
    const rows = db.prepare("SELECT id, name, email, message, read, created_at FROM contact_requests ORDER BY created_at DESC").all() as {
      id: number;
      name: string;
      email: string;
      message: string;
      read: number;
      created_at: string;
    }[];
    res.json(rows.map((r) => ({ id: r.id, name: r.name, email: r.email, message: r.message, read: r.read === 1, createdAt: r.created_at })));
  });

  app.get("/api/admin/settings/social", requireAuth, requireRole("admin"), (req, res) => {
    res.json(db.prepare("SELECT * FROM social_links ORDER BY sort_order, id").all());
  });

  app.put("/api/admin/settings/social", requireAuth, requireRole("admin"), (req, res) => {
    const { links } = req.body || {};
    if (!Array.isArray(links)) return res.status(400).json({ error: "links array required" });
    db.prepare("DELETE FROM social_links").run();
    const insert = db.prepare("INSERT INTO social_links (platform, url, sort_order) VALUES (?, ?, ?)");
    links.forEach((item: { platform?: string; url?: string; sortOrder?: number }, i: number) => {
      const platform = (item.platform || "").trim();
      const url = (item.url || "").trim();
      if (platform && url) insert.run(platform, url, item.sortOrder ?? i);
    });
    res.json({ success: true });
  });

  app.get("/api/admin/settings/legal", requireAuth, requireRole("admin"), (req, res) => {
    res.json(db.prepare("SELECT * FROM legal_pages ORDER BY slug").all());
  });

  app.put("/api/admin/settings/legal", requireAuth, requireRole("admin"), (req, res) => {
    const { pages } = req.body || {};
    if (!Array.isArray(pages)) return res.status(400).json({ error: "pages array required" });
    for (const p of pages) {
      const slug = (p.slug || "").trim();
      const title = (p.title || "").trim();
      const content = p.content ?? "";
      if (!slug) continue;
      const existing = db.prepare("SELECT id FROM legal_pages WHERE slug = ?").get(slug);
      if (existing) {
        db.prepare("UPDATE legal_pages SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?").run(title, content, slug);
      } else {
        db.prepare("INSERT INTO legal_pages (slug, title, content) VALUES (?, ?, ?)").run(slug, title, content);
      }
    }
    res.json({ success: true });
  });

  app.get("/api/admin/settings/smtp", requireAuth, requireRole("admin"), (req, res) => {
    const row = db.prepare("SELECT id, host, port, secure, user, from_email, from_name, updated_at FROM smtp_settings WHERE id = 1").get();
    res.json(row ? { ...row, password: "********" } : null);
  });

  app.put("/api/admin/settings/smtp", requireAuth, requireRole("admin"), (req, res) => {
    const { host, port, secure, user, password, from_email, from_name } = req.body || {};
    const existing = db.prepare("SELECT id FROM smtp_settings WHERE id = 1").get();
    if (existing) {
      if (password === "********" || password === undefined || password === null) {
        db.prepare(`
          UPDATE smtp_settings SET host = ?, port = ?, secure = ?, user = ?, from_email = ?, from_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1
        `).run(host ?? "", port ?? 587, secure ? 1 : 0, user ?? "", from_email ?? "", from_name ?? "");
      } else {
        db.prepare(`
          UPDATE smtp_settings SET host = ?, port = ?, secure = ?, user = ?, password = ?, from_email = ?, from_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1
        `).run(host ?? "", port ?? 587, secure ? 1 : 0, user ?? "", password ?? "", from_email ?? "", from_name ?? "");
      }
    } else {
      db.prepare(`
        INSERT INTO smtp_settings (id, host, port, secure, user, password, from_email, from_name) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `).run(host ?? "", port ?? 587, secure ? 1 : 0, user ?? "", password ?? "", from_email ?? "", from_name ?? "");
    }
    res.json({ success: true });
  });

  app.post("/api/admin/settings/smtp/test", requireAuth, requireRole("admin"), async (req, res) => {
    const user = (req as express.Request & { user: SessionUser }).user;
    const { to } = req.body || {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const toAddress = typeof to === "string" && to.trim() ? to.trim() : "";
    const sendTo = toAddress && emailRegex.test(toAddress) ? toAddress : user.email;
    const smtp = db.prepare("SELECT * FROM smtp_settings WHERE id = 1").get() as {
      host: string;
      port: number;
      secure: number;
      user: string;
      password: string;
      from_email: string;
      from_name: string;
    } | undefined;
    if (!smtp || !smtp.host || !smtp.user) {
      return res.status(400).json({ error: "SMTP not configured. Set host and user first." });
    }
    try {
      const port = Number(smtp.port) || 587;
      // Port 465 = implicit SSL; 587/25 = plain then STARTTLS. Using secure:true on 587 causes "wrong version number".
      const useSecure = port === 465 || (smtp.secure === 1 && port === 465);
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port,
        secure: useSecure,
        auth: { user: smtp.user, pass: smtp.password || "" },
      });
      await transporter.sendMail({
        from: smtp.from_email ? `"${(smtp.from_name || "").replace(/"/g, "")}" <${smtp.from_email}>` : smtp.user,
        to: sendTo,
        subject: "Test email from your blog",
        text: "This is a test email. SMTP is working.",
      });
      res.json({ success: true, message: "Test email sent to " + sendTo });
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : "Failed to send test email";
      if (message.includes("535") || message.toLowerCase().includes("authentication failed")) {
        message += " Check username and password. For Gmail, use an App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal password.";
      }
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/posts/:slug/related", (req, res) => {
    const post = db.prepare("SELECT id, category_id FROM posts WHERE slug = ? AND is_published = 1").get(req.params.slug) as { id: number; category_id: number } | undefined;
    if (!post) return res.status(404).json({ error: "Post not found" });
    const related = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, c.name as category_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1 AND p.category_id = ? AND p.id != ?
      ORDER BY p.published_at DESC
      LIMIT 3
    `).all(post.category_id, post.id);
    res.json(related);
  });

  app.get("/api/categories/:slug", (req, res) => {
    const cat = db.prepare("SELECT * FROM categories WHERE slug = ?").get(req.params.slug) as { id: number; name: string; slug: string } | undefined;
    if (!cat) return res.status(404).json({ error: "Category not found" });
    const count = db.prepare("SELECT COUNT(*) as count FROM posts WHERE category_id = ? AND is_published = 1").get(cat.id) as { count: number };
    res.json({ ...cat, postCount: count.count });
  });
  app.get("/api/tags/:slug", (req, res) => {
    const tag = db.prepare("SELECT * FROM tags WHERE slug = ?").get(req.params.slug) as { id: number; name: string; slug: string } | undefined;
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    const count = db.prepare(`
      SELECT COUNT(*) as count FROM post_tags pt
      JOIN posts p ON p.id = pt.post_id AND p.is_published = 1
      WHERE pt.tag_id = ?
    `).get(tag.id) as { count: number };
    res.json({ ...tag, postCount: count.count });
  });
  app.get("/api/authors/:username", (req, res) => {
    const user = db.prepare("SELECT id, username, name, bio, avatar_url FROM users WHERE username = ?").get(req.params.username) as { id: number; username: string; name: string; bio: string; avatar_url: string } | undefined;
    if (!user) return res.status(404).json({ error: "Author not found" });
    const posts = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, c.name as category_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.user_id = ? AND p.is_published = 1
      ORDER BY p.published_at DESC
    `).all(user.id);
    res.json({ ...user, posts });
  });

  function sendSitemap(_req: express.Request, res: express.Response) {
    const posts = db.prepare("SELECT slug, published_at FROM posts WHERE is_published = 1 ORDER BY published_at DESC").all() as { slug: string; published_at: string }[];
    const categories = db.prepare("SELECT slug FROM categories").all() as { slug: string }[];
    const tags = db.prepare("SELECT slug FROM tags").all() as { slug: string }[];
    const legalPages = db.prepare("SELECT slug, updated_at FROM legal_pages ORDER BY slug").all() as { slug: string; updated_at: string }[];
    res.type("application/xml");
    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    xml += `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1</priority></url>`;
    xml += `<url><loc>${baseUrl}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`;
    xml += `<url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`;
    xml += `<url><loc>${baseUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`;
    posts.forEach((p) => {
      xml += `<url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${new Date(p.published_at).toISOString().slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    });
    categories.forEach((c) => {
      xml += `<url><loc>${baseUrl}/category/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });
    tags.forEach((t) => {
      xml += `<url><loc>${baseUrl}/tag/${t.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
    });
    legalPages.forEach((lp) => {
      const lastmod = lp.updated_at ? new Date(lp.updated_at).toISOString().slice(0, 10) : "";
      xml += `<url><loc>${baseUrl}/legal/${lp.slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.4</priority></url>`;
    });
    xml += "</urlset>";
    res.send(xml);
  }
  app.get("/api/sitemap.xml", sendSitemap);
  app.get("/sitemap.xml", sendSitemap);

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  app.get("/api/stats", (req, res) => {
    const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
    const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
    const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get() as { count: number };
    res.json({ posts: postCount.count, categories: categoryCount.count, tags: tagCount.count });
  });

  function serveIndex(_req: express.Request, res: express.Response) {
    const htmlPath = path.join(__dirname, "dist", "index.html");
    try {
      let html = fs.readFileSync(htmlPath, "utf-8");
      const row = db.prepare("SELECT google_analytics_script FROM site_settings WHERE id = 1").get() as { google_analytics_script: string } | undefined;
      const ga = row?.google_analytics_script?.trim();
      if (ga) {
        html = html.replace("</head>", ga + "\n</head>");
      }
      res.type("text/html").send(html);
    } catch {
      res.status(404).send("Not found");
    }
  }

  return { app, __dirname, serveIndex };
}
