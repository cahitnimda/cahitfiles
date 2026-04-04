# Cahit Trading & Contracting — CRM Admin Dashboard

## Files

| File | Description | Lines |
|------|-------------|-------|
| `login.php` | Login page (HTML, rendered by Node server as static HTML) | 151 |
| `index.php` | Admin dashboard shell (sidebar, top bar, layout) | 120 |
| `admin.css` | All dashboard styling | 222 |
| `admin.js` | Full dashboard logic — all sections, API calls, content editor, blog manager, AI assistant, drag & drop, chatbot knowledge, settings, media, leads, analytics | 2,284 |
| `preview-server.cjs` | Node.js/Express backend — serves PHP templates as HTML, all `/admin/api/*` endpoints, chatbot, auth, file uploads, blog CRUD, OpenAI integration | 1,291 |

## Total: ~4,070 lines

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS (no React, no framework)
- **Backend**: Node.js + Express (preview-server.cjs)
- **Database**: PostgreSQL (Neon) — tables: `site_settings`, `chatbot_knowledge`, `leads`, `blog_posts`
- **Auth**: JWT tokens, bcrypt password hashing
- **AI**: OpenAI GPT-4o for blog generation + DALL-E 3 for cover images

## Admin Sections

1. **Dashboard** — stats overview (leads, blog posts, pages)
2. **Content Editor** — live preview iframe + editable fields for all site sections
3. **Blog Manager** — full CRUD + AI blog assistant (generate titles, posts, outlines, excerpts, SEO, translate, improve, generate cover images)
4. **Leads** — contact form submissions, status management
5. **Media Library** — file uploads, drag & drop
6. **Chatbot Knowledge** — custom knowledge entries, personality, language/position settings, test chat
7. **Analytics** — traffic stats, top pages, traffic sources
8. **Settings** — site info, toggles (Arabic, funnel, chatbot, blog), credentials, SEO meta, OpenAI API key

## Credentials

- URL: `/admin` (login at `/admin/login`)
- Default: username `admin`, password stored in database (bcrypt hashed)

## How to Run

```bash
npm install express pg bcryptjs jsonwebtoken multer
node preview-server.cjs
```

Server runs on port 5000. Visit `http://localhost:5000/admin`
