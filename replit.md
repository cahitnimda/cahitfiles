# Cahit Contracting Website

## Overview
Corporate website for Cahit Trading & Contracting LLC, a marine & coastal construction company based in Oman. Built as a fully WordPress-compliant theme with a Node.js preview server for Replit.

## Architecture
- **WordPress Theme**: Located at `wp-theme/cahit-theme/`
- **Preview Server**: `preview-server.cjs` (Node.js/Express) renders PHP templates as HTML for preview
- **Database**: PostgreSQL available
- **AI Integration**: OpenAI via Replit AI Integrations

## WordPress Theme Structure

### Core Template Files
- `style.css` - Theme metadata (name, version, text domain, license)
- `functions.php` - Theme setup, enqueuing, CPTs, AJAX handlers, Customizer, admin menus, meta boxes
- `header.php` - HTML head, navbar, contact popup, quote modal, wp_body_open()
- `footer.php` - Footer with dynamic year, Customizer values, wp_login_url()
- `index.php` - Required WP fallback template
- `front-page.php` - Home page (10 sections)
- `page.php` - Generic page template with WordPress Loop
- `single.php` - Single post template with featured image, comments, post navigation
- `archive.php` - Archive template with Loop + pagination
- `search.php` - Search results template
- `404.php` - Not found page
- `comments.php` - Comments template with wp_list_comments + comment_form
- `sidebar.php` - Widget area sidebar

### Page Templates
- `page-about.php` - About Us (overview, leadership, mission/vision, commitment, clients)
- `page-services.php` - Services (5 service cards)
- `page-projects.php` - Projects (6 project cards with category badges)
- `page-clients.php` - Clients (logo grid)
- `page-blog.php` - Blog (WordPress Loop with WP_Query, fallback static cards)
- `page-careers.php` - Careers (value proposition cards)

### Assets
- `assets/css/theme.css` - All styling
- `assets/js/theme.js` - Main JS (menu, counters, videos, modals, lang toggle, lead funnel)
- `assets/js/chatbot.js` - Floating chat widget
- `assets/videos/tahir.mp4` - Leadership video
- `assets/videos/pasha.mp4` - Leadership video

### Admin Panel (Fully Functional CRM at `/admin`)
- `admin/index.php` - Dashboard (PHP with WordPress auth guards)
- `admin/login.php` - Login page (PHP with WordPress redirect guards)
- `admin/admin.css` - Admin styles
- `admin/admin.js` - Admin logic with full DB persistence:
  - **Dashboard**: Dynamic stats (pages, leads with new count, blog posts, media files)
  - **Pages**: Page list with edit links → Content Editor
  - **Content Editor**: Section-based editing with live preview iframe, saves/loads per-section to DB via `/admin/api/site-content/:section`
  - **Media Library**: File uploads via `/admin/api/upload`, shows server files, copy URL buttons
  - **Blog Posts**: Full CRUD via `/admin/api/blog-posts`, EN/AR fields, create/edit/delete
  - **Leads & Contacts**: Lists DB leads, status toggle (new/contacted) via `/admin/api/leads/:id/status`, shows details
  - **Analytics**: Static display (placeholder)
  - **Chatbot Knowledge**: Knowledge entries CRUD, personality, language, position, test chat, API key, export for Vercel
  - **Settings**: General (site name, URL, email, phone), toggles (Arabic, funnel, chatbot, blog), credentials change, SEO (meta title/desc), OpenAI API key — all persisted to DB

### Admin API Endpoints
- `POST /admin/api/login` — authenticate (credentials stored in DB `site_settings`)
- `GET/PUT /admin/api/site-content/:key` — load/save section content and settings
- `GET/POST/PATCH/DELETE /admin/api/blog-posts` — blog CRUD
- `GET/POST /admin/api/leads` — lead listing and submission
- `POST /admin/api/leads/:id/status` — update lead status
- `POST /admin/api/upload` — file upload (multipart)
- `GET /admin/api/uploads` — list uploaded files
- `GET/POST /admin/api/chatbot-knowledge` — chatbot knowledge base
- `POST /admin/api/save-openai-key` — save OpenAI API key
- `POST /admin/api/change-credentials` — update admin username/password

### DB Tables
- `site_settings` — key/value store for all settings, content, credentials
- `chatbot_knowledge` — chatbot knowledge entries
- `leads` — contact form and funnel submissions
- `blog_posts` — blog articles (EN/AR, slug, excerpt, content, image, status)

