# Cahit Admin Dashboard - Complete Guide
## Features, Functionality & Instructions

**URL:** `/admin` (e.g., https://www.cahitcontracting.com/admin)
**Login:** Username & password stored in database (changeable from Settings)

---

## Table of Contents

1. [Dashboard (Home)](#1-dashboard-home)
2. [Pages Manager](#2-pages-manager)
3. [Content Editor (Live Visual Editor)](#3-content-editor-live-visual-editor)
4. [How to Add "Read More" Containers & Detail Pages](#4-how-to-add-read-more-containers--detail-pages)
5. [Blog Posts & AI Blog Assistant](#5-blog-posts--ai-blog-assistant)
6. [Media Library](#6-media-library)
7. [Leads & Contacts (CRM)](#7-leads--contacts-crm)
8. [Analytics](#8-analytics)
9. [Chatbot Knowledge Base](#9-chatbot-knowledge-base)
10. [Settings](#10-settings)

---

## 1. Dashboard (Home)

### What It Does
The main landing page after login. Gives you a quick overview of your entire site at a glance.

### Features
- **Stats Cards:** Four cards showing:
  - Total Pages (number of site pages)
  - Leads (total contact submissions, with badge showing new/unread count)
  - Blog Posts (total published articles)
  - Media Files (total uploaded images and videos)
- **Recent Activity Timeline:** Shows the latest site updates and changes made
- **Quick Actions:** One-click buttons to jump to:
  - Edit Page Content
  - Manage Media
  - View Leads
  - Preview Site (opens the live site)

### How to Use
1. Log in at `/admin`
2. The Dashboard loads automatically
3. Click any stat card or quick action button to navigate to that section

---

## 2. Pages Manager

### What It Does
Lists all pages on the website with their status and lets you jump directly to editing any page.

### Features
- **Page List:** Shows all 7 site pages:
  - Home (`/`)
  - About Us (`/about`)
  - Services (`/services`)
  - Projects (`/projects`)
  - Clients (`/clients`)
  - Blog (`/blog`)
  - Careers (`/careers`)
- **Page Info:** Each page shows its URL path, template file name, and publish status
- **Actions per page:**
  - **Edit Content** - Opens the Content Editor with that page pre-selected
  - **View** - Opens the live page in a new tab

### How to Use
1. Click **Pages** in the left sidebar
2. Find the page you want to edit
3. Click **Edit Content** to open the visual editor, or **View** to see the live page

---

## 3. Content Editor (Live Visual Editor)

### What It Does
The most powerful section of the admin. Lets you edit any text, image, or video on any page with a **live preview** showing changes in real time.

### Features

#### Page Selector (Top Dropdown)
- Choose which page to edit: Home, About Us, Services, Projects, Clients, Blog, or Careers
- Switching pages loads that page in the preview and shows its editable sections

#### Section Panel (Left Sidebar)
- Each page is broken into editable sections (grouped by "Global" and "Page Sections")
- **Global sections** (shared across pages):
  - Header & Navigation
  - Footer
- **Page-specific sections** vary per page. Examples for Home:
  - Hero Section
  - Logo Marquee
  - About Preview
  - Services Grid
  - Marine Capabilities
  - Statistics
  - Projects Showcase
  - Leadership
  - Call to Action

#### Field Editor (Middle Panel)
- When you select a section, its editable fields appear:
  - **Text fields** - For headings, titles, descriptions
  - **Textarea fields** - For longer content (paragraphs, descriptions)
  - **Image upload fields** - Click to upload or drag & drop images
  - **Video upload fields** - Click to upload or drag & drop videos
- Changes appear instantly in the live preview on the right

#### Live Preview (Right Panel)
- Shows the actual page as visitors see it
- Updates in real time as you type or upload media
- **Blue highlight** shows which section you're currently editing

#### Toolbar Buttons
- **Viewport Switcher** - Preview as Desktop, Tablet, or Mobile
- **Drag Mode** - Enable to click and reposition elements in the preview
- **Funnel Toggle** - Enable/disable the lead qualification popup in preview
- **Refresh** - Reload the preview iframe
- **Save** - Save all changes for the current section

### How to Use
1. Click **Content** in the left sidebar
2. Select the page from the top dropdown
3. Click a section in the left panel (e.g., "Hero Section")
4. Edit the fields in the middle panel - changes appear live
5. To upload an image: click the upload area or drag an image file onto it
6. Click **Save** to save your changes
7. Your changes are saved to the database and will appear on the live site

---

## 4. How to Add "Read More" Containers & Detail Pages

### Overview
Every Project card (6 total) and every Service card (6 total) has a **"Read More"** link that takes visitors to a dedicated detail page. The admin can fully customize each detail page's content.

### How the System Works

#### Project Detail Pages
Each project card links to its own detail page:
| Project Card | Detail Page URL |
|---|---|
| Seaport Infrastructure | `/projects/seaport-infrastructure` |
| Coastal Protection Systems | `/projects/coastal-protection` |
| Road Infrastructure Development | `/projects/road-infrastructure` |
| Asphalt Paving Works | `/projects/asphalt-paving` |
| Underground Pipe Installation | `/projects/pipe-installation` |
| Concrete Formwork | `/projects/concrete-formwork` |

#### Service Detail Pages
Each service card links to its own detail page:
| Service Card | Detail Page URL |
|---|---|
| Marine & Coastal Construction | `/services/marine-coastal-construction` |
| Infrastructure Development | `/services/infrastructure-development` |
| Earthworks | `/services/earthworks` |
| Dewatering & Shoring | `/services/dewatering-shoring` |
| MEP Works | `/services/mep-works` |
| General Construction | `/services/general-construction` |

### How to Edit Detail Page Content

1. Go to **Content** in the admin sidebar
2. Select **Projects** (or **Services**) from the page dropdown at the top
3. In the left section panel, scroll down to **"Detail Pages"** group
4. Click **"Project Detail Page Content"** (or **"Service Detail Page Content"**)
5. A **dropdown selector** appears at the top of the fields panel - choose which project/service to edit
6. Fill in the available fields:

**For Project Detail Pages:**
| Field | Description |
|---|---|
| Project Title | The main heading on the detail page |
| Subtitle / Tagline | A short tagline below the title |
| Hero Image | The large banner image at the top |
| Location | Where the project is located (e.g., "Muscat, Oman") |
| Category | Project category (e.g., "Marine", "Infrastructure") |
| Client | The client name for this project |
| Year | Year the project was completed |
| Full Description | The main body text describing the project |
| Scope of Work | Detailed scope of work text |
| Gallery Image 2 | Second gallery image |
| Gallery Image 3 | Third gallery image |

**For Service Detail Pages:**
| Field | Description |
|---|---|
| Service Title | The main heading on the detail page |
| Subtitle / Tagline | A short tagline below the title |
| Hero Image | The large banner image at the top |
| Full Description | The main body text describing the service |
| Key Features / Capabilities | List of features and capabilities |
| Our Process / Approach | Description of how the service is delivered |
| Gallery Image 2 | Second gallery image |
| Gallery Image 3 | Third gallery image |

7. Click **Save** to publish the content
8. The detail page URL shown below the dropdown tells you exactly where this content will appear

### Default Behavior
- If you haven't filled in detail page content yet, the system automatically pulls data from the main card (title, image, description) as a placeholder
- Visitors will see "Detail content coming soon. Edit this page from the admin dashboard." until you add content
- Each detail page includes a **"Back to Projects/Services"** link
- Service detail pages also include a **"Contact Our Team"** call-to-action button

---

## 5. Blog Posts & AI Blog Assistant

### What It Does
A full blogging system with AI-powered content creation tools. Create, edit, and manage blog posts in both English and Arabic.

### Features

#### Blog Post Manager
- **Post List:** Grid of all blog posts with title, status (Published/Draft), category, and date
- **Search:** Filter posts by title
- **Actions per post:**
  - **Edit** - Open in the blog editor
  - **Delete** - Remove the post permanently
  - **View** - See the published post on the site

#### Blog Editor Fields
| Field | Description |
|---|---|
| Title (English) | The blog post title in English |
| Title (Arabic) | The blog post title in Arabic |
| Slug | The URL-friendly version (auto-generated from title) |
| Category | Post category |
| Status | Published or Draft |
| Cover Image | Upload a featured image |
| Excerpt (English) | Short summary shown in blog listings |
| Excerpt (Arabic) | Arabic version of the summary |
| Content (English) | Full article body in English |
| Content (Arabic) | Full article body in Arabic |

#### AI Blog Assistant Panel
Click the **AI Assistant** button to open the AI panel. Available AI actions:

| AI Action | What It Does |
|---|---|
| **Suggest Titles** | Generates 5 creative title suggestions based on your topic or content |
| **Write Full Post** | Generates a complete article from a topic/title you provide |
| **Write Outline** | Creates a structured outline for your article |
| **Generate Excerpt** | Summarizes your content into a 2-3 sentence excerpt |
| **SEO Optimize** | Analyzes content and provides meta descriptions, keywords, and readability scores |
| **Translate to Arabic** | Translates your English content to Arabic (preserves formatting) |
| **Translate to English** | Translates Arabic content to English |
| **Improve Content** | Polishes and enhances your writing for clarity and professionalism |
| **Generate Cover Image** | Creates an AI-generated cover image using DALL-E 3 (1792x1024 resolution) |

### How to Use

#### Creating a New Blog Post
1. Click **Blog** in the left sidebar
2. Click **New Post** button
3. Enter a title - the slug auto-generates
4. Write your content in English
5. Click **AI Assistant** to use AI tools:
   - Click **Write Full Post** to generate an article from your title
   - Click **Translate to Arabic** to auto-translate to Arabic
   - Click **Generate Cover Image** to create a banner image
6. Set status to **Published**
7. Click **Save Post**
8. The post appears at `/blog/your-post-slug`

#### Using AI to Write a Blog Post
1. Click **New Post**
2. Type just a title or topic (e.g., "Marine Construction Safety Standards")
3. Open **AI Assistant** panel
4. Click **Write Full Post** - AI generates the entire article
5. Click **Generate Excerpt** - AI creates a summary
6. Click **Translate to Arabic** - AI translates everything
7. Click **Generate Cover Image** - AI creates a matching image
8. Review, edit if needed, then publish

### Requirements
- AI features require an **OpenAI API key** configured in Settings > API Integrations
- Cover image generation requires the DALL-E capable API key

---

## 6. Media Library

### What It Does
A central hub for managing all uploaded images and videos used across the website.

### Features
- **Grid View:** Thumbnail previews for images, icons for videos
- **File Info:** Shows file name, size, and upload date
- **Upload Methods:**
  - Click the upload area to browse files
  - Drag and drop files onto the upload area
- **Copy URL:** One-click button to copy the file URL to clipboard (for use in content editing)
- **Supported Formats:** Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM)

### How to Use
1. Click **Media** in the left sidebar
2. To upload: Click the upload area or drag files onto it
3. Files appear in the grid after upload
4. Click **Copy URL** on any file to copy its URL
5. Use the URL in content fields or blog posts

---

## 7. Leads & Contacts (CRM)

### What It Does
Captures and manages all contact form submissions and quote requests from the website. This is the core CRM (Customer Relationship Management) functionality.

### How Leads Are Captured
Leads come from three sources on the website:
1. **Contact Form** - The contact popup accessible from the navigation
2. **Get Quote Modal** - The quote request form
3. **Lead Qualification Funnel** - The multi-step popup that appears to visitors (asks about project type, budget, timeline)

### Features
- **Leads Table:** Shows all submissions in a sortable table
- **Lead Information:**
  | Column | Description |
  |---|---|
  | Name | Contact person's full name |
  | Email | Their email address |
  | Phone | Phone number |
  | Service | What service they're interested in |
  | Status | New (unread) or Contacted (followed up) |
  | Date | When the submission was received |
- **Status Management:** Click on a lead's status to toggle between:
  - **New** (blue badge) - Not yet contacted
  - **Contacted** (green badge) - You've followed up with them
- **New Lead Badge:** The sidebar shows a count of unread leads

### How to Use
1. Click **Leads** in the left sidebar
2. Review new submissions in the table
3. Contact the lead via email or phone
4. Click the status badge to change from **New** to **Contacted**
5. Leads are stored permanently in the database

### Lead Funnel Behavior
- The lead qualification funnel is a multi-step popup that appears to website visitors
- It can be enabled/disabled from **Settings > Features**
- In the Content Editor, use the **Funnel Toggle** button to preview with/without the funnel

---

## 8. Analytics

### What It Does
Provides a visual overview of website traffic and performance metrics.

### Features
- **Traffic Overview Cards:**
  - Page Views
  - Unique Visitors
  - Average Session Duration
  - Bounce Rate
- **Monthly Traffic Chart:** Bar chart showing traffic over the past 6 months
- **Top Pages Table:** Which pages get the most views
- **Traffic Sources Table:** Where visitors come from (Direct, Google, LinkedIn, etc.)

### How to Use
1. Click **Analytics** in the left sidebar
2. Review the dashboard for traffic insights
3. Use the data to prioritize content updates

### Note
Analytics data is currently illustrative. For live tracking, integrate Google Analytics (the system supports adding a Google Analytics Measurement ID).

---

## 9. Chatbot Knowledge Base

### What It Does
Manages the AI-powered floating chatbot that appears on every page. You can train it with custom knowledge about your company.

### Features

#### Knowledge Entries
- **Add entries:** Each entry has a **Topic** and **Content**
- Example:
  - Topic: "What services do you offer?"
  - Content: "We provide marine construction, infrastructure development, earthworks, dewatering, MEP works, and general construction."
- The chatbot uses these entries to answer visitor questions accurately

#### Chatbot Settings
| Setting | Description |
|---|---|
| Default Language | English (EN) or Arabic (AR) |
| Bubble Position | Left or Right side of the screen |
| Personality / Tone | How the chatbot responds (e.g., professional, friendly) |

#### Test Chat
- Built-in chat interface to test the chatbot's responses
- Type questions and see how the AI responds based on your knowledge entries
- Test before publishing to ensure accuracy

#### Export for Vercel
- Exports the knowledge base as a base64-encoded string
- Used as an environment variable (`CHATBOT_KNOWLEDGE`) on the deployed Vercel site
- Ensures the chatbot works identically in production

### How to Use
1. Click **Chatbot** in the left sidebar
2. Add knowledge entries (Topic + Content pairs) about your company
3. Set the personality (e.g., "Professional, helpful, knowledgeable about marine construction")
4. Use **Test Chat** to verify responses
5. Click **Save** to store the knowledge base
6. Click **Export for Vercel** to get the deployment string

### Requirements
- Requires an **OpenAI API key** configured in Settings > API Integrations
- The chatbot uses OpenAI's GPT model to generate responses

---

## 10. Settings

### What It Does
Global configuration for the entire website and admin system.

### Sections

#### General Settings
| Setting | Description |
|---|---|
| Site Name | The website name (appears in browser tab and headers) |
| Site URL | The live website URL |
| Contact Email | Primary contact email |
| Contact Phone | Primary phone number |

#### Localization
| Setting | Description |
|---|---|
| Enable Arabic (RTL) | Turns on Arabic language support and right-to-left layout |
| Auto-detect Language | Automatically detect visitor's preferred language |

#### Features
| Setting | Description |
|---|---|
| Lead Funnel | Enable/disable the lead qualification popup for visitors |
| Chatbot | Enable/disable the floating AI chatbot |
| Blog Section | Enable/disable the blog |

#### Security
| Setting | Description |
|---|---|
| Admin Username | Change the login username |
| Admin Password | Change the login password (requires current password) |

#### API Integrations
| Setting | Description |
|---|---|
| OpenAI API Key | Your OpenAI key for AI blog assistant and chatbot (shown masked for security) |

#### SEO
| Setting | Description |
|---|---|
| Global Meta Title | Default title tag for the website |
| Global Meta Description | Default meta description for search engines |

### How to Use
1. Click **Settings** in the left sidebar
2. Update any fields you need
3. Click **Save Settings** at the bottom
4. For password changes: enter current password, then new password, and click **Update Credentials**
5. For API key: paste your OpenAI API key and click **Save API Key**

---

## Quick Reference: Admin URL Structure

| Page | URL |
|---|---|
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin` |
| Project Detail (visitor) | `/projects/{slug}` |
| Service Detail (visitor) | `/services/{slug}` |
| Blog Post (visitor) | `/blog/{slug}` |

## Database Tables

| Table | Purpose |
|---|---|
| `site_settings` | All content, settings, and configuration (key-value pairs) |
| `leads` | Contact form submissions and quote requests |
| `blog_posts` | Blog articles with bilingual support |
| `chatbot_knowledge` | AI chatbot training data |

---

*Last updated: April 2026*
