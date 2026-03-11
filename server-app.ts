/**
 * Shared Express app with all API routes. Used by server.ts (full app with Vite/static)
 * and server-api.ts (API-only for dev with Vite CLI + proxy).
 */
import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("blog.db");

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

const postsBaseQuery = `
  SELECT p.*, a.name as author_name, a.username as author_username, a.avatar_url as author_avatar, c.name as category_name, c.slug as category_slug
  FROM posts p
  JOIN authors a ON p.author_id = a.id
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

export function createApp(options: { baseUrl?: string }) {
  const baseUrl = options.baseUrl || "http://localhost:3000";
  const app = express();
  app.use(express.json());

  app.get("/api/posts", (req, res) => {
    const { category, tag, author } = req.query;
    let query = postsBaseQuery;
    const params: string[] = [];
    if (category && typeof category === "string") {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (author && typeof author === "string") {
      query += ` AND a.username = ?`;
      params.push(author);
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

  app.get("/api/admin/posts", (req, res) => {
    res.json(db.prepare(`
      SELECT p.*, a.name as author_name, c.name as category_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.published_at DESC
    `).all());
  });
  app.post("/api/admin/posts", (req, res) => {
    const { title, slug, content, excerpt, featured_image, category_id, is_published, reading_time } = req.body;
    const author_id = 1;
    try {
      const result = db.prepare(`
        INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, category_id, is_published, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, content, excerpt, featured_image, author_id, category_id, is_published ? 1 : 0, reading_time);
      res.json({ id: result.lastInsertRowid });
    } catch {
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
    } catch {
      res.status(400).json({ error: "Update failed" });
    }
  });
  app.delete("/api/admin/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/posts/:slug/related", (req, res) => {
    const post = db.prepare("SELECT id, category_id FROM posts WHERE slug = ? AND is_published = 1").get(req.params.slug) as { id: number; category_id: number } | undefined;
    if (!post) return res.status(404).json({ error: "Post not found" });
    const related = db.prepare(`
      SELECT p.*, a.name as author_name, a.avatar_url as author_avatar, c.name as category_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
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
    const author = db.prepare("SELECT * FROM authors WHERE username = ?").get(req.params.username) as { id: number; username: string; name: string; bio: string; avatar_url: string } | undefined;
    if (!author) return res.status(404).json({ error: "Author not found" });
    const posts = db.prepare(`
      SELECT p.*, a.name as author_name, a.avatar_url as author_avatar, c.name as category_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.author_id = ? AND p.is_published = 1
      ORDER BY p.published_at DESC
    `).all(author.id);
    res.json({ ...author, posts });
  });

  function sendSitemap(_req: express.Request, res: express.Response) {
    const posts = db.prepare("SELECT slug, published_at FROM posts WHERE is_published = 1 ORDER BY published_at DESC").all() as { slug: string; published_at: string }[];
    const categories = db.prepare("SELECT slug FROM categories").all() as { slug: string }[];
    const tags = db.prepare("SELECT slug FROM tags").all() as { slug: string }[];
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

  return { app, __dirname };
}