### WordPress Features Used
- `add_theme_support`: title-tag, post-thumbnails, html5, custom-logo, custom-background, editor-styles, responsive-embeds, wp-block-styles, customize-selective-refresh-widgets
- `register_nav_menus`: primary, footer, services
- `register_post_type`: project, service, lead (with custom taxonomies)
- `add_meta_box`: Lead details meta box with email, phone, service, status, budget
- `customize_register`: Company info, social media, footer settings in Customizer
- `admin_menu`: Cahit CRM page in WP admin with lead/project/service counts
- `wp_localize_script`: cahitData (ajaxUrl, themeUrl, nonce, homeUrl)
- `wp_ajax_*`: cahit_submit_lead, cahit_submit_quote, cahit_chat
- Custom lead columns in WP admin with color-coded status badges
- `add_image_size`: cahit-card (600x400), cahit-hero (1920x800)
- Text domain: `cahit-theme` (languages directory at `languages/`)
- i18n: All user-facing strings wrapped in `__()`, `_e()`, `esc_html_e()`, `esc_html__()`

## CRM Admin Dashboard
- Served at `/admin` by the preview server
- Login: admin / cahit2024 (or admin@cahitcontracting.com)
- **Dashboard**: Stats overview (pages, leads, media, languages), recent activity, quick actions
- **Pages**: Grid view of all 7 site pages with edit/view links
- **Content Editor**: 3-column layout (section list, editing fields with upload, live preview with viewport switcher)
- **Drag Mode**: Toggle to enable drag-and-drop repositioning of elements with alignment guides
- **Media Library**: Drag & drop upload, media grid with thumbnails
- **Leads & Contacts**: Table of lead submissions from site forms and funnel
- **Analytics**: Traffic stats, monthly chart, top pages, traffic sources
- **Settings**: Site info, language toggles, feature toggles, SEO meta
- **Funnel Toggle**: Enable/disable lead qualification funnel in preview
- Backend API: `/admin/api/login`, `/admin/api/verify`, `/admin/api/logout`, `/admin/api/leads`, `/admin/api/pages`, `/admin/api/upload`, `/admin/api/uploads`

## Navigation
Home, About Us, Services, Projects, Clients, Blog, Careers, Contact (popup)

## Language Support
- EN/AR toggle in navbar
- Arabic RTL support via CSS `html[dir="rtl"]` rules
- Client-side translation via `switchLang('ar')` / `switchLang('en')`
- Arabic text stored in `arTranslations` map in theme.js
- Noto Sans Arabic font loaded from Google Fonts
- Language preference saved in localStorage

## Preview Server
- `preview-server.cjs` (CommonJS, port 5000)
- Reads PHP templates, processes WordPress function calls into HTML
- Handles WP Loop/conditional blocks for blog, archive, single, search templates
- Routes: `/`, `/about`, `/services`, `/projects`, `/clients`, `/blog`, `/careers`, `/404`
- 404 catch-all for unknown routes
- Serves static assets and uploaded media
- Handles AJAX for chatbot and quote form

## Key Features
- Hero section with video background and animated counters
- Progressive lead qualification funnel (3-step floating panels)
- Client logos carousel with auto-scroll
- 5 service cards (Marine, Infrastructure, Earthworks, Dewatering, MEP)
- 6 project cards with category badges
- Leadership section with hover-to-play video bios
- Marine specialists capabilities pills
- Quote request form via modal
- Floating chatbot widget
- Contact popup with phone, email, WhatsApp, address
- Blog with WordPress Loop (WP_Query + fallback)
- Full Arabic RTL support

## Media CDN
All images served from: `https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/`

## Contact Info
- Phone: +968 2411 2406 Ext 101
- Mobile/WhatsApp: +968 9096 6562
- Email: ctc@cahitcontracting.com
- Address: Khaleej Tower, 6th Floor No. 603, Ghala, Muscat, Sultanate of Oman

## Design
- Colors: Sky-500 (#0ea5e9), Sky-600 (#0284c7), Navy (#0A3D6B), Slate-900 (#0f172a)
- Fonts: Sora + Inter (EN), Noto Sans Arabic (AR)
- Light theme, corporate/professional look
- Ocean-blue accents reflecting marine expertise
