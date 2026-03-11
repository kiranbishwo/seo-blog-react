Act as a senior frontend architect and build a professional, SEO-friendly blog frontend.

Tech Stack
- React with Next.js (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI components
- SEO optimized architecture
- Fully responsive design
- Clean and minimal startup-style UI

Project Goal
Build a fast, SEO-friendly blog platform frontend similar to Medium but simplified for a startup blog. The platform is mainly for publishing blog articles with strong SEO optimization.

Core Pages
1. Home page
   - Hero section
   - Latest blog posts
   - Popular posts
   - Categories section
   - Newsletter subscribe section

2. Blog Listing Page (/blog)
   - Blog card grid layout
   - Pagination or infinite scroll
   - Filter by category
   - Filter by tags
   - Search blog posts

3. Blog Detail Page (/blog/[slug])
   - SEO optimized article layout
   - Featured image
   - Author section
   - Reading time indicator
   - Table of contents auto generated from headings
   - Social share buttons
   - Related posts
   - Reading progress bar
   - Code syntax highlighting
   - Image optimization
   - Clean typography for long reading

4. Category Page (/category/[slug])

5. Tag Page (/tag/[slug])

6. Author Page (/author/[username])

7. Search Page

8. About page

9. Contact page

Admin Pages
- Admin login page
- Admin dashboard
- Create blog post
- Edit blog post
- Draft / Publish toggle
- Manage categories
- Manage tags
- Media upload

SEO Requirements
- Dynamic SEO meta tags
- Meta title and meta description
- OpenGraph tags
- Twitter card metadata
- Structured data JSON-LD for BlogPosting
- Automatic sitemap generation
- robots.txt
- Canonical URLs
- SEO friendly slug URLs
- Image alt text support
- Clean semantic HTML

Performance Optimization
- Static site generation (SSG)
- Image lazy loading
- Next.js image optimization
- Code splitting
- Fast page loading

Content Features
- Markdown or rich text rendering
- Code block syntax highlighting
- Table of contents auto generation
- Reading time calculation
- Related articles algorithm
- Share buttons (Twitter, LinkedIn, Facebook)

UI Design Requirements
- Minimal and professional
- Medium style typography
- Clean whitespace
- Mobile-first design
- Dark mode / light mode
- Smooth animations
- Accessible UI

Project Structure
Create a clean scalable folder structure including:
- components
- layouts
- pages/app
- lib
- hooks
- utils
- types

Also include reusable components:
- BlogCard
- ArticleLayout
- CategoryBadge
- TagBadge
- AuthorBox
- ShareButtons
- TableOfContents
- ReadingProgressBar

Output
Provide complete React component structure and code examples for major pages and components with best practices.