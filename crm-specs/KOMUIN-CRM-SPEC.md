# KomuIn AI — CRM Admin Dashboard Specification

## Overview
Build a full CRM admin dashboard at `/crm` (separate from the existing `/admin` panel) that gives the site owner complete control over every piece of content, every section, every page, every image, every text, every color, and every setting in the KomuIn AI application. No limitations. The owner must be able to change absolutely anything from this dashboard without touching code.

## Authentication
- Separate CRM login at `/crm/login`
- Hardcoded CRM credentials stored in database table `crm_settings` (username + bcrypt hashed password)
- Default: username `admin`, password `KomuIn2024!`
- JWT token-based session (stored in localStorage)
- All `/crm/api/*` endpoints require Bearer token auth
- This is completely separate from the app's existing Auth system (Admin/Staff/Citizen roles)

## Tech Stack (must match existing app)
- Express routes added to the existing server
- Vanilla HTML/CSS/JS for the CRM dashboard (no React — keeps it independent from the main app)
- PostgreSQL queries using the existing database connection
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
User Management
Inquiry Management
Document Management
AI Assistant Config
Media Library
Analytics
Appearance & Branding
Settings
```

## Dashboard Page
Real statistics pulled from actual database:
- Total Users (count from users table)
- Total Inquiries (count from inquiries table)
- Open Inquiries (count where status = 'open')
- Total Documents (count from documents table)
- AI Interactions (count from ai messages or conversations)
- Recent activity feed (latest 10 inquiries + documents, real data)
- Quick action buttons: "View Inquiries", "Manage Users", "AI Config"

## Pages & Content
The app has these pages — CRM must let owner edit ALL content on each:

### 1. Login / Register Page
- Page title, subtitle
- Background image/color
- Logo image
- Demo account display text
- Button labels ("Sign In", "Create Account")
- Footer text

### 2. Dashboard Page (what Staff/Admin see)
- Welcome message text
- Stat card labels ("Total Inquiries", "Open Inquiries", etc.)
- AI Assistant card — title, description, suggested prompt texts
- Recent Activity section title

### 3. Inquiry Management Page
- Page title, subtitle
- Status labels (Open, In Progress, Resolved, Closed)
- Category labels (General, Tax, Welfare, Housing, Education, Health, Registration, Other)
- Filter placeholder texts
- Empty state message
- AI Draft Response button text
- "Save & Send Response" button text

### 4. Document Management Page
- Page title, subtitle
- Document type labels (Application, Certificate, Report, Notice)
- Filter placeholder texts
- Empty state message
- AI generation prompt placeholder
- Button labels

### 5. AI Chat Assistant Page
- Page title
- Chat placeholder text ("Type your message...")
- Welcome message / system prompt
- Suggested starter prompts (editable list)

### 6. Admin Panel (User Management)
- Page title, subtitle
- Column headers
- Role labels
- Status labels

### 7. Citizen Portal
- Welcome banner title, subtitle
- Tab labels ("Inquiries", "Documents")
- Empty state messages
- Submit inquiry form labels
- Category dropdown options display text

## Content Editor (Live Preview)
Three-column layout:
1. **Left panel**: Page selector (all 7 pages listed above)
2. **Middle panel**: Editable fields for the selected page section
3. **Right panel**: Live iframe preview of the actual page

Every editable element in the app's HTML/JSX must have a `data-field="fieldKey"` attribute. The Content Editor reads current values and lets the owner change them. On save, values are stored in `crm_settings` as `content_{sectionKey}` and applied server-side when rendering pages.

Field types supported:
- `text` — single line input
- `textarea` — multi-line
- `image` — URL input with preview + file upload
- `video` — URL input
- `color` — color picker
- `select` — dropdown options

## User Management (CRM-level)
Full CRUD over the app's `users` table:
- View all users in a table (name, email, role, department, status, created date)
- Search and filter by role (Admin, Staff, Citizen)
- Edit any user: change name, email, role, department, status
- Delete users
- Create new users
- Reset user passwords
- Bulk actions: delete selected, change role

## Inquiry Management (CRM-level)
Full control over all inquiries:
- View all inquiries with search, status filter, category filter, date range
- Edit any inquiry: change title, content, status, category, assigned staff
- Delete inquiries
- View full conversation thread (inquiry + responses)
- Manually add responses
- Export inquiries as CSV
- Bulk status change
- Bulk delete

## Document Management (CRM-level)
Full control over all documents:
- View all documents with search and type filter
- Edit any document: name, content, type, visibility
- Delete documents
- Create new documents
- Assign documents to specific users/citizens
- Export document list
- Bulk delete

## AI Assistant Configuration
- **System Prompt**: Editable textarea for the AI's base personality/instructions
- **Model Selection**: Dropdown (if multiple models available)
- **Temperature**: Slider (0.0 - 1.0)
- **Max Tokens**: Number input
- **Suggested Prompts**: Editable list of starter prompts shown to users
- **Knowledge Base**: Add custom knowledge entries (title + content pairs) that get injected into AI context
- **Language**: Default AI response language (Japanese/English)
- **Rate Limiting**: Requests per minute per user
- **Enable/Disable AI**: Toggle to turn AI on/off entirely

## Media Library
- Grid view of all uploaded images/videos/files
- Upload new files (drag & drop + click)
- Delete files
- Copy URL to clipboard
- Preview images/videos
- File info (name, size, type, upload date)
- Search by filename

## Analytics
Real data from database:
- User registrations over time (chart)
- Inquiries by status (pie/bar chart)
- Inquiries by category (bar chart)
- Documents created over time
- AI chat usage (messages per day)
- Active users (daily/weekly/monthly)
- Language usage split (Japanese vs English)
- Top categories
- Response time metrics
- Data export (CSV)

## Appearance & Branding
Complete visual control:
- **Logo**: Upload/change the app logo
- **App Name**: Change "KomuIn AI" display text
- **Primary Color**: Color picker (currently the app's main theme color)
- **Secondary Color**: Color picker
- **Sidebar Color**: Color picker
- **Font**: Dropdown (Inter, Noto Sans JP, etc.)
- **Dark/Light Mode Default**: Toggle
- **Login Page Background**: Image upload or color
- **Favicon**: Upload
- **Footer Text**: Editable
- **Custom CSS**: Textarea for injecting custom CSS overrides

## Settings
- **CRM Password Change**: Current password + new password
- **App Name**: Site-wide name
- **Default Language**: Japanese / English
- **Maintenance Mode**: Toggle (shows maintenance page to users)
- **Demo Mode**: Toggle (enables/disables demo accounts)
- **Demo Account Credentials**: Edit demo emails and passwords
- **Email Notifications**: Toggle for inquiry notifications
- **Notification Email**: Where to send admin notifications
- **Data Export**: Export all data as JSON
- **Data Import**: Import settings from JSON backup
- **Database Backup**: Download full DB dump
- **Reset to Defaults**: Button to reset all CRM settings

## Server-Side Content Application
When serving any page, the server must:
1. Read all `content_*` keys from `crm_settings` for that page
2. For each saved field, find the matching `data-field="X"` in the HTML
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
Use these CSS variables (matches Cahit CRM style but with KomuIn branding):
```css
:root {
  --bg: #f8fafc;
  --sidebar: #1A2A44;
  --sidebar-hover: #243550;
  --sidebar-active: #3B82F6;
  --card: #fff;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
  --primary: #3B82F6;
  --primary-dark: #2563EB;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 8px;
}
```

## API Endpoints Required
```
POST   /crm/api/login                    — CRM login
GET    /crm/api/dashboard-stats          — Real stats from DB
GET    /crm/api/site-content/:section    — Get saved content for section
PUT    /crm/api/site-content/:section    — Save content for section
GET    /crm/api/users                    — List all app users
POST   /crm/api/users                    — Create user
PUT    /crm/api/users/:id                — Update user
DELETE /crm/api/users/:id                — Delete user
GET    /crm/api/inquiries                — List all inquiries
PUT    /crm/api/inquiries/:id            — Update inquiry
DELETE /crm/api/inquiries/:id            — Delete inquiry
GET    /crm/api/documents                — List all documents
POST   /crm/api/documents                — Create document
PUT    /crm/api/documents/:id            — Update document
DELETE /crm/api/documents/:id            — Delete document
GET    /crm/api/ai-config                — Get AI settings
PUT    /crm/api/ai-config                — Save AI settings
GET    /crm/api/media                    — List media files
POST   /crm/api/media/upload             — Upload file
DELETE /crm/api/media/:id                — Delete file
GET    /crm/api/analytics                — Get analytics data
GET    /crm/api/appearance               — Get branding settings
PUT    /crm/api/appearance               — Save branding settings
GET    /crm/api/settings                 — Get all settings
PUT    /crm/api/settings                 — Save settings
POST   /crm/api/export                   — Export all data
POST   /crm/api/import                   — Import data
PUT    /crm/api/change-password           — Change CRM password
```

## Implementation Notes
- The CRM is a SEPARATE vanilla HTML/CSS/JS dashboard — do NOT build it in React
- It lives at `/crm` and `/crm/*` routes, completely independent from the main React app
- All CRM static files (crm.html, crm.css, crm.js) should be in a `/crm` folder
- Add Express routes for serving CRM pages and API endpoints to the existing server
- The CRM dashboard must be mobile-responsive
- Include toast notifications for save/delete/error actions
- All data tables must have search, filter, sort, and pagination
- Every interactive element needs `data-testid` attributes
