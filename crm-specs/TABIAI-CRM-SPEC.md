# TabiAI — CRM Admin Dashboard Specification

## Overview
Build a full CRM admin dashboard at `/crm` (separate from the existing app dashboard and B2B dashboard) that gives the site owner complete control over every piece of content, every section, every page, every image, every text, every color, every pricing tier, every location, every VR/AR experience, and every setting in the TabiAI application. No limitations. The owner must be able to change absolutely anything from this dashboard without touching code.

## Authentication
- Separate CRM login at `/crm/login`
- Hardcoded CRM credentials stored in database table `crm_settings` (username + bcrypt hashed password)
- Default: username `admin`, password `TabiAI2024!`
- JWT token-based session (stored in localStorage)
- All `/crm/api/*` endpoints require Bearer token auth
- This is completely separate from the app's existing Clerk authentication

## Tech Stack (must match existing app)
- Express routes added to the existing server
- Vanilla HTML/CSS/JS for the CRM dashboard (no React — keeps it independent from the main app)
- PostgreSQL queries using the existing database connection (Drizzle)
- New `crm_settings` table for all CRM data storage

## Database Table
```sql
CREATE TABLE IF NOT EXISTS crm_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(500) UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## CRM Sidebar Navigation
```
Dashboard
Pages & Content
Content Editor (with live preview iframe)
Locations Management
Bookings Management
AR Experiences
VR Experiences
Business Partners
User Management
AI Concierge Config
Pricing & Subscriptions
Media Library
Analytics
Appearance & Branding
Settings
```

## Dashboard Page
Real statistics pulled from actual database tables:
- Total Locations (count from locations table)
- Total Bookings (count from bookings table)
- Total Users (count from users table)
- Total Revenue (sum from bookings/commissions)
- Active AR Sessions (from ar data)
- VR Experiences viewed
- AI Chat conversations
- Active Subscriptions
- Recent activity feed (latest bookings, new users, AI chats — real data)
- Quick action buttons: "Add Location", "View Bookings", "AI Config"

## Pages & Content
The app has these pages — CRM must let owner edit ALL content on each:

### 1. Home Page
- Hero section: title, subtitle, search placeholder, background image/video
- Category cards: 4 categories (Food, Shopping, Culture, Nature) — icon, title, description, image for each
- Featured spots section: title, subtitle
- AR/VR promotional sections: titles, descriptions, images, CTA button text
- "Why TabiAI" section: title, each value prop card (title + description + icon)
- Partner showcase: logos, names
- CTA sections: titles, subtitles, button texts

### 2. Explore Page
- Page title, subtitle
- Search placeholder text
- Category filter labels
- Empty state message
- Location card layout settings

### 3. AI Chat Concierge Page
- Page title
- Chat placeholder text
- Welcome message / system prompt
- Suggested starter prompts (editable list)
- Voice input button labels

### 4. AR Guide Page
- Page title, subtitle
- Route descriptions
- Cultural etiquette texts for each landmark
- AR overlay labels
- Camera permission request text
- Empty state message

### 5. VR 360 Experiences Page
- Page title, subtitle
- Experience card labels
- Premium/Free tier badges
- Fullscreen button text
- Hotspot labels and descriptions
- Loading text

### 6. Bookings Page
- Page title, subtitle
- Form labels (date, guests, etc.)
- Status labels (confirmed, pending, cancelled)
- Price display format
- Empty state message
- Confirmation message text

### 7. Analytics Dashboard Page
- Page title
- Stat card labels
- Chart titles
- Date range selector labels

### 8. Pricing Page
- Page title, subtitle
- 4 tier cards — each tier: name, price, currency, billing period, description, feature list (add/remove features), CTA button text, badge text (e.g. "Most Popular")
- FAQ section: question + answer pairs (add/remove)
- Annual/Monthly toggle labels

### 9. B2B Business Dashboard Page
- Page title
- Tab labels (Hotels, Tours, Municipality)
- XR content management labels
- Partner profile section labels
- Empty states

### 10. Login / Register Page
- Logo, title, subtitle
- Button text
- OAuth provider labels
- Footer text

## Content Editor (Live Preview)
Three-column layout:
1. **Left panel**: Page selector (all 10 pages listed above)
2. **Middle panel**: Editable fields for the selected page section
3. **Right panel**: Live iframe preview of the actual page

Every editable element in the app's HTML/JSX must have a `data-field="fieldKey"` attribute. The Content Editor reads current values and lets the owner change them. On save, values are stored in `crm_settings` as `content_{sectionKey}` and applied server-side when rendering.

Field types supported:
- `text` — single line input
- `textarea` — multi-line
- `image` — URL input with preview + file upload
- `video` — URL input
- `color` — color picker
- `select` — dropdown options
- `number` — numeric input
- `list` — repeatable items (add/remove)

## Locations Management
Full CRUD over the `locations` table:
- View all locations in a table/grid (name JP, name EN, category, rating, crowd level, address, status)
- Search and filter by category (Food, Shopping, Culture, Nature)
- **Create new location**: name (JP + EN), description (JP + EN), category, address, rating, crowd level, latitude/longitude, images (multiple), featured toggle
- **Edit any location**: all fields above
- **Delete locations**
- **Reorder**: drag to set display order
- **Featured toggle**: mark/unmark as featured (shown on home page)
- **Bulk actions**: delete, change category, toggle featured
- **Import/Export**: CSV import/export of locations

## Bookings Management
Full control over all bookings:
- View all bookings with search, status filter, date range
- Each booking shows: user, location, date, guests, price, status, commission
- **Edit any booking**: change status, date, guests, price, notes
- **Delete bookings**
- **Create manual booking**: select user + location + date + guests
- **Commission tracking**: view commission amounts per booking
- **Export**: CSV export
- **Bulk actions**: change status, delete

## AR Experiences Management
Full control over AR content:
- **AR Routes**: CRUD — name, waypoints (list of lat/lng + label), duration, distance, description
- **AR Overlays**: CRUD — name, linked location, overlay image/3D model URL, position data, cultural info text (JP + EN)
- **Cultural Etiquette**: CRUD — landmark name, etiquette title (JP + EN), etiquette description (JP + EN)
- **Enable/Disable AR**: Toggle AR feature on/off entirely

## VR Experiences Management
Full control over VR content:
- View all VR experiences in a grid
- **Create VR Experience**: name (JP + EN), description (JP + EN), panorama image URL, YouTube 360 video URL, category, location link, premium/free toggle
- **Edit any experience**: all fields above
- **Delete experiences**
- **Hotspots**: For each VR experience, manage hotspots — position (x,y,z), label (JP + EN), description (JP + EN), linked info
- **Premium/Free toggle**: control which experiences require subscription
- **Reorder**: set display order

## Business Partners Management
Full control over B2B features:
- **Businesses**: CRUD — name, type (Hotel, Tour, Municipality), contact email, phone, address, description, logo, status (active/inactive)
- **Business Users**: view/manage users linked to each business
- **Commissions**: view/edit commission rates per business
- **XR Content**: manage AR/VR content assigned to each business partner
- **Bulk actions**: activate/deactivate, delete

## User Management
Full CRUD over users:
- View all users in a table (name, email, role, subscription tier, created date, last active)
- Search and filter by role, subscription tier
- **Edit any user**: change name, email, role, subscription
- **Delete users**
- **Create new users**
- **View user activity**: bookings, AI chats, AR/VR usage per user
- **Bulk actions**: delete, change role

## AI Concierge Configuration
- **System Prompt**: Editable textarea — the AI's personality, instructions, cultural knowledge
- **Model**: Display current model (GPT-5.2)
- **Temperature**: Slider (0.0 - 1.0)
- **Max Tokens**: Number input
- **Suggested Prompts**: Editable list of conversation starters shown to users
- **Knowledge Base**: Add custom knowledge entries (title + content) injected into AI context
  - Location-specific knowledge
  - Cultural customs and etiquette
  - Transportation info
  - Emergency contacts
  - Seasonal events
- **Voice Input**: Toggle enable/disable
- **Supported Languages**: Toggle Japanese / English / both
- **Rate Limiting**: Requests per minute per user (free vs premium)
- **Enable/Disable AI**: Toggle to turn AI on/off entirely

## Pricing & Subscriptions
Full control over pricing tiers:
- **4 Tiers** (Free, Premium, City Pass, B2B Enterprise):
  - Name (JP + EN)
  - Monthly price
  - Annual price
  - Currency
  - Description (JP + EN)
  - Feature list: add/remove/reorder features (JP + EN text for each)
  - CTA button text
  - Badge text (e.g. "Most Popular", "Best Value")
  - Active/Inactive toggle
- **View subscriptions**: table of all active subscriptions (user, tier, start date, renewal date, status)
- **Cancel/modify subscriptions**
- **Revenue summary**: total MRR, ARR, churn rate
- **Promo codes**: create/manage discount codes (code, percentage, expiry, usage limit)

## Media Library
- Grid view of all uploaded images/videos/files
- Upload new files (drag & drop + click)
- Delete files
- Copy URL to clipboard
- Preview images/videos
- File info (name, size, type, upload date)
- Search by filename
- Folders/categories for organization

## Analytics
Real data from database:
- **Users**: registrations over time, active users (DAU/WAU/MAU), user retention
- **Bookings**: bookings over time, revenue over time, bookings by location, bookings by status
- **Locations**: most viewed, highest rated, category distribution
- **AI Concierge**: messages per day, conversations per user, common questions, language split
- **AR Usage**: AR sessions per day, most popular routes, average session duration
- **VR Usage**: VR views per day, most popular experiences, premium vs free usage
- **Language**: Japanese vs English usage split
- **Revenue**: MRR, ARR, revenue by tier, commission totals
- **Conversion**: free-to-premium conversion rate, booking conversion rate
- **Export**: CSV export for all analytics

## Appearance & Branding
Complete visual control:
- **Logo**: Upload/change the app logo
- **App Name**: Change "TabiAI" display text (JP + EN)
- **Primary Color**: Color picker (currently Deep Navy #1A2A44)
- **Accent Color**: Color picker (currently Crimson #C8102E)
- **Gold/Highlight Color**: Color picker (currently Gold #C9A646)
- **Background Color**: Color picker
- **Font**: Dropdown (Noto Sans JP, Inter, etc.)
- **Border Radius**: Slider (currently 12px)
- **Dark/Light Mode Default**: Toggle
- **Login Page Background**: Image upload or color
- **Favicon**: Upload
- **Footer Text**: Editable (JP + EN)
- **Custom CSS**: Textarea for injecting custom CSS overrides
- **Social Media Links**: URL fields for Twitter, Instagram, Facebook, LINE, etc.

## Settings
- **CRM Password Change**: Current password + new password
- **App Name**: Site-wide name (JP + EN)
- **Default Language**: Japanese / English
- **Maintenance Mode**: Toggle (shows maintenance page to visitors)
- **GDPR Compliance**: Toggle data export/deletion features
- **Rate Limiting**: Configure API rate limits (general + AI)
- **Clerk Auth Settings**: Display Clerk configuration info
- **Email Notifications**: Toggle for booking confirmations, new user signups
- **Notification Email**: Where to send admin notifications
- **Data Export**: Export all data as JSON
- **Data Import**: Import settings from JSON backup
- **Database Backup**: Download full DB dump
- **Reset to Defaults**: Button to reset all CRM settings

## Server-Side Content Application
When serving any page, the server must:
1. Read all `content_*` keys from `crm_settings` for that page
2. For each saved field, find the matching `data-field="X"` in the HTML/rendered output
3. For image/video fields (keys ending in `-img`, `-bg`, `-video`): replace the `src` attribute
4. For text fields: replace the element's innerHTML
5. For color/style fields: inject inline styles or CSS variables

Example server function:
```javascript
async function applyCrmContent(html, sectionKeys) {
  for (const sectionKey of sectionKeys) {
    const r = await db.query('SELECT value FROM crm_settings WHERE key=$1', ['content_' + sectionKey]);
    if (r.rows.length > 0) {
      const data = JSON.parse(r.rows[0].value);
      for (const [field, value] of Object.entries(data)) {
        if (!value) continue;
        if (field.endsWith('-img') || field.endsWith('-bg') || field.endsWith('-video')) {
          const regex = new RegExp('(<[^>]*data-field="' + field + '"[^>]*\\bsrc=")[^"]*(")', 'i');
          html = html.replace(regex, '$1' + value + '$2');
        } else {
          const regex = new RegExp('(<[^>]*data-field="' + field + '"[^>]*>)([\\s\\S]*?)(</[a-z][a-z0-9]*>)', 'i');
          const match = html.match(regex);
          if (match) html = html.replace(match[0], match[1] + value + match[3]);
        }
      }
    }
  }
  return html;
}
```

## CSS Design System
Use these CSS variables (Japanese Omotenashi aesthetic):
```css
:root {
  --bg: #F5F6F8;
  --sidebar: #1A2A44;
  --sidebar-hover: #243550;
  --sidebar-active: #C8102E;
  --card: #fff;
  --border: #e2e8f0;
  --text: #1A2A44;
  --text-muted: #64748b;
  --primary: #1A2A44;
  --primary-dark: #0f1d33;
  --accent: #C8102E;
  --gold: #C9A646;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 12px;
}
```
Font: `'Noto Sans JP', system-ui, sans-serif`

## API Endpoints Required
```
POST   /crm/api/login                      — CRM login
GET    /crm/api/dashboard-stats             — Real stats from DB
GET    /crm/api/site-content/:section       — Get saved content
PUT    /crm/api/site-content/:section       — Save content
GET    /crm/api/locations                   — List all locations
POST   /crm/api/locations                   — Create location
PUT    /crm/api/locations/:id               — Update location
DELETE /crm/api/locations/:id               — Delete location
GET    /crm/api/bookings                    — List all bookings
POST   /crm/api/bookings                    — Create booking
PUT    /crm/api/bookings/:id                — Update booking
DELETE /crm/api/bookings/:id                — Delete booking
GET    /crm/api/ar-routes                   — List AR routes
POST   /crm/api/ar-routes                   — Create AR route
PUT    /crm/api/ar-routes/:id               — Update AR route
DELETE /crm/api/ar-routes/:id               — Delete AR route
GET    /crm/api/ar-overlays                 — List AR overlays
POST   /crm/api/ar-overlays                 — Create overlay
PUT    /crm/api/ar-overlays/:id             — Update overlay
DELETE /crm/api/ar-overlays/:id             — Delete overlay
GET    /crm/api/vr-experiences              — List VR experiences
POST   /crm/api/vr-experiences              — Create VR experience
PUT    /crm/api/vr-experiences/:id          — Update VR experience
DELETE /crm/api/vr-experiences/:id          — Delete VR experience
GET    /crm/api/vr-hotspots/:experienceId   — List hotspots
POST   /crm/api/vr-hotspots                 — Create hotspot
PUT    /crm/api/vr-hotspots/:id             — Update hotspot
DELETE /crm/api/vr-hotspots/:id             — Delete hotspot
GET    /crm/api/businesses                  — List businesses
POST   /crm/api/businesses                  — Create business
PUT    /crm/api/businesses/:id              — Update business
DELETE /crm/api/businesses/:id              — Delete business
GET    /crm/api/users                       — List all users
POST   /crm/api/users                       — Create user
PUT    /crm/api/users/:id                   — Update user
DELETE /crm/api/users/:id                   — Delete user
GET    /crm/api/ai-config                   — Get AI settings
PUT    /crm/api/ai-config                   — Save AI settings
GET    /crm/api/pricing                     — Get pricing tiers
PUT    /crm/api/pricing                     — Save pricing tiers
GET    /crm/api/subscriptions               — List subscriptions
PUT    /crm/api/subscriptions/:id           — Update subscription
GET    /crm/api/promo-codes                 — List promo codes
POST   /crm/api/promo-codes                 — Create promo code
DELETE /crm/api/promo-codes/:id             — Delete promo code
GET    /crm/api/media                       — List media
POST   /crm/api/media/upload                — Upload file
DELETE /crm/api/media/:id                   — Delete file
GET    /crm/api/analytics                   — Get analytics
GET    /crm/api/appearance                  — Get branding
PUT    /crm/api/appearance                  — Save branding
GET    /crm/api/settings                    — Get settings
PUT    /crm/api/settings                    — Save settings
POST   /crm/api/export                      — Export all data
POST   /crm/api/import                      — Import data
PUT    /crm/api/change-password              — Change CRM password
```

## Implementation Notes
- The CRM is a SEPARATE vanilla HTML/CSS/JS dashboard — do NOT build it in React
- It lives at `/crm` and `/crm/*` routes, completely independent from the main React app
- All CRM static files (crm.html, crm.css, crm.js) should be in a `/crm` or `/public/crm` folder
- Add Express routes for serving CRM pages and API endpoints to the existing server
- The CRM must be mobile-responsive
- Include toast notifications for save/delete/error actions
- All data tables must have search, filter, sort, and pagination
- Every interactive element needs `data-testid` attributes
- Support both Japanese and English in the CRM UI (simple toggle)
- All location/content fields should have JP and EN versions where applicable
