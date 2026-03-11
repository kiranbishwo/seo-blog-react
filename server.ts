import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("blog.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    bio TEXT,
    avatar_url TEXT
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
    author_id INTEGER,
    category_id INTEGER,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_published INTEGER DEFAULT 0,
    reading_time INTEGER,
    FOREIGN KEY (author_id) REFERENCES authors(id),
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

// Seed some data if empty
const authorCount = db.prepare("SELECT COUNT(*) as count FROM authors").get() as { count: number };
if (authorCount.count === 0) {
  db.prepare("INSERT INTO authors (username, name, bio, avatar_url) VALUES (?, ?, ?, ?)").run(
    "johndoe",
    "John Doe",
    "Senior Software Architect and Tech Writer.",
    "https://picsum.photos/seed/john/200/200"
  );
  db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run("Technology", "technology");
  db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run("Design", "design");
  db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run("React", "react");
  db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run("SEO", "seo");

  db.prepare(`
    INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, category_id, is_published, reading_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Building SEO-Friendly React Apps",
    "building-seo-friendly-react-apps",
    "# Introduction\n\nSEO is crucial for any blog. In this article, we'll explore how to build SEO-friendly apps using React.\n\n## Why SEO Matters\n\nSearch engines need to crawl your content effectively...\n\n### Metadata\n\nUsing tools like React Helmet helps manage your head tags.",
    "Learn the best practices for building high-performance, SEO-optimized React applications.",
    "https://picsum.photos/seed/seo/1200/630",
    1,
    1,
    1,
    5
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare(`
      SELECT p.*, a.name as author_name, a.avatar_url as author_avatar, c.name as category_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1
      ORDER BY p.published_at DESC
    `).all();
    res.json(posts);
  });

  app.get("/api/posts/:slug", (req, res) => {
    const post = db.prepare(`
      SELECT p.*, a.name as author_name, a.username as author_username, a.bio as author_bio, a.avatar_url as author_avatar, c.name as category_name, c.slug as category_slug
      FROM posts p
      JOIN authors a ON p.author_id = a.id
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
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch (error) {
      res.status(400).json({ error: "Category already exists or invalid data" });
    }
  });

  app.delete("/api/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/tags", (req, res) => {
    const tags = db.prepare("SELECT * FROM tags").all();
    res.json(tags);
  });

  app.post("/api/tags", (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch (error) {
      res.status(400).json({ error: "Tag already exists or invalid data" });
    }
  });

  app.delete("/api/tags/:id", (req, res) => {
    db.prepare("DELETE FROM tags WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin Post Management
  app.get("/api/admin/posts", (req, res) => {
    const posts = db.prepare(`
      SELECT p.*, a.name as author_name, c.name as category_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.published_at DESC
    `).all();
    res.json(posts);
  });

  app.post("/api/admin/posts", (req, res) => {
    const { title, slug, content, excerpt, featured_image, category_id, is_published, reading_time } = req.body;
    const author_id = 1; // Default for now
    try {
      const result = db.prepare(`
        INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, category_id, is_published, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, content, excerpt, featured_image, author_id, category_id, is_published ? 1 : 0, reading_time);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: "Slug must be unique" });
    }
  });

  app.put("/api/admin/posts/:id", (req, res) => {
    const { title, slug, content, excerpt, featured_image, category_id, is_published, reading_time } = req.body;
    try {
      db.prepare(`
        UPDATE posts 
        SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?, category_id = ?, is_published = ?, reading_time = ?
        WHERE id = ?
      `).run(title, slug, content, excerpt, featured_image, category_id, is_published ? 1 : 0, reading_time, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Update failed" });
    }
  });

  app.delete("/api/admin/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as any;
    const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as any;
    const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get() as any;
    res.json({
      posts: postCount.count,
      categories: categoryCount.count,
      tags: tagCount.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
