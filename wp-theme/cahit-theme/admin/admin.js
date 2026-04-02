(function() {
  var state = {
    currentPage: 'dashboard',
    pages: [
      { name: 'Home', path: '/', template: 'front-page.php', status: 'published' },
      { name: 'About Us', path: '/about', template: 'page-about.php', status: 'published' },
      { name: 'Services', path: '/services', template: 'page-services.php', status: 'published' },
      { name: 'Projects', path: '/projects', template: 'page-projects.php', status: 'published' },
      { name: 'Clients', path: '/clients', template: 'page-clients.php', status: 'published' },
      { name: 'Blog', path: '/blog', template: 'page-blog.php', status: 'published' },
      { name: 'Careers', path: '/careers', template: 'page-careers.php', status: 'published' }
    ],
    leads: [],
    blogPosts: [],
    mediaItems: [
      { name: 'hero-video.mp4', type: 'video', size: '12.4 MB', date: '2025-03-10' },
      { name: 'marine-construction.png', type: 'image', size: '2.1 MB', date: '2025-03-09' },
      { name: 'infrastructure.jpeg', type: 'image', size: '1.8 MB', date: '2025-03-09' },
      { name: 'earthworks.gif', type: 'image', size: '41.2 MB', date: '2025-03-08' },
      { name: 'about-video.mp4', type: 'video', size: '3.5 MB', date: '2025-03-08' },
      { name: 'dewatering.png', type: 'image', size: '1.2 MB', date: '2025-03-07' },
      { name: 'mep-works.png', type: 'image', size: '0.9 MB', date: '2025-03-07' },
      { name: 'services-bg.mp4', type: 'video', size: '8.7 MB', date: '2025-03-06' }
    ],
    editingPage: null,
    editingSection: 'hero',
    viewport: 'desktop',
    editedContent: {},
    siteSettings: {},
    funnelDisabled: true,
    dragMode: false
  };

  var BASE_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/';
  var mediaImages = {
    'marine-construction.png': 'EGRSgZmJXJSrWKJY.png',
    'infrastructure.jpeg': 'gvWLawWCNocSINuR.jpeg',
    'dewatering.png': 'NHQbvhqluSlDGrrN.png',
    'mep-works.png': 'qZRtUjMizSFySgTf.png'
  };

  function init() {
    loadLeads();
    loadBlogPosts();
    loadMediaFromServer();
    loadSiteSettings();
    bindNavigation();
    bindMobileMenu();
    bindLogout();
    renderPage('dashboard');
  }

  function loadLeads() {
    fetch('/admin/api/leads').then(function(r) { return r.json(); }).then(function(data) {
      if (data.success) { state.leads = data.data; if (state.currentPage === 'dashboard' || state.currentPage === 'leads') renderPage(state.currentPage); }
    }).catch(function() {});
  }

  function loadMediaFromServer() {
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    fetch('/admin/api/uploads', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success && d.files) {
          d.files.forEach(function(f) {
            var exists = state.mediaItems.some(function(m) { return m.name === f.name || m.url === f.url; });
            if (!exists) {
              state.mediaItems.push({
                name: f.name,
                type: /\.(mp4|mov|webm|avi)$/i.test(f.name) ? 'video' : 'image',
                size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                date: f.date || '',
                url: f.url
              });
            }
          });
        }
      }).catch(function() {});
  }

  function loadSiteSettings() {
    fetch('/admin/api/site-content/settings').then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.data) { state.siteSettings = d.data; }
    }).catch(function() {});
  }

  function loadSavedSectionContent(section) {
    fetch('/admin/api/site-content/' + section).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.data) {
        var data = d.data;
        Object.keys(data).forEach(function(key) {
          if (!state.editedContent[key]) {
            state.editedContent[key] = data[key];
            var field = document.querySelector('[data-key="' + key + '"]');
            if (field) {
              if (field.tagName === 'TEXTAREA') field.value = data[key];
              else if (field.tagName === 'INPUT') field.value = data[key];
            }
          }
        });
      }
    }).catch(function() {});
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var page = this.getAttribute('data-page');
        document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
        this.classList.add('active');
        state.currentPage = page;
        document.getElementById('pageTitle').textContent = this.querySelector('span').textContent;
        renderPage(page);
        document.getElementById('sidebar').classList.remove('open');
      });
    });
  }

  function bindMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }
  }

  function bindLogout() {
    var btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('cahit_admin_token');
        localStorage.removeItem('cahit_admin_token');
        window.location.href = '/admin/login';
      });
    }
  }

  function renderPage(page) {
    var content = document.getElementById('mainContent');
    switch(page) {
      case 'dashboard': content.innerHTML = renderDashboard(); break;
      case 'pages': content.innerHTML = renderPages(); bindPageActions(); break;
      case 'content': content.innerHTML = renderContentEditor(); bindEditorActions(); break;
      case 'media': content.innerHTML = renderMedia(); bindMediaActions(); break;
      case 'blog': content.innerHTML = renderBlogManager(); loadBlogPosts(); break;
      case 'leads': content.innerHTML = renderLeads(); break;
      case 'analytics': content.innerHTML = renderAnalytics(); break;
      case 'chatbot': content.innerHTML = renderChatbotKnowledge(); bindChatbotActions(); break;
      case 'settings': content.innerHTML = renderSettings(); bindSettingsActions(); break;
    }
  }

  function renderDashboard() {
    var leadsCount = state.leads.length;
    var newLeads = state.leads.filter(function(l) { return l.status === 'new'; }).length;
    var blogCount = (state.blogPosts || []).length;
    return '' +
      '<div class="stats-row">' +
        '<div class="stat-card" data-testid="stat-pages">' +
          '<div class="stat-card-header"><span class="stat-card-label">Total Pages</span><div class="stat-card-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div></div>' +
          '<div class="stat-card-value">' + state.pages.length + '</div><div class="stat-card-change">All published</div>' +
        '</div>' +
        '<div class="stat-card" data-testid="stat-leads">' +
          '<div class="stat-card-header"><span class="stat-card-label">Leads</span><div class="stat-card-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div>' +
          '<div class="stat-card-value">' + leadsCount + '</div><div class="stat-card-change">' + newLeads + ' new</div>' +
        '</div>' +
        '<div class="stat-card" data-testid="stat-blog">' +
          '<div class="stat-card-header"><span class="stat-card-label">Blog Posts</span><div class="stat-card-icon orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div></div>' +
          '<div class="stat-card-value">' + blogCount + '</div><div class="stat-card-change">Published articles</div>' +
        '</div>' +
        '<div class="stat-card" data-testid="stat-media">' +
          '<div class="stat-card-header"><span class="stat-card-label">Media Files</span><div class="stat-card-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div></div>' +
          '<div class="stat-card-value">' + state.mediaItems.length + '</div><div class="stat-card-change">Images & videos</div>' +
        '</div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">Recent Activity</span></div>' +
          '<div class="card-body">' +
            '<div class="activity-item"><div class="activity-dot blue"></div><div><div class="activity-text">Arabic translations updated for marine section</div><div class="activity-time">2 hours ago</div></div></div>' +
            '<div class="activity-item"><div class="activity-dot green"></div><div><div class="activity-text">Service cards Arabic content added</div><div class="activity-time">3 hours ago</div></div></div>' +
            '<div class="activity-item"><div class="activity-dot blue"></div><div><div class="activity-text">Hero section RTL alignment fixed</div><div class="activity-time">5 hours ago</div></div></div>' +
            '<div class="activity-item"><div class="activity-dot orange"></div><div><div class="activity-text">Lead qualification funnel deployed</div><div class="activity-time">1 day ago</div></div></div>' +
            '<div class="activity-item"><div class="activity-dot green"></div><div><div class="activity-text">Chatbot integration completed</div><div class="activity-time">2 days ago</div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">Quick Actions</span></div>' +
          '<div class="card-body">' +
            '<div style="display:flex;flex-direction:column;gap:8px">' +
              '<button class="btn btn-primary" onclick="document.querySelector(\'[data-page=content]\').click()" data-testid="button-edit-content">Edit Page Content</button>' +
              '<button class="btn btn-outline" onclick="document.querySelector(\'[data-page=media]\').click()" data-testid="button-manage-media">Manage Media</button>' +
              '<button class="btn btn-outline" onclick="document.querySelector(\'[data-page=leads]\').click()" data-testid="button-view-leads">View Leads</button>' +
              '<a href="/" target="_blank" class="btn btn-outline" data-testid="button-preview-site">Preview Site</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderPages() {
    var cards = '';
    state.pages.forEach(function(p) {
      cards += '' +
        '<div class="page-card" data-testid="page-card-' + p.path.replace('/', '') + '">' +
          '<div class="page-card-title">' + p.name + '</div>' +
          '<div class="page-card-path">' + p.path + ' &middot; ' + p.template + '</div>' +
          '<div class="page-card-status"><span class="dot"></span> Published</div>' +
          '<div class="page-card-actions">' +
            '<button class="btn btn-sm btn-primary page-edit-btn" data-path="' + p.path + '">Edit Content</button>' +
            '<a href="' + p.path + '" target="_blank" class="btn btn-sm btn-outline">View</a>' +
          '</div>' +
        '</div>';
    });
    return '' +
      '<div class="toolbar">' +
        '<span style="font-size:14px;color:var(--text-muted)">' + state.pages.length + ' pages</span>' +
        '<div class="toolbar-spacer"></div>' +
      '</div>' +
      '<div class="page-grid">' + cards + '</div>';
  }

  function bindPageActions() {
    document.querySelectorAll('.page-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var pagePath = this.getAttribute('data-path');
        state.editingPage = pagePath;
        document.querySelector('[data-page=content]').click();
      });
    });
  }

  var sectionFields = {
    hero: [
      { key: 'hero-title-line1', label: 'Title Line 1', selector: '.hero-title', type: 'text', defaultVal: 'CAHIT CONTRACTING' },
      { key: 'hero-title-line2', label: 'Title Line 2 (highlight)', selector: '.hero-title .text-cyan-200', type: 'text', defaultVal: 'A Solid Ground' },
      { key: 'hero-title-line3', label: 'Title Line 3', selector: '.hero-title', type: 'text', defaultVal: 'For Your Project', nodeIndex: 2 },
      { key: 'hero-subtitle', label: 'Subtitle', selector: '.hero-subtitle', type: 'textarea', defaultVal: 'Marine & Coastal Construction Experts' },
      { key: 'hero-btn1', label: 'Button 1 Text', selector: '.hero-buttons .btn-sky', type: 'text', defaultVal: 'Schedule Consultation' },
      { key: 'hero-btn2', label: 'Button 2 Text', selector: '.hero-buttons .btn-outline-white', type: 'text', defaultVal: 'View Portfolio' },
      { key: 'hero-bg-video', label: 'Background Video', selector: '.hero-video-bg source', type: 'video', attr: 'src', defaultVal: '' }
    ],
    logos: [
      { key: 'logos-title', label: 'Section Title', selector: '.logos-section .section-title', type: 'text', defaultVal: 'Trusted by Leading Organizations' },
      { key: 'logos-subtitle', label: 'Subtitle', selector: '.logos-section .section-subtitle', type: 'textarea', defaultVal: 'Cahit Trading & Contracting LLC partners with...' }
    ],
    'about-preview': [
      { key: 'about-title', label: 'Section Title', selector: '.about-text .section-title', type: 'text', defaultVal: 'Engineering the Foundations of Tomorrow' },
      { key: 'about-p1', label: 'Paragraph 1', selector: '.about-text p:nth-of-type(1)', type: 'textarea', defaultVal: '' },
      { key: 'about-p2', label: 'Paragraph 2', selector: '.about-text p:nth-of-type(2)', type: 'textarea', defaultVal: '' },
      { key: 'about-p3', label: 'Paragraph 3', selector: '.about-text p:nth-of-type(3)', type: 'textarea', defaultVal: '' },
      { key: 'about-btn', label: 'Button Text', selector: '.about-text .btn-sky', type: 'text', defaultVal: 'Discover Our Company' },
      { key: 'about-video', label: 'About Video', selector: '.about-video source', type: 'video', attr: 'src', defaultVal: '' }
    ],
    services: [
      { key: 'services-title', label: 'Section Title', selector: '#services-section .section-title', type: 'text', defaultVal: 'Our Services' },
      { key: 'services-subtitle', label: 'Subtitle', selector: '#services-section .section-subtitle', type: 'textarea', defaultVal: 'Our diverse expertise allows us to support...' },
      { key: 'services-bg-video', label: 'Background Video', selector: '#services-section .section-video-bg source', type: 'video', attr: 'src', defaultVal: '' }
    ],
    marine: [
      { key: 'marine-title', label: 'Section Title', selector: '.marine-title', type: 'text', defaultVal: 'Specialists in Marine & Coastal Infrastructure' },
      { key: 'marine-subtitle', label: 'Subtitle', selector: '.marine-subtitle', type: 'textarea', defaultVal: 'Cahit Trading & Contracting LLC is recognized...' },
      { key: 'marine-footer', label: 'Footer Text', selector: '.marine-footer-text', type: 'textarea', defaultVal: 'Through advanced engineering practices...' },
      { key: 'marine-bg-video', label: 'Background Video', selector: '.marine-section .section-video-bg source', type: 'video', attr: 'src', defaultVal: '' }
    ],
    stats: [
      { key: 'stats-title', label: 'Section Title', selector: '#stats-section .section-title', type: 'text', defaultVal: 'Delivering Infrastructure Excellence' }
    ],
    projects: [
      { key: 'projects-title', label: 'Section Title', selector: '#projects-section .section-title', type: 'text', defaultVal: 'Selected Projects' },
      { key: 'projects-img1', label: 'Project Image 1', selector: '.project-card:nth-child(1) img', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-img2', label: 'Project Image 2', selector: '.project-card:nth-child(2) img', type: 'image', attr: 'src', defaultVal: '' }
    ],
    leadership: [
      { key: 'leadership-title', label: 'Section Title', selector: '.leadership-section .section-title', type: 'text', defaultVal: 'Leadership' }
    ],
    cta: [
      { key: 'cta-title', label: 'CTA Title', selector: '.cta-title', type: 'text', defaultVal: 'Start Your Next Project' },
      { key: 'cta-subtitle', label: 'CTA Subtitle', selector: '.cta-subtitle', type: 'textarea', defaultVal: '' }
    ],
    header: [
      { key: 'header-logo', label: 'Navigation Logo', selector: '.navbar-logo .logo-img', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'header-brand', label: 'Brand Name', selector: '.nav-brand-text', type: 'text', defaultVal: 'CAHIT CONTRACTING' }
    ],
    footer: [
      { key: 'footer-logo', label: 'Footer Logo', selector: '.footer-logo', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'footer-desc', label: 'Company Description', selector: '.footer-desc', type: 'textarea', defaultVal: '' },
      { key: 'footer-tagline', label: 'Tagline', selector: '.footer-tagline', type: 'text', defaultVal: 'A Solid Ground For Your Project' }
    ],
    'blog-hero': [
      { key: 'blog-hero-title', label: 'Blog Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Blog' },
      { key: 'blog-hero-subtitle', label: 'Blog Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: 'Insights, news, and updates from the Cahit Trading & Contracting team.' },
      { key: 'blog-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'blog-posts': [
      { key: 'blog-section-title', label: 'Section Title', selector: '.section-title', type: 'text', defaultVal: 'Latest Posts' },
      { key: 'blog-section-subtitle', label: 'Section Subtitle', selector: '.section-subtitle', type: 'textarea', defaultVal: 'Stay up to date with our latest projects, industry insights, and company news.' }
    ],
    'about-hero': [
      { key: 'about-hero-title', label: 'About Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'About Us' },
      { key: 'about-hero-subtitle', label: 'About Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: '' },
      { key: 'about-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'services-hero': [
      { key: 'services-hero-title', label: 'Services Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Our Services' },
      { key: 'services-hero-subtitle', label: 'Services Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: '' },
      { key: 'services-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'projects-hero': [
      { key: 'projects-hero-title', label: 'Projects Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Our Projects' },
      { key: 'projects-hero-subtitle', label: 'Projects Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: '' },
      { key: 'projects-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'careers-hero': [
      { key: 'careers-hero-title', label: 'Careers Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Careers' },
      { key: 'careers-hero-subtitle', label: 'Careers Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: '' },
      { key: 'careers-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'clients-hero': [
      { key: 'clients-hero-title', label: 'Clients Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Our Clients' },
      { key: 'clients-hero-subtitle', label: 'Clients Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: '' },
      { key: 'clients-hero-bg', label: 'Hero Background Image', selector: '.hero-banner-bg', type: 'image', attr: 'src', defaultVal: '' }
    ]
  };

  var sectionScrollTargets = {
    hero: '.hero-section', logos: '.logos-section', 'about-preview': '.about-preview-section',
    services: '#services-section', marine: '.marine-section', stats: '#stats-section',
    projects: '#projects-section', leadership: '.leadership-section', cta: '.cta-section',
    header: 'header', footer: 'footer',
    'blog-hero': '.hero-banner', 'blog-posts': '.section',
    'about-hero': '.hero-banner', 'services-hero': '.hero-banner',
    'projects-hero': '.hero-banner', 'careers-hero': '.hero-banner', 'clients-hero': '.hero-banner'
  };

  var pageSections = {
    '/': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'hero', name: 'Hero Section', group: 'Page Sections' },
      { id: 'logos', name: 'Logo Marquee', group: 'Page Sections' },
      { id: 'about-preview', name: 'About Preview', group: 'Page Sections' },
      { id: 'services', name: 'Services Grid', group: 'Page Sections' },
      { id: 'marine', name: 'Marine Capabilities', group: 'Page Sections' },
      { id: 'stats', name: 'Statistics', group: 'Page Sections' },
      { id: 'projects', name: 'Projects Showcase', group: 'Page Sections' },
      { id: 'leadership', name: 'Leadership', group: 'Page Sections' },
      { id: 'cta', name: 'Call to Action', group: 'Page Sections' }
    ],
    '/blog': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'blog-hero', name: 'Blog Hero Banner', group: 'Page Sections' },
      { id: 'blog-posts', name: 'Blog Posts Section', group: 'Page Sections' }
    ],
    '/about': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'about-hero', name: 'About Hero Banner', group: 'Page Sections' }
    ],
    '/services': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'services-hero', name: 'Services Hero Banner', group: 'Page Sections' }
    ],
    '/projects': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'projects-hero', name: 'Projects Hero Banner', group: 'Page Sections' }
    ],
    '/clients': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'clients-hero', name: 'Clients Hero Banner', group: 'Page Sections' }
    ],
    '/careers': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'careers-hero', name: 'Careers Hero Banner', group: 'Page Sections' }
    ]
  };

  function renderContentEditor() {
    var currentPath = state.editingPage || '/';
    var currentPageObj = state.pages.find(function(p) { return p.path === currentPath; }) || state.pages[0];

    var sections = pageSections[currentPath] || pageSections['/'];

    var sectionsList = '';
    var currentGroup = '';
    sections.forEach(function(s) {
      if (s.group !== currentGroup) {
        sectionsList += '<div class="section-group-title">' + s.group + '</div>';
        currentGroup = s.group;
      }
      sectionsList += '<div class="section-item' + (s.id === state.editingSection ? ' active' : '') + '" data-section="' + s.id + '">' +
        '<span>' + s.name + '</span>' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</div>';
    });

    var fields = sectionFields[state.editingSection] || [];
    var fieldsHtml = '';
    if (fields.length > 0) {
      fields.forEach(function(f) {
        var val = state.editedContent[f.key] || f.defaultVal;
        if (f.type === 'image') {
          var previewSrc = val || '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + '</label>' +
            '<div class="media-upload-field" data-testid="upload-' + f.key + '">' +
              (previewSrc ? '<div class="upload-preview"><img src="' + previewSrc + '" class="upload-preview-img" /><button class="upload-remove-btn" data-key="' + f.key + '" data-selector="' + f.selector + '" title="Remove">&times;</button></div>' : '') +
              '<div class="upload-drop-area" data-key="' + f.key + '" data-selector="' + f.selector + '" data-attr="' + (f.attr || 'src') + '" data-accept="image/*">' +
                '<input type="file" class="upload-file-input" accept="image/*" data-key="' + f.key + '" data-selector="' + f.selector + '" data-attr="' + (f.attr || 'src') + '" data-testid="input-upload-' + f.key + '" />' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
                '<span>Click to upload or drag image</span>' +
              '</div>' +
            '</div></div>';
        } else if (f.type === 'video') {
          var videoSrc = val || '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + '</label>' +
            '<div class="media-upload-field" data-testid="upload-' + f.key + '">' +
              (videoSrc ? '<div class="upload-preview"><video src="' + videoSrc + '" class="upload-preview-video" muted></video><button class="upload-remove-btn" data-key="' + f.key + '" data-selector="' + f.selector + '" title="Remove">&times;</button></div>' : '') +
              '<div class="upload-drop-area" data-key="' + f.key + '" data-selector="' + f.selector + '" data-attr="' + (f.attr || 'src') + '" data-accept="video/*">' +
                '<input type="file" class="upload-file-input" accept="video/*" data-key="' + f.key + '" data-selector="' + f.selector + '" data-attr="' + (f.attr || 'src') + '" data-testid="input-upload-' + f.key + '" />' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
                '<span>Click to upload or drag video</span>' +
              '</div>' +
            '</div></div>';
        } else if (f.type === 'textarea') {
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + '</label>' +
            '<textarea class="form-textarea live-edit-field" data-key="' + f.key + '" data-selector="' + f.selector + '" data-testid="field-' + f.key + '">' + val + '</textarea></div>';
        } else {
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + '</label>' +
            '<input class="form-input live-edit-field" data-key="' + f.key + '" data-selector="' + f.selector + '" value="' + val.replace(/"/g, '&quot;') + '" data-testid="field-' + f.key + '" /></div>';
        }
      });
    } else {
      fieldsHtml = '<div class="empty-state" style="padding:20px"><div class="empty-state-title">Select a section</div><div>Choose a section to edit its content</div></div>';
    }

    var currentSectionName = '';
    sections.forEach(function(s) { if (s.id === state.editingSection) currentSectionName = s.name; });

    return '' +
      '<div class="toolbar">' +
        '<select class="form-select" style="width:180px" id="pageSelector" data-testid="select-page">' +
          state.pages.map(function(p) {
            return '<option value="' + p.path + '"' + (p.path === currentPath ? ' selected' : '') + '>' + p.name + '</option>';
          }).join('') +
        '</select>' +
        '<div class="viewport-switcher" data-testid="viewport-switcher">' +
          '<button class="viewport-btn' + (state.viewport === 'desktop' ? ' active' : '') + '" data-viewport="desktop" title="Desktop" data-testid="btn-viewport-desktop"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></button>' +
          '<button class="viewport-btn' + (state.viewport === 'tablet' ? ' active' : '') + '" data-viewport="tablet" title="Tablet" data-testid="btn-viewport-tablet"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></button>' +
          '<button class="viewport-btn' + (state.viewport === 'mobile' ? ' active' : '') + '" data-viewport="mobile" title="Mobile" data-testid="btn-viewport-mobile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></button>' +
        '</div>' +
        '<div class="toolbar-spacer"></div>' +
        '<button class="btn ' + (state.dragMode ? 'btn-primary' : 'btn-outline') + '" id="toggleDragBtn" data-testid="button-toggle-drag" title="' + (state.dragMode ? 'Drag mode active — click elements in preview to move them' : 'Enable drag mode to reposition elements') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>' +
          (state.dragMode ? ' Drag On' : ' Drag') + '</button>' +
        '<button class="btn ' + (state.funnelDisabled ? 'btn-outline funnel-off' : 'btn-primary funnel-on') + '" id="toggleFunnelBtn" data-testid="button-toggle-funnel" title="' + (state.funnelDisabled ? 'Lead funnel disabled in preview' : 'Lead funnel enabled in preview') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>' +
          (state.funnelDisabled ? ' Funnel Off' : ' Funnel On') + '</button>' +
        '<button class="btn btn-outline" id="refreshPreviewBtn" data-testid="button-refresh-preview" title="Refresh Preview"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>' +
        '<button class="btn btn-primary" id="saveContentBtn" data-testid="button-save-content">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</button>' +
      '</div>' +
      '<div class="editor-layout-3">' +
        '<div class="editor-sections card">' +
          '<div class="card-header"><span class="card-title">Sections</span></div>' +
          '<div class="card-body" style="padding:8px">' + sectionsList + '</div>' +
        '</div>' +
        '<div class="editor-fields card">' +
          '<div class="card-header"><span class="card-title">' + (currentSectionName || 'Editor') + '</span></div>' +
          '<div class="card-body" id="editorFieldsBody">' + fieldsHtml + '</div>' +
        '</div>' +
        '<div class="editor-preview">' +
          '<div class="editor-preview-header">' +
            '<span class="preview-dot"></span>' +
            '<span>Live Preview &mdash; ' + currentPageObj.name + '</span>' +
            '<span class="preview-viewport-label" id="viewportLabel">' + (state.viewport || 'Desktop') + '</span>' +
          '</div>' +
          '<div class="preview-frame-wrap" id="previewWrap">' +
            '<iframe src="' + currentPath + (state.funnelDisabled ? '?disable_funnel=1' : '') + '" id="previewFrame" data-testid="iframe-preview" class="preview-frame-' + (state.viewport || 'desktop') + '"></iframe>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function bindEditorActions() {
    document.querySelectorAll('.section-item').forEach(function(el) {
      el.addEventListener('click', function() {
        document.querySelectorAll('.section-item').forEach(function(s) { s.classList.remove('active'); });
        this.classList.add('active');
        state.editingSection = this.getAttribute('data-section');
        renderPage('content');
        bindEditorActions();
        scrollPreviewToSection(state.editingSection);
      });
    });

    document.querySelectorAll('.viewport-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.viewport-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        state.viewport = this.getAttribute('data-viewport');
        var iframe = document.getElementById('previewFrame');
        if (iframe) {
          iframe.className = 'preview-frame-' + state.viewport;
        }
        var label = document.getElementById('viewportLabel');
        if (label) label.textContent = state.viewport.charAt(0).toUpperCase() + state.viewport.slice(1);
      });
    });

    document.querySelectorAll('.live-edit-field').forEach(function(field) {
      field.addEventListener('input', function() {
        var key = this.getAttribute('data-key');
        var selector = this.getAttribute('data-selector');
        var value = this.value;
        state.editedContent[key] = value;
        updatePreviewElement(selector, value, key);
      });
    });

    var pageSelector = document.getElementById('pageSelector');
    if (pageSelector) {
      pageSelector.addEventListener('change', function() {
        state.editingPage = this.value;
        state.editingSection = null;
        state.editedContent = {};
        renderPage('content');
        bindEditorActions();
      });
    }

    var saveBtn = document.getElementById('saveContentBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var section = state.editingSection || 'hero';
        var data = {};
        var fields = sectionFields[section] || [];
        fields.forEach(function(f) {
          if (state.editedContent[f.key] !== undefined) {
            data[f.key] = state.editedContent[f.key];
          }
        });
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving...';
        fetch('/admin/api/site-content/' + section, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: data })
        }).then(function(r) { return r.json(); }).then(function(result) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save';
          if (result.success) {
            showToast('Content saved successfully', 'success');
          } else {
            showToast('Error saving: ' + (result.error || 'Unknown error'), 'error');
          }
        }).catch(function(err) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save';
          showToast('Error saving content', 'error');
        });
      });
    }

    var toggleDragBtn = document.getElementById('toggleDragBtn');
    if (toggleDragBtn) {
      toggleDragBtn.addEventListener('click', function() {
        state.dragMode = !state.dragMode;
        this.className = 'btn ' + (state.dragMode ? 'btn-primary' : 'btn-outline');
        this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>' + (state.dragMode ? ' Drag On' : ' Drag');
        injectDragSystem();
        showToast(state.dragMode ? 'Drag mode enabled — click elements to move them' : 'Drag mode disabled', 'success');
      });
    }

    var toggleFunnelBtn = document.getElementById('toggleFunnelBtn');
    if (toggleFunnelBtn) {
      toggleFunnelBtn.addEventListener('click', function() {
        state.funnelDisabled = !state.funnelDisabled;
        var btn = document.getElementById('toggleFunnelBtn');
        if (btn) {
          btn.className = 'btn ' + (state.funnelDisabled ? 'btn-outline funnel-off' : 'btn-primary funnel-on');
          btn.title = state.funnelDisabled ? 'Lead funnel disabled in preview' : 'Lead funnel enabled in preview';
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>' + (state.funnelDisabled ? ' Funnel Off' : ' Funnel On');
        }
        var iframe = document.getElementById('previewFrame');
        if (iframe) {
          var path = state.editingPage || '/';
          iframe.src = path + (state.funnelDisabled ? '?disable_funnel=1' : '');
        }
        showToast(state.funnelDisabled ? 'Lead funnel disabled in preview' : 'Lead funnel enabled in preview', 'success');
      });
    }

    var refreshBtn = document.getElementById('refreshPreviewBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        var iframe = document.getElementById('previewFrame');
        if (iframe) iframe.src = iframe.src;
      });
    }

    var iframe = document.getElementById('previewFrame');
    if (iframe) {
      iframe.addEventListener('load', function() {
        populateFieldsFromPreview();
        highlightPreviewSection(state.editingSection);
        loadSavedSectionContent(state.editingSection);
        if (state.dragMode) {
          setTimeout(function() { injectDragSystem(); }, 300);
        }
      });
    }

    document.querySelectorAll('.upload-drop-area').forEach(function(area) {
      area.addEventListener('click', function() {
        var input = this.querySelector('.upload-file-input');
        if (input) input.click();
      });
      area.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
      });
      area.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
      });
      area.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        var files = e.dataTransfer.files;
        if (files.length > 0) {
          uploadFile(files[0], this.getAttribute('data-key'), this.getAttribute('data-selector'), this.getAttribute('data-attr'));
        }
      });
    });

    document.querySelectorAll('.upload-file-input').forEach(function(input) {
      input.addEventListener('click', function(e) { e.stopPropagation(); });
      input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          uploadFile(this.files[0], this.getAttribute('data-key'), this.getAttribute('data-selector'), this.getAttribute('data-attr'));
        }
      });
    });

    document.querySelectorAll('.upload-remove-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = this.getAttribute('data-key');
        state.editedContent[key] = '';
        renderPage('content');
        bindEditorActions();
        showToast('Media removed', 'success');
      });
    });
  }

  function uploadFile(file, key, selector, attr) {
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    if (!token) { showToast('Not authenticated', 'error'); return; }

    var maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) { showToast('File too large (max 50MB)', 'error'); return; }

    var formData = new FormData();
    formData.append('file', file);

    var uploadArea = document.querySelector('[data-key="' + key + '"].upload-drop-area');
    if (uploadArea) {
      uploadArea.classList.add('uploading');
      var span = uploadArea.querySelector('span');
      if (span) span.textContent = 'Uploading...';
    }

    fetch('/admin/api/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        state.editedContent[key] = data.url;
        updatePreviewAttr(selector, attr, data.url);
        renderPage('content');
        bindEditorActions();
        showToast('Uploaded: ' + data.name, 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    })
    .catch(function() {
      showToast('Upload failed', 'error');
    });
  }

  function updatePreviewAttr(selector, attr, value) {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    try {
      var el = iframe.contentDocument.querySelector(selector);
      if (el) {
        el.setAttribute(attr, value);
        if (el.tagName === 'SOURCE') {
          var parent = el.parentElement;
          if (parent && parent.tagName === 'VIDEO') {
            parent.load();
          }
        }
        el.style.outline = '2px solid #0ea5e9';
        el.style.outlineOffset = '2px';
        setTimeout(function() { el.style.outline = ''; el.style.outlineOffset = ''; }, 1200);
      }
    } catch(e) {}
  }

  function injectDragSystem() {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    var doc = iframe.contentDocument;

    var existing = doc.getElementById('admin-drag-system');
    if (existing) existing.remove();
    var existingStyle = doc.getElementById('admin-drag-style');
    if (existingStyle) existingStyle.remove();

    if (!state.dragMode) {
      doc.querySelectorAll('.drag-enabled').forEach(function(el) {
        el.classList.remove('drag-enabled');
        el.style.cursor = '';
      });
      return;
    }

    var style = doc.createElement('style');
    style.id = 'admin-drag-style';
    style.textContent =
      '.drag-enabled{cursor:move!important;outline:1px dashed rgba(14,165,233,.4)!important;outline-offset:2px!important;transition:outline .15s!important}' +
      '.drag-enabled:hover{outline:2px solid #0ea5e9!important;outline-offset:2px!important}' +
      '.drag-selected{outline:2px solid #0ea5e9!important;outline-offset:2px!important;box-shadow:0 0 0 4px rgba(14,165,233,.2)!important}' +
      '.drag-guide-h,.drag-guide-v{position:fixed!important;z-index:99999!important;pointer-events:none!important;background:#f43f5e!important}' +
      '.drag-guide-h{height:1px!important;left:0!important;right:0!important}' +
      '.drag-guide-v{width:1px!important;top:0!important;bottom:0!important}' +
      '.drag-pos-badge{position:fixed!important;z-index:99999!important;background:#0f172a!important;color:#fff!important;font-size:11px!important;padding:2px 8px!important;border-radius:4px!important;pointer-events:none!important;font-family:monospace!important;white-space:nowrap!important}' +
      '.drag-handle-overlay{position:fixed!important;z-index:99998!important;pointer-events:none!important;border:2px solid #0ea5e9!important;border-radius:4px!important}' +
      '.drag-handle-corner{position:absolute!important;width:8px!important;height:8px!important;background:#0ea5e9!important;border:1px solid #fff!important;border-radius:2px!important;pointer-events:none!important}';
    doc.head.appendChild(style);

    var script = doc.createElement('script');
    script.id = 'admin-drag-system';
    script.textContent = '(' + (function() {
      var DRAG_SELECTORS = [
        '.navbar-logo', '.logo-img', '.nav-brand-text',
        '.hero-title', '.hero-subtitle', '.hero-buttons',
        '.section-title', '.section-subtitle',
        '.about-video', '.about-text',
        '.service-card', '.service-card-img',
        '.marine-title', '.marine-subtitle',
        '.project-card', '.project-card img',
        '.leader-card', '.leader-video',
        '.stat-item',
        '.cta-title', '.cta-subtitle',
        '.footer-logo', '.footer-desc',
        '.marquee-logo-img',
        'img', 'video'
      ];

      var selected = null;
      var dragging = false;
      var startX = 0, startY = 0;
      var origLeft = 0, origTop = 0;
      var origTransform = '';
      var guides = [];
      var posBadge = null;
      var handleOverlay = null;
      var SNAP_THRESHOLD = 6;

      function getAllDraggable() {
        var all = [];
        DRAG_SELECTORS.forEach(function(sel) {
          try {
            document.querySelectorAll(sel).forEach(function(el) {
              if (all.indexOf(el) === -1 && el.offsetWidth > 10 && el.offsetHeight > 10) {
                all.push(el);
              }
            });
          } catch(e) {}
        });
        return all;
      }

      function enableDraggables() {
        getAllDraggable().forEach(function(el) {
          el.classList.add('drag-enabled');
        });
      }

      function getElCenter(el) {
        var r = el.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, rect: r };
      }

      function showGuides(el) {
        clearGuides();
        var me = getElCenter(el);
        var others = getAllDraggable().filter(function(o) { return o !== el && o !== el.parentElement && !el.contains(o); });
        var parent = el.parentElement;
        var parentR = parent ? parent.getBoundingClientRect() : null;
        var viewW = window.innerWidth;

        others.forEach(function(other) {
          var ot = getElCenter(other);
          if (Math.abs(me.cy - ot.cy) < SNAP_THRESHOLD) {
            createGuide('h', ot.cy);
          }
          if (Math.abs(me.rect.top - ot.rect.top) < SNAP_THRESHOLD) {
            createGuide('h', ot.rect.top);
          }
          if (Math.abs(me.rect.bottom - ot.rect.bottom) < SNAP_THRESHOLD) {
            createGuide('h', ot.rect.bottom);
          }
          if (Math.abs(me.cx - ot.cx) < SNAP_THRESHOLD) {
            createGuide('v', ot.cx);
          }
          if (Math.abs(me.rect.left - ot.rect.left) < SNAP_THRESHOLD) {
            createGuide('v', ot.rect.left);
          }
          if (Math.abs(me.rect.right - ot.rect.right) < SNAP_THRESHOLD) {
            createGuide('v', ot.rect.right);
          }
        });

        if (parentR) {
          var parentCx = parentR.left + parentR.width / 2;
          if (Math.abs(me.cx - parentCx) < SNAP_THRESHOLD) {
            createGuide('v', parentCx);
          }
        }
        if (Math.abs(me.cx - viewW / 2) < SNAP_THRESHOLD * 2) {
          createGuide('v', viewW / 2);
        }
      }

      function createGuide(dir, pos) {
        for (var i = 0; i < guides.length; i++) {
          var g = guides[i];
          if (g.dir === dir && Math.abs(parseFloat(g.el.style[dir === 'h' ? 'top' : 'left']) - pos) < 2) return;
        }
        var line = document.createElement('div');
        line.className = dir === 'h' ? 'drag-guide-h' : 'drag-guide-v';
        if (dir === 'h') { line.style.top = pos + 'px'; }
        else { line.style.left = pos + 'px'; }
        document.body.appendChild(line);
        guides.push({ el: line, dir: dir });
      }

      function clearGuides() {
        guides.forEach(function(g) { g.el.remove(); });
        guides = [];
      }

      function showPosBadge(el) {
        if (!posBadge) {
          posBadge = document.createElement('div');
          posBadge.className = 'drag-pos-badge';
          document.body.appendChild(posBadge);
        }
        var r = el.getBoundingClientRect();
        var cs = window.getComputedStyle(el);
        var t = cs.transform || cs.webkitTransform || 'none';
        var tx = 0, ty = 0;
        if (t !== 'none') {
          var m = t.match(/matrix\((.+)\)/);
          if (m) {
            var v = m[1].split(',');
            tx = Math.round(parseFloat(v[4]) || 0);
            ty = Math.round(parseFloat(v[5]) || 0);
          }
        }
        posBadge.textContent = 'x:' + tx + ' y:' + ty + ' | ' + Math.round(r.width) + '\u00d7' + Math.round(r.height);
        posBadge.style.top = (r.top - 28) + 'px';
        posBadge.style.left = r.left + 'px';
      }

      function hidePosBadge() {
        if (posBadge) { posBadge.remove(); posBadge = null; }
      }

      function showHandleOverlay(el) {
        hideHandleOverlay();
        var r = el.getBoundingClientRect();
        handleOverlay = document.createElement('div');
        handleOverlay.className = 'drag-handle-overlay';
        handleOverlay.style.top = r.top + 'px';
        handleOverlay.style.left = r.left + 'px';
        handleOverlay.style.width = r.width + 'px';
        handleOverlay.style.height = r.height + 'px';

        var corners = [
          { t: '-4px', l: '-4px' },
          { t: '-4px', l: (r.width - 4) + 'px' },
          { t: (r.height - 4) + 'px', l: '-4px' },
          { t: (r.height - 4) + 'px', l: (r.width - 4) + 'px' }
        ];
        corners.forEach(function(c) {
          var dot = document.createElement('div');
          dot.className = 'drag-handle-corner';
          dot.style.top = c.t;
          dot.style.left = c.l;
          handleOverlay.appendChild(dot);
        });
        document.body.appendChild(handleOverlay);
      }

      function hideHandleOverlay() {
        if (handleOverlay) { handleOverlay.remove(); handleOverlay = null; }
      }

      function onMouseDown(e) {
        var el = e.target.closest('.drag-enabled');
        if (!el) return;
        e.preventDefault();
        e.stopPropagation();

        if (selected && selected !== el) {
          selected.classList.remove('drag-selected');
        }
        selected = el;
        selected.classList.add('drag-selected');
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;

        var cs = window.getComputedStyle(el);
        origTransform = cs.transform || cs.webkitTransform || 'none';
        if (origTransform === 'none') origTransform = '';
        var tx = 0, ty = 0;
        if (origTransform) {
          var m = origTransform.match(/matrix\((.+)\)/);
          if (m) {
            var v = m[1].split(',');
            tx = parseFloat(v[4]) || 0;
            ty = parseFloat(v[5]) || 0;
          }
        }
        origLeft = tx;
        origTop = ty;

        showHandleOverlay(el);
        showPosBadge(el);
      }

      function onMouseMove(e) {
        if (!dragging || !selected) return;
        e.preventDefault();
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        var nx = origLeft + dx;
        var ny = origTop + dy;
        selected.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        selected.style.position = selected.style.position || 'relative';
        showGuides(selected);
        showPosBadge(selected);
        showHandleOverlay(selected);
      }

      function onMouseUp() {
        if (dragging && selected) {
          dragging = false;
          clearGuides();
          showPosBadge(selected);
          setTimeout(function() { hidePosBadge(); }, 1500);
          window.parent.postMessage({
            type: 'elementMoved',
            tag: selected.tagName,
            className: selected.className,
            transform: selected.style.transform
          }, '*');
        }
      }

      enableDraggables();
      document.addEventListener('mousedown', onMouseDown, true);
      document.addEventListener('mousemove', onMouseMove, true);
      document.addEventListener('mouseup', onMouseUp, true);
    }).toString() + ')();';

    doc.body.appendChild(script);
  }

  function scrollPreviewToSection(sectionId) {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    var target = sectionScrollTargets[sectionId];
    if (!target) return;
    try {
      var el = iframe.contentDocument.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch(e) {}
    highlightPreviewSection(sectionId);
  }

  function highlightPreviewSection(sectionId) {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    var target = sectionScrollTargets[sectionId];
    if (!target) return;
    try {
      var doc = iframe.contentDocument;
      var existing = doc.querySelectorAll('.admin-highlight-overlay');
      existing.forEach(function(e) { e.remove(); });
      var el = doc.querySelector(target);
      if (el) {
        el.style.outline = '2px solid #0ea5e9';
        el.style.outlineOffset = '-2px';
        el.style.transition = 'outline 0.3s';
        setTimeout(function() { el.style.outline = ''; el.style.outlineOffset = ''; }, 2000);
      }
    } catch(e) {}
  }

  function updatePreviewElement(selector, value, key) {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    try {
      var el = iframe.contentDocument.querySelector(selector);
      if (el) {
        el.textContent = value;
        el.style.outline = '2px solid #0ea5e9';
        el.style.outlineOffset = '2px';
        setTimeout(function() { el.style.outline = ''; el.style.outlineOffset = ''; }, 800);
      }
    } catch(e) {}
  }

  function populateFieldsFromPreview() {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    var fields = sectionFields[state.editingSection] || [];
    fields.forEach(function(f) {
      if (state.editedContent[f.key]) return;
      try {
        var el = iframe.contentDocument.querySelector(f.selector);
        if (el) {
          var inputEl = document.querySelector('[data-key="' + f.key + '"]');
          if (inputEl && !inputEl.value) {
            var text = el.textContent.trim();
            inputEl.value = text;
            state.editedContent[f.key] = text;
          }
        }
      } catch(e) {}
    });
  }

  function renderMedia() {
    var items = '';
    state.mediaItems.forEach(function(m, i) {
      var thumb = '';
      if (m.type === 'image' && m.url) {
        thumb = '<img src="' + m.url + '" alt="' + m.name + '" />';
      } else if (m.type === 'image' && mediaImages[m.name]) {
        thumb = '<img src="' + BASE_URL + mediaImages[m.name] + '" alt="' + m.name + '" />';
      } else if (m.type === 'video') {
        thumb = '<div style="width:100%;height:140px;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#94a3b8">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>';
      } else {
        thumb = '<div style="width:100%;height:140px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
      }
      var copyBtn = m.url ? '<button class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText(window.location.origin+\'' + m.url + '\');this.textContent=\'Copied!\';setTimeout(function(){},1000)" style="font-size:11px;padding:2px 6px;margin-top:4px" data-testid="btn-copy-url-' + i + '">Copy URL</button>' : '';
      items += '<div class="media-item" data-testid="media-item-' + i + '">' + thumb +
        '<div class="media-item-info"><div class="media-item-name">' + m.name + '</div><div class="media-item-size">' + m.size + ' &middot; ' + m.date + '</div>' + copyBtn + '</div></div>';
    });

    return '' +
      '<div class="toolbar">' +
        '<span style="font-size:14px;color:var(--text-muted)">' + state.mediaItems.length + ' files</span>' +
        '<div class="toolbar-spacer"></div>' +
        '<button class="btn btn-primary" id="uploadBtn" data-testid="button-upload-media">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          'Upload</button>' +
      '</div>' +
      '<div class="media-upload" id="dropZone" data-testid="drop-zone">' +
        '<div class="media-upload-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>' +
        '<div class="media-upload-text">Drag & drop files here or click to browse</div>' +
      '</div>' +
      '<div style="margin-top:20px"></div>' +
      '<div class="media-grid">' + items + '</div>';
  }

  function bindMediaActions() {
    var dropZone = document.getElementById('dropZone');
    if (dropZone) {
      dropZone.addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,video/*';
        input.addEventListener('change', function() {
          handleFileUpload(this.files);
        });
        input.click();
      });
      dropZone.addEventListener('dragover', function(e) { e.preventDefault(); this.style.borderColor = 'var(--primary)'; });
      dropZone.addEventListener('dragleave', function() { this.style.borderColor = ''; });
      dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        handleFileUpload(e.dataTransfer.files);
      });
    }
  }

  function handleFileUpload(files) {
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    var uploaded = 0;
    var total = files.length;
    for (var i = 0; i < files.length; i++) {
      (function(file) {
        var formData = new FormData();
        formData.append('file', file);
        fetch('/admin/api/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          uploaded++;
          if (d.success) {
            state.mediaItems.unshift({
              name: d.name || file.name,
              type: file.type.startsWith('image') ? 'image' : 'video',
              size: ((d.size || file.size) / (1024 * 1024)).toFixed(1) + ' MB',
              date: new Date().toISOString().split('T')[0],
              url: d.url
            });
          }
          if (uploaded === total) {
            showToast(total + ' file(s) uploaded', 'success');
            renderPage('media');
            bindMediaActions();
          }
        })
        .catch(function() {
          uploaded++;
          if (uploaded === total) {
            showToast('Some uploads may have failed', 'error');
            renderPage('media');
            bindMediaActions();
          }
        });
      })(files[i]);
    }
  }

  function renderLeads() {
    if (state.leads.length === 0) {
      return '' +
        '<div class="empty-state">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
          '<div class="empty-state-title">No leads yet</div>' +
          '<div>Leads from the contact form and lead funnel will appear here</div>' +
        '</div>';
    }

    var rows = '';
    state.leads.forEach(function(l, i) {
      var statusBadge = l.status === 'new' ? '<span class="badge badge-blue">New</span>' :
                        l.status === 'contacted' ? '<span class="badge badge-green">Contacted</span>' :
                        '<span class="badge badge-gray">' + (l.status || 'New') + '</span>';
      var dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';
      var actions = l.status === 'new' ?
        '<button class="btn btn-sm btn-outline" onclick="markLeadStatus(' + l.id + ', \'contacted\')" data-testid="btn-lead-contact-' + l.id + '">Mark Contacted</button>' :
        '<button class="btn btn-sm btn-outline" onclick="markLeadStatus(' + l.id + ', \'new\')" data-testid="btn-lead-new-' + l.id + '">Mark New</button>';
      rows += '<tr data-testid="lead-row-' + i + '">' +
        '<td><div class="lead-name">' + (l.name || 'Unknown') + '</div><div class="lead-email">' + (l.email || '') + '</div></td>' +
        '<td>' + (l.phone || '-') + '</td>' +
        '<td>' + (l.service_type || '-') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + dateStr + '</td>' +
        '<td>' + actions + '</td>' +
        '<td><div class="lead-details-text" style="max-width:200px;font-size:12px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + ((l.details || '').replace(/"/g, '&quot;')) + '">' + (l.details || '-') + '</div></td>' +
      '</tr>';
    });

    return '' +
      '<div class="toolbar">' +
        '<span style="font-size:14px;color:var(--text-muted)">' + state.leads.length + ' leads</span>' +
        '<div class="toolbar-spacer"></div>' +
        '<button class="btn btn-outline" onclick="location.reload()" data-testid="button-refresh-leads">Refresh</button>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-body-np leads-table-wrap">' +
          '<table class="table">' +
            '<thead><tr><th>Contact</th><th>Phone</th><th>Service</th><th>Status</th><th>Date</th><th>Action</th><th>Details</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  function renderAnalytics() {
    var barData = [45, 72, 58, 90, 65, 82, 55, 93, 70, 48, 85, 60];
    var bars = '';
    var maxVal = Math.max.apply(null, barData);
    barData.forEach(function(v) {
      bars += '<div class="chart-bar" style="height:' + Math.round((v / maxVal) * 160) + 'px" title="' + v + ' visits"></div>';
    });

    return '' +
      '<div class="stats-row">' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Page Views</span></div><div class="stat-card-value">2,847</div><div class="stat-card-change">+12.5% vs last month</div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Unique Visitors</span></div><div class="stat-card-value">1,234</div><div class="stat-card-change">+8.3% vs last month</div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Avg. Session</span></div><div class="stat-card-value">3:42</div><div class="stat-card-change">+0:23 vs last month</div></div>' +
        '<div class="stat-card"><div class="stat-card-header"><span class="stat-card-label">Bounce Rate</span></div><div class="stat-card-value">34.2%</div><div class="stat-card-change down">+2.1% vs last month</div></div>' +
      '</div>' +
      '<div class="analytics-grid">' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">Monthly Traffic</span></div>' +
          '<div class="card-body"><div class="chart-placeholder">' + bars + '</div></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">Top Pages</span></div>' +
          '<div class="card-body-np">' +
            '<table class="table">' +
              '<thead><tr><th>Page</th><th>Views</th><th>Avg. Time</th></tr></thead>' +
              '<tbody>' +
                '<tr><td>/</td><td>1,245</td><td>2:30</td></tr>' +
                '<tr><td>/services</td><td>456</td><td>3:15</td></tr>' +
                '<tr><td>/projects</td><td>389</td><td>4:02</td></tr>' +
                '<tr><td>/about</td><td>312</td><td>2:45</td></tr>' +
                '<tr><td>/clients</td><td>234</td><td>1:58</td></tr>' +
                '<tr><td>/careers</td><td>211</td><td>3:30</td></tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-header"><span class="card-title">Traffic Sources</span></div>' +
        '<div class="card-body-np">' +
          '<table class="table">' +
            '<thead><tr><th>Source</th><th>Visitors</th><th>Conversion</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>Direct</td><td>523</td><td><span class="badge badge-green">4.2%</span></td></tr>' +
              '<tr><td>Google Search</td><td>412</td><td><span class="badge badge-green">3.8%</span></td></tr>' +
              '<tr><td>LinkedIn</td><td>178</td><td><span class="badge badge-blue">2.1%</span></td></tr>' +
              '<tr><td>Referral</td><td>121</td><td><span class="badge badge-orange">1.5%</span></td></tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  function renderChatbotKnowledge() {
    return '' +
      '<div class="settings-section">' +
        '<div class="settings-title">Chatbot Knowledge Base</div>' +
        '<p class="settings-row-desc" style="margin-bottom:16px">Add custom knowledge that the AI chatbot will use when answering visitor questions. This information is combined with the default company info (services, contact details, location).</p>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Chatbot Display Settings</div>' +
        '<div class="form-group" style="margin-bottom:16px">' +
          '<label class="form-label">Default Language</label>' +
          '<select class="form-input" id="chatbot-language" data-testid="select-chatbot-language" style="max-width:250px">' +
            '<option value="en">English</option>' +
            '<option value="ar">Arabic (العربية)</option>' +
          '</select>' +
          '<p class="settings-row-desc" style="margin-top:6px">The chatbot will respond in this language by default</p>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Chatbot Position</label>' +
          '<select class="form-input" id="chatbot-position" data-testid="select-chatbot-position" style="max-width:250px">' +
            '<option value="right">Right side</option>' +
            '<option value="left">Left side</option>' +
          '</select>' +
          '<p class="settings-row-desc" style="margin-top:6px">Which side of the page the chatbot bubble appears on</p>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Custom Knowledge Entries</div>' +
        '<div id="knowledge-entries"></div>' +
        '<button class="btn btn-primary" id="addKnowledgeBtn" data-testid="button-add-knowledge" style="margin-top:12px">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          'Add Knowledge Entry' +
        '</button>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Chatbot Personality</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Tone & Behavior Instructions</label>' +
          '<textarea class="form-textarea" id="chatbot-personality" data-testid="input-chatbot-personality" rows="4" placeholder="e.g. Always greet visitors warmly. Mention ongoing promotions. Prioritize safety in all construction discussions."></textarea>' +
          '<p class="settings-row-desc" style="margin-top:6px">Guide how the chatbot responds (tone, priorities, special instructions)</p>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Test Chatbot</div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px">' +
          '<div id="test-chat-messages" style="min-height:100px;max-height:250px;overflow-y:auto;margin-bottom:12px;font-size:14px"></div>' +
          '<div style="display:flex;gap:8px">' +
            '<input class="form-input" id="test-chat-input" data-testid="input-test-chat" placeholder="Type a test message..." style="flex:1" />' +
            '<button class="btn btn-primary" id="testChatBtn" data-testid="button-test-chat">Send</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">API Integrations</div>' +
        '<div class="form-group">' +
          '<label class="form-label">OpenAI API Key</label>' +
          '<div style="position:relative">' +
            '<input class="form-input" type="password" id="chatbot-api-key" placeholder="sk-..." data-testid="input-chatbot-api-key" style="padding-right:40px" />' +
            '<button type="button" id="chatbotToggleKey" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;padding:4px" data-testid="button-toggle-chatbot-key">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
            '</button>' +
          '</div>' +
          '<p class="settings-row-desc" id="chatbot-key-status" style="margin-top:6px;color:#22c55e"></p>' +
          '<p class="settings-row-desc" style="margin-top:4px">Powers both the AI Chatbot and AI Assistant (blog generation, content suggestions). Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style="color:#0ea5e9;text-decoration:underline">platform.openai.com</a></p>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:24px;display:flex;gap:12px;align-items:center">' +
        '<button class="btn btn-primary" id="saveKnowledgeBtn" data-testid="button-save-knowledge">Save All Settings</button>' +
        '<button class="btn" id="exportKnowledgeBtn" data-testid="button-export-knowledge" style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0">Export for Vercel</button>' +
      '</div>' +
      '<div id="export-result" style="display:none;margin-top:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px">' +
        '<p class="form-label" style="margin-bottom:8px">Copy this value and add it as <strong>CHATBOT_KNOWLEDGE</strong> environment variable in Vercel:</p>' +
        '<textarea id="export-value" class="form-textarea" rows="3" readonly style="font-family:monospace;font-size:12px"></textarea>' +
        '<button class="btn" id="copyExportBtn" style="margin-top:8px;background:#0A3D6B;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer">Copy to Clipboard</button>' +
      '</div>';
  }

  function bindChatbotActions() {
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    fetch('/admin/api/chatbot-knowledge', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success) {
          var entries = d.data.entries || [];
          var personality = d.data.personality || '';
          var language = d.data.language || 'en';
          var position = d.data.position || 'right';
          var container = document.getElementById('knowledge-entries');
          if (entries.length === 0) { addKnowledgeEntry(container, '', ''); }
          else { entries.forEach(function(e) { addKnowledgeEntry(container, e.title, e.content); }); }
          var personalityEl = document.getElementById('chatbot-personality');
          if (personalityEl) personalityEl.value = personality;
          var langEl = document.getElementById('chatbot-language');
          if (langEl) langEl.value = language;
          var posEl = document.getElementById('chatbot-position');
          if (posEl) posEl.value = position;
        }
      })
      .catch(function() {
        addKnowledgeEntry(document.getElementById('knowledge-entries'), '', '');
      });

    fetch('/admin/api/openai-key-status', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var ks = document.getElementById('chatbot-key-status');
        if (ks) {
          if (d.hasKey) { ks.textContent = 'Key configured: ' + d.maskedKey; ks.style.color = '#22c55e'; }
          else { ks.textContent = 'No API key configured'; ks.style.color = '#ef4444'; }
        }
      }).catch(function() {});

    var toggleKeyBtn = document.getElementById('chatbotToggleKey');
    var keyInput = document.getElementById('chatbot-api-key');
    if (toggleKeyBtn && keyInput) {
      toggleKeyBtn.addEventListener('click', function() {
        if (keyInput.type === 'password') {
          keyInput.type = 'text';
          toggleKeyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        } else {
          keyInput.type = 'password';
          toggleKeyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
      });
    }

    document.getElementById('addKnowledgeBtn').addEventListener('click', function() {
      addKnowledgeEntry(document.getElementById('knowledge-entries'), '', '');
    });

    document.getElementById('saveKnowledgeBtn').addEventListener('click', function() {
      var entries = [];
      document.querySelectorAll('.knowledge-entry').forEach(function(el) {
        var title = el.querySelector('.knowledge-title').value.trim();
        var content = el.querySelector('.knowledge-content').value.trim();
        if (title || content) entries.push({ title: title, content: content });
      });
      var personality = (document.getElementById('chatbot-personality') || {}).value || '';
      var language = (document.getElementById('chatbot-language') || {}).value || 'en';
      var position = (document.getElementById('chatbot-position') || {}).value || 'right';
      var apiKeyVal = (document.getElementById('chatbot-api-key') || {}).value || '';
      var btn = document.getElementById('saveKnowledgeBtn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      var savePromises = [
        fetch('/admin/api/chatbot-knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ entries: entries, personality: personality.trim(), language: language, position: position })
        }).then(function(r) {
          if (r.status === 401) return { success: false, message: 'Session expired' };
          return r.json();
        })
      ];
      if (apiKeyVal.trim()) {
        savePromises.push(
          fetch('/admin/api/save-openai-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ key: apiKeyVal.trim() })
          }).then(function(r) {
            if (r.status === 401) return { success: false, message: 'Session expired' };
            return r.json();
          })
        );
      }
      Promise.all(savePromises)
      .then(function(results) {
        btn.disabled = false;
        btn.textContent = 'Save All Settings';
        var hasAuthError = results.some(function(d) { return d.success === false && d.message === 'Session expired'; });
        if (hasAuthError) {
          showToast('Session expired. Please log in again.', 'error');
          setTimeout(function() { window.location.href = '/admin/login'; }, 1500);
          return;
        }
        var allOk = results.every(function(d) { return d.success; });
        if (allOk) {
          showToast('All settings saved successfully', 'success');
          if (apiKeyVal.trim()) {
            var ks = document.getElementById('chatbot-key-status');
            if (ks) { ks.textContent = 'Key configured: sk-...' + apiKeyVal.trim().slice(-4); ks.style.color = '#22c55e'; }
            document.getElementById('chatbot-api-key').value = '';
          }
        } else {
          var failedMsgs = results.filter(function(d) { return !d.success; }).map(function(d) { return d.message || 'Unknown error'; });
          showToast('Failed: ' + failedMsgs.join(', '), 'error');
        }
      })
      .catch(function() {
        btn.disabled = false;
        btn.textContent = 'Save All Settings';
        showToast('Error saving settings', 'error');
      });
    });

    document.getElementById('exportKnowledgeBtn').addEventListener('click', function() {
      fetch('/admin/api/chatbot-knowledge-export', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.success) {
            document.getElementById('export-result').style.display = 'block';
            document.getElementById('export-value').value = d.envValue;
            showToast('Export ready — copy the value below', 'success');
          } else {
            showToast('Failed to export', 'error');
          }
        })
        .catch(function() { showToast('Error exporting', 'error'); });
    });

    document.getElementById('copyExportBtn').addEventListener('click', function() {
      var el = document.getElementById('export-value');
      el.select();
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
    });

    document.getElementById('testChatBtn').addEventListener('click', function() {
      var input = document.getElementById('test-chat-input');
      var msg = input.value.trim();
      if (!msg) return;
      var messagesEl = document.getElementById('test-chat-messages');
      messagesEl.innerHTML += '<div style="margin-bottom:8px;text-align:right"><span style="background:#0A3D6B;color:#fff;padding:6px 12px;border-radius:12px;display:inline-block;max-width:80%">' + escapeHtml(msg) + '</span></div>';
      input.value = '';
      messagesEl.innerHTML += '<div style="margin-bottom:8px" id="typing-indicator"><span style="background:#f1f5f9;padding:6px 12px;border-radius:12px;display:inline-block;color:#64748b">Typing...</span></div>';
      messagesEl.scrollTop = messagesEl.scrollHeight;
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: 'admin-test-' + Date.now() })
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var ti = document.getElementById('typing-indicator');
        if (ti) ti.remove();
        messagesEl.innerHTML += '<div style="margin-bottom:8px"><span style="background:#f1f5f9;padding:6px 12px;border-radius:12px;display:inline-block;max-width:80%">' + escapeHtml(d.reply) + '</span></div>';
        messagesEl.scrollTop = messagesEl.scrollHeight;
      })
      .catch(function() {
        var ti = document.getElementById('typing-indicator');
        if (ti) ti.remove();
        messagesEl.innerHTML += '<div style="margin-bottom:8px"><span style="background:#fee2e2;padding:6px 12px;border-radius:12px;display:inline-block">Error getting response</span></div>';
      });
    });

    var testInput = document.getElementById('test-chat-input');
    if (testInput) {
      testInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('testChatBtn').click();
      });
    }
  }

  function addKnowledgeEntry(container, title, content) {
    var div = document.createElement('div');
    div.className = 'knowledge-entry';
    div.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;position:relative';
    div.innerHTML = '' +
      '<button class="knowledge-remove" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;color:#ef4444;font-size:18px;padding:4px" title="Remove">&times;</button>' +
      '<div class="form-group" style="margin-bottom:10px">' +
        '<label class="form-label">Topic / Title</label>' +
        '<input class="form-input knowledge-title" placeholder="e.g. Project Portfolio, Pricing Policy, Safety Standards..." value="' + escapeHtml(title) + '" />' +
      '</div>' +
      '<div class="form-group" style="margin-bottom:0">' +
        '<label class="form-label">Knowledge Content</label>' +
        '<textarea class="form-textarea knowledge-content" rows="4" placeholder="Add detailed information the chatbot should know about this topic...">' + escapeHtml(content) + '</textarea>' +
      '</div>';
    div.querySelector('.knowledge-remove').addEventListener('click', function() {
      div.remove();
    });
    container.appendChild(div);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderSettings() {
    var s = state.siteSettings || {};
    return '' +
      '<div class="settings-section">' +
        '<div class="settings-title">General</div>' +
        '<div class="form-group"><label class="form-label">Site Name</label><input class="form-input" id="setting-site-name" value="' + (s.siteName || 'Cahit Trading & Contracting LLC').replace(/"/g,'&quot;') + '" data-testid="input-site-name" /></div>' +
        '<div class="form-group"><label class="form-label">Site URL</label><input class="form-input" id="setting-site-url" value="' + (s.siteUrl || 'https://cahitcontracting.com').replace(/"/g,'&quot;') + '" data-testid="input-site-url" /></div>' +
        '<div class="form-group"><label class="form-label">Contact Email</label><input class="form-input" id="setting-contact-email" value="' + (s.contactEmail || 'ctc@cahitcontracting.com').replace(/"/g,'&quot;') + '" data-testid="input-contact-email" /></div>' +
        '<div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="setting-phone" value="' + (s.phone || '+968 24062411 Ext: 101').replace(/"/g,'&quot;') + '" data-testid="input-phone" /></div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Language & Localization</div>' +
        '<div class="settings-row"><div><div class="settings-row-label">Arabic (RTL)</div><div class="settings-row-desc">Enable Arabic language toggle on the site</div></div><button class="toggle on" data-setting="arabic" data-testid="toggle-arabic"></button></div>' +
        '<div class="settings-row"><div><div class="settings-row-label">Auto-detect Language</div><div class="settings-row-desc">Detect visitor language from browser settings</div></div><button class="toggle" data-setting="autodetect" data-testid="toggle-autodetect"></button></div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Features</div>' +
        '<div class="settings-row"><div><div class="settings-row-label">Lead Qualification Funnel</div><div class="settings-row-desc">Show progressive lead capture panels on scroll</div></div><button class="toggle on" data-setting="funnel" data-testid="toggle-funnel"></button></div>' +
        '<div class="settings-row"><div><div class="settings-row-label">Chatbot</div><div class="settings-row-desc">Show AI chatbot assistant</div></div><button class="toggle on" data-setting="chatbot" data-testid="toggle-chatbot"></button></div>' +
        '<div class="settings-row"><div><div class="settings-row-label">Blog Section</div><div class="settings-row-desc">Show blog posts on the homepage</div></div><button class="toggle on" data-setting="blog" data-testid="toggle-blog"></button></div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Account Security</div>' +
        '<div class="form-group"><label class="form-label">Username</label><input class="form-input" type="text" id="setting-username" placeholder="admin" data-testid="input-setting-username" /></div>' +
        '<div class="form-group"><label class="form-label">Current Password</label><input class="form-input" type="password" id="setting-current-password" placeholder="Enter current password" data-testid="input-current-password" /></div>' +
        '<div class="form-group"><label class="form-label">New Password</label><input class="form-input" type="password" id="setting-new-password" placeholder="Enter new password (min 6 characters)" data-testid="input-new-password" /></div>' +
        '<div class="form-group"><label class="form-label">Confirm New Password</label><input class="form-input" type="password" id="setting-confirm-password" placeholder="Confirm new password" data-testid="input-confirm-password" /></div>' +
        '<button class="btn btn-primary" id="changeCredentialsBtn" data-testid="button-change-credentials" style="margin-top:8px">Update Credentials</button>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">API Integrations</div>' +
        '<div class="form-group">' +
          '<label class="form-label">OpenAI API Key</label>' +
          '<div style="position:relative">' +
            '<input class="form-input" type="password" id="openai-api-key" placeholder="sk-..." data-testid="input-openai-key" style="padding-right:40px" />' +
            '<button type="button" id="toggleKeyVisibility" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;padding:4px" data-testid="button-toggle-key">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
            '</button>' +
          '</div>' +
          '<p class="settings-row-desc" style="margin-top:6px">Required for AI Blog generation and Chatbot. Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style="color:#0ea5e9;text-decoration:underline">platform.openai.com</a></p>' +
          '<p class="settings-row-desc" id="openai-key-status" style="margin-top:4px;color:#22c55e"></p>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">SEO</div>' +
        '<div class="form-group"><label class="form-label">Meta Title</label><input class="form-input" id="setting-meta-title" value="' + (s.metaTitle || 'Cahit Trading & Contracting LLC - Marine & Coastal Construction in Oman').replace(/"/g,'&quot;') + '" data-testid="input-meta-title" /></div>' +
        '<div class="form-group"><label class="form-label">Meta Description</label><textarea class="form-textarea" id="setting-meta-desc" data-testid="input-meta-desc">' + (s.metaDesc || 'Leading construction and infrastructure company in Oman specializing in marine construction, earthworks, infrastructure development and industrial services since 2009.') + '</textarea></div>' +
      '</div>' +
      '<div style="margin-top:24px"><button class="btn btn-primary" id="saveSettingsBtn" data-testid="button-save-settings">Save Settings</button></div>';
  }

  function bindSettingsActions() {
    var savedToggles = (state.siteSettings || {}).toggles || {};
    document.querySelectorAll('.toggle[data-setting]').forEach(function(t) {
      var key = t.getAttribute('data-setting');
      if (savedToggles[key] !== undefined) {
        if (savedToggles[key]) t.classList.add('on');
        else t.classList.remove('on');
      }
      t.addEventListener('click', function() {
        this.classList.toggle('on');
      });
    });
    var changeCredsBtn = document.getElementById('changeCredentialsBtn');
    if (changeCredsBtn) {
      changeCredsBtn.addEventListener('click', function() {
        var username = document.getElementById('setting-username').value.trim();
        var currentPw = document.getElementById('setting-current-password').value;
        var newPw = document.getElementById('setting-new-password').value;
        var confirmPw = document.getElementById('setting-confirm-password').value;
        if (!currentPw) { showToast('Please enter your current password', 'error'); return; }
        if (!newPw || newPw.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
        if (newPw !== confirmPw) { showToast('New passwords do not match', 'error'); return; }
        var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
        changeCredsBtn.disabled = true;
        changeCredsBtn.textContent = 'Updating...';
        fetch('/admin/api/change-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ currentPassword: currentPw, newUsername: username || undefined, newPassword: newPw })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          changeCredsBtn.disabled = false;
          changeCredsBtn.textContent = 'Update Credentials';
          if (d.success) {
            if (d.token) {
              sessionStorage.setItem('cahit_admin_token', d.token);
              localStorage.setItem('cahit_admin_token', d.token);
            }
            document.getElementById('setting-current-password').value = '';
            document.getElementById('setting-new-password').value = '';
            document.getElementById('setting-confirm-password').value = '';
            showToast('Credentials updated successfully', 'success');
          } else {
            showToast(d.message || 'Failed to update credentials', 'error');
          }
        })
        .catch(function() {
          changeCredsBtn.disabled = false;
          changeCredsBtn.textContent = 'Update Credentials';
          showToast('Error updating credentials', 'error');
        });
      });
    }
    var toggleKeyBtn = document.getElementById('toggleKeyVisibility');
    var keyInput = document.getElementById('openai-api-key');
    if (toggleKeyBtn && keyInput) {
      toggleKeyBtn.addEventListener('click', function() {
        if (keyInput.type === 'password') {
          keyInput.type = 'text';
          toggleKeyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        } else {
          keyInput.type = 'password';
          toggleKeyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
      });
    }
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    var keyStatus = document.getElementById('openai-key-status');
    if (keyStatus && token) {
      fetch('/admin/api/openai-key-status', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.hasKey) {
            keyStatus.textContent = 'Key configured: ' + d.maskedKey;
            keyStatus.style.color = '#22c55e';
          } else {
            keyStatus.textContent = 'No API key configured';
            keyStatus.style.color = '#ef4444';
          }
        })
        .catch(function() {});
    }
    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        var settingsData = {
          siteName: (document.getElementById('setting-site-name') || {}).value || '',
          siteUrl: (document.getElementById('setting-site-url') || {}).value || '',
          contactEmail: (document.getElementById('setting-contact-email') || {}).value || '',
          phone: (document.getElementById('setting-phone') || {}).value || '',
          metaTitle: (document.getElementById('setting-meta-title') || {}).value || '',
          metaDesc: (document.getElementById('setting-meta-desc') || {}).value || ''
        };

        var toggles = {};
        document.querySelectorAll('.toggle[data-setting]').forEach(function(t) {
          toggles[t.getAttribute('data-setting')] = t.classList.contains('on');
        });
        settingsData.toggles = toggles;

        var savePromises = [
          fetch('/admin/api/site-content/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: settingsData })
          }).then(function(r) { return r.json(); })
        ];

        var apiKeyEl = document.getElementById('openai-api-key');
        var apiKeyVal = apiKeyEl ? apiKeyEl.value.trim() : '';
        if (apiKeyVal) {
          savePromises.push(
            fetch('/admin/api/save-openai-key', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify({ key: apiKeyVal })
            }).then(function(r) { return r.json(); })
          );
        }

        Promise.all(savePromises).then(function(results) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Settings';
          state.siteSettings = settingsData;
          var allOk = results.every(function(d) { return d.success; });
          if (allOk) {
            showToast('Settings saved successfully', 'success');
            if (apiKeyVal) {
              var ks = document.getElementById('openai-key-status');
              if (ks) { ks.textContent = 'Key configured: sk-...' + apiKeyVal.slice(-4); ks.style.color = '#22c55e'; }
              apiKeyEl.value = '';
            }
          } else {
            showToast('Some settings may not have saved', 'error');
          }
        }).catch(function() {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Settings';
          showToast('Error saving settings', 'error');
        });
      });
    }
  }

  function showToast(message, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
  }

  window.markLeadStatus = function(id, status) {
    fetch('/admin/api/leads/' + id + '/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success) {
        showToast('Lead status updated', 'success');
        loadLeads();
      } else {
        showToast('Error updating status', 'error');
      }
    }).catch(function() { showToast('Error updating status', 'error'); });
  };

  window.openBlogEditor = function(post) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;width:90%;max-width:700px;max-height:85vh;overflow-y:auto;position:relative">' +
      '<button onclick="this.closest(\'.modal-overlay\').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:22px;cursor:pointer;color:#64748b">&times;</button>' +
      '<h3 style="margin:0 0 16px;color:#0A3D6B">' + (post ? 'Edit Post' : 'New Blog Post') + '</h3>' +
      '<div class="form-group"><label class="form-label">Title (English)</label><input class="form-input" id="bp-title" value="' + (post ? (post.title || '').replace(/"/g,'&quot;') : '') + '" /></div>' +
      '<div class="form-group"><label class="form-label">Title (Arabic)</label><input class="form-input" id="bp-title-ar" value="' + (post ? (post.title_ar || '').replace(/"/g,'&quot;') : '') + '" dir="rtl" /></div>' +
      '<div class="form-group"><label class="form-label">Excerpt (English)</label><textarea class="form-textarea" id="bp-excerpt" rows="2">' + (post ? (post.excerpt || '') : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Excerpt (Arabic)</label><textarea class="form-textarea" id="bp-excerpt-ar" rows="2" dir="rtl">' + (post ? (post.excerpt_ar || '') : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Content (English)</label><textarea class="form-textarea" id="bp-content" rows="6">' + (post ? (post.content || '') : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Content (Arabic)</label><textarea class="form-textarea" id="bp-content-ar" rows="6" dir="rtl">' + (post ? (post.content_ar || '') : '') + '</textarea></div>' +
      '<div class="form-group"><label class="form-label">Image URL</label><input class="form-input" id="bp-image" value="' + (post ? (post.image_url || '').replace(/"/g,'&quot;') : '') + '" /></div>' +
      '<div class="form-group"><label class="form-label">Slug</label><input class="form-input" id="bp-slug" value="' + (post ? (post.slug || '').replace(/"/g,'&quot;') : '') + '" placeholder="auto-generated-from-title" /></div>' +
      '<div style="display:flex;gap:8px;margin-top:16px">' +
        '<button class="btn btn-primary" id="bp-save" data-id="' + (post ? post.id : '') + '">Save Post</button>' +
        '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancel</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    document.getElementById('bp-save').addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var body = {
        title: document.getElementById('bp-title').value.trim(),
        title_ar: document.getElementById('bp-title-ar').value.trim(),
        excerpt: document.getElementById('bp-excerpt').value.trim(),
        excerpt_ar: document.getElementById('bp-excerpt-ar').value.trim(),
        content: document.getElementById('bp-content').value.trim(),
        content_ar: document.getElementById('bp-content-ar').value.trim(),
        image_url: document.getElementById('bp-image').value.trim(),
        slug: document.getElementById('bp-slug').value.trim(),
        status: 'published'
      };
      if (!body.title) { showToast('Title is required', 'error'); return; }
      var url = id ? '/admin/api/blog-posts/' + id : '/admin/api/blog-posts';
      var method = id ? 'PATCH' : 'POST';
      this.disabled = true;
      this.textContent = 'Saving...';
      fetch(url, { method: method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.success) {
            showToast(id ? 'Post updated' : 'Post created', 'success');
            overlay.remove();
            loadBlogPosts();
          } else {
            showToast('Error: ' + (d.error || 'Unknown'), 'error');
            var btn = document.getElementById('bp-save');
            if (btn) { btn.disabled = false; btn.textContent = 'Save Post'; }
          }
        })
        .catch(function() {
          showToast('Error saving post', 'error');
          var btn = document.getElementById('bp-save');
          if (btn) { btn.disabled = false; btn.textContent = 'Save Post'; }
        });
    });
  };

  window.deleteBlogPost = function(id) {
    if (!confirm('Delete this blog post?')) return;
    fetch('/admin/api/blog-posts/' + id, { method: 'DELETE' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success) { showToast('Post deleted', 'success'); loadBlogPosts(); }
        else showToast('Error deleting post', 'error');
      }).catch(function() { showToast('Error deleting post', 'error'); });
  };

  function loadBlogPosts() {
    fetch('/admin/api/blog-posts').then(function(r) { return r.json(); }).then(function(d) {
      if (d.success) { state.blogPosts = d.data || []; if (state.currentPage === 'blog') renderPage('blog'); }
    }).catch(function() {});
  }

  function renderBlogManager() {
    var posts = state.blogPosts || [];
    var rows = '';
    posts.forEach(function(p) {
      rows += '<tr>' +
        '<td><strong>' + (p.title || '') + '</strong></td>' +
        '<td>' + (p.slug || '') + '</td>' +
        '<td><span class="badge ' + (p.status === 'published' ? 'badge-green' : 'badge-gray') + '">' + (p.status || 'draft') + '</span></td>' +
        '<td>' + (p.created_at ? new Date(p.created_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '-') + '</td>' +
        '<td>' +
          '<button class="btn btn-sm btn-outline" onclick="openBlogEditor(' + JSON.stringify(p).replace(/"/g, '&quot;') + ')">Edit</button> ' +
          '<button class="btn btn-sm btn-outline" style="color:#ef4444" onclick="deleteBlogPost(' + p.id + ')">Delete</button>' +
        '</td>' +
      '</tr>';
    });

    return '' +
      '<div class="toolbar">' +
        '<span style="font-size:14px;color:var(--text-muted)">' + posts.length + ' blog posts</span>' +
        '<div class="toolbar-spacer"></div>' +
        '<button class="btn btn-primary" onclick="openBlogEditor(null)" data-testid="button-new-post">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Post</button>' +
      '</div>' +
      (posts.length === 0 ?
        '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div class="empty-state-title">No blog posts yet</div><div>Create your first blog post to get started</div></div>' :
        '<div class="card"><div class="card-body-np"><table class="table"><thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>'
      );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
