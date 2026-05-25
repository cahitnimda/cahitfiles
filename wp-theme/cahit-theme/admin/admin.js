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
    projectCards: [],
    serviceCards: [],
    cardManagerType: 'projects',
    editingCardIndex: null,
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

  function getAdminToken() {
    return sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token') || '';
  }
  function authHeaders(extra) {
    var h = { 'Authorization': 'Bearer ' + getAdminToken() };
    if (extra) { for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k]; } }
    return h;
  }

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
    loadDynamicCards();
    bindNavigation();
    bindMobileMenu();
    bindLogout();
    renderPage('dashboard');
    startPresence();
    setupAdminTelemetry();
    checkPasswordRotation();
  }

  // (11) Capture uncaught JS errors and ship them to /admin/api/error-log so
  // we see what's actually breaking in the admin UI without waiting for the
  // admin to email screenshots.
  function setupAdminTelemetry() {
    if (window._cahitErrorHook) return;
    window._cahitErrorHook = true;
    function send(payload) {
      try {
        fetch('/admin/api/error-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function() {});
      } catch (e) {}
    }
    window.addEventListener('error', function(e) {
      send({
        level: 'error',
        message: (e && e.message) || 'Unknown error',
        url: (e && e.filename) || location.href,
        line: (e && e.lineno) || 0,
        col: (e && e.colno) || 0,
        stack: (e && e.error && e.error.stack) ? String(e.error.stack).slice(0, 4000) : ''
      });
    });
    window.addEventListener('unhandledrejection', function(e) {
      var reason = e && e.reason;
      send({
        level: 'unhandledrejection',
        message: (reason && reason.message) ? reason.message : String(reason || 'rejection'),
        url: location.href,
        line: 0, col: 0,
        stack: (reason && reason.stack) ? String(reason.stack).slice(0, 4000) : ''
      });
    });
  }

  // (14) After /admin/api/verify reports the password is 90+ days old, show
  // a sticky banner asking the admin to rotate.
  function checkPasswordRotation() {
    fetch('/admin/api/verify', { headers: authHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d || !d.success) return;
        var dismissed = localStorage.getItem('cahit_pwd_banner_dismissed_v') || '';
        var stamp = String(d.passwordChangedAt || '0');
        if (dismissed === stamp) return;
        if (d.passwordRotationDue) {
          if (document.getElementById('pwdRotationBar')) return;
          var bar = document.createElement('div');
          bar.id = 'pwdRotationBar';
          // position:fixed keeps the bar out of the normal document flow so it
          // never causes a layout shift when it appears after login.
          bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fef3c7;border-top:1px solid #fde68a;color:#92400e;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;box-shadow:0 -2px 8px rgba(0,0,0,.08)';
          bar.innerHTML = '<span>Your admin password is ' + (d.passwordAgeDays || '90+') + ' days old. Rotate it in Settings &rarr; Account Security.</span>' +
            '<button id="dismissPwdBar" style="background:transparent;border:1px solid #92400e;color:#92400e;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:12px;white-space:nowrap;margin-left:12px">Remind me later</button>';
          document.body.appendChild(bar);
          document.getElementById('dismissPwdBar').addEventListener('click', function() {
            localStorage.setItem('cahit_pwd_banner_dismissed_v', stamp);
            bar.remove();
          });
        }
      }).catch(function() {});
  }

  function loadLeads() {
    fetch('/admin/api/leads', { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(data) {
      if (!data.success) return;
      state.leads = data.data;
      if (state.currentPage === 'leads') {
        renderPage('leads');
      } else if (state.currentPage === 'dashboard') {
        // Update only the two stat numbers in-place so the dashboard doesn't
        // flash/re-render just because leads loaded asynchronously.
        var totalEl  = document.querySelector('[data-testid="stat-leads"] .stat-card-value');
        var newEl    = document.querySelector('[data-testid="stat-leads"] .stat-card-change');
        var newCount = state.leads.filter(function(l) { return l.status === 'new'; }).length;
        if (totalEl) totalEl.textContent = state.leads.length;
        if (newEl)   newEl.textContent   = newCount + ' new';
      }
    }).catch(function() {});
  }

  function loadMediaFromServer(cb) {
    var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    fetch('/admin/api/uploads', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success && d.files) {
          d.files.forEach(function(f) {
            var exists = state.mediaItems.some(function(m) { return m.url === f.url; });
            if (!exists) {
              var kind = f.kind || (/\.(mp4|mov|webm|avi|m4v|ogv)$/i.test(f.name) ? 'video' : 'image');
              state.mediaItems.push({
                name: f.name,
                type: kind,
                mime: f.type || '',
                size: ((f.size || 0) / (1024 * 1024)).toFixed(1) + ' MB',
                date: f.date || '',
                url: f.url
              });
            }
          });
        }
        if (typeof cb === 'function') cb();
      }).catch(function() { if (typeof cb === 'function') cb(); });
  }

  function loadSiteSettings() {
    fetch('/admin/api/site-content/settings', { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.data) { state.siteSettings = d.data; }
    }).catch(function() {});
  }

  function loadSavedSectionContent(section) {
    var isDetail = (section === 'project-detail' || section === 'service-detail');
    var loadKey = isDetail ? section + '-' + (state.detailSlug || '') : section;
    fetch('/admin/api/site-content/' + loadKey, { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.data) {
        var data = d.data;
        // Mark this section as server-loaded so populateFieldsFromPreview
        // (which runs from preview iframe text) does not later overwrite
        // DB-saved richtext with plain text.
        state._serverLoaded = state._serverLoaded || {};
        state._serverLoaded[section] = true;
        Object.keys(data).forEach(function(key) {
          if (!state.editedContent[key]) {
            state.editedContent[key] = data[key];
            var field = document.querySelector('[data-key="' + key + '"]');
            if (field) {
              if (field.tagName === 'TEXTAREA') field.value = data[key];
              else if (field.tagName === 'INPUT') field.value = data[key];
              else if (field.classList && field.classList.contains('live-edit-richtext')) {
                // Push value into Quill if upgraded, else into the
                // contenteditable directly.
                // _quillLoading suppresses the text-change → markUnsaved() cycle
                // that would otherwise trigger an unwanted autosave on every
                // section switch.
                if (field._quill) {
                  field._quillLoading = true;
                  field._quill.root.innerHTML = data[key] || '';
                  setTimeout(function(f){ f._quillLoading = false; }, 0, field);
                } else { field.innerHTML = data[key] || ''; }
              }
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
        if (window.cahitPresenceTick) window.cahitPresenceTick();
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
        // Tell the server to drop my presence row immediately so the other
        // admin sees me go offline without a 15s lag. Best-effort.
        try {
          fetch('/admin/api/presence/leave', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ clientId: presence.clientId }),
            keepalive: true
          });
        } catch (e) {}
        sessionStorage.removeItem('cahit_admin_token');
        localStorage.removeItem('cahit_admin_token');
        window.location.href = '/admin/login';
      });
    }
  }

  // ---------------------------------------------------------------------
  // Live admin presence
  // ---------------------------------------------------------------------
  // Heartbeats every 3s with our current screen ("Editing: About > Hero",
  // "Viewing: Leads", etc). The server returns the *other* online admins
  // and recent save events so we can:
  //   1) render the green "Online" pill with a dropdown listing each
  //      admin and what they're looking at, and
  //   2) auto-reload the section we're editing if the other admin saved
  //      it (so we always see their latest changes).
  // Per-tab client id so two browsers / tabs sharing the same admin account
  // each show up as a separate live participant. Stored in sessionStorage so
  // a hard-refresh keeps the same tab identity, but a brand-new tab gets a
  // fresh one.
  function getClientId() {
    var id = sessionStorage.getItem('cahit_admin_client_id');
    if (!id) {
      id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('cahit_admin_client_id', id);
    }
    return id;
  }
  var presence = {
    pageLabel: 'Dashboard',
    sectionLoadedAt: {},      // sectionKey -> timestamp we last loaded it
    lastSeenSaveTs: {},       // sectionKey -> timestamp of save we already applied
    timer: null,
    me: null,                 // username
    mySid: null,              // session key returned by server (tokenId:clientId)
    clientId: getClientId(),
    followingSid: null,       // sid of admin we are mirroring; null = not following
    lastFollowedKey: ''       // last "page|section|detail" we synced to (to avoid loops)
  };
  // Build the rich structured payload sent on every heartbeat. The server
  // stores it as-is and echoes it back to other admins, which lets the
  // "Follow" feature navigate exactly to the leader's current screen.
  function buildPresencePayload() {
    return {
      page: state.currentPage || '',
      editingPage: state.editingPage || '',
      editingSection: state.editingSection || '',
      detailSlug: state.detailSlug || '',
      label: presence.pageLabel,
      clientId: presence.clientId
    };
  }
  // Navigate our admin UI to mirror another admin's current screen.
  function followNavigateTo(target) {
    if (!target) return;
    var key = (target.page || '') + '|' + (target.editingPage || '') + '|' + (target.editingSection || '') + '|' + (target.detailSlug || '');
    if (key === presence.lastFollowedKey) return; // already in sync
    presence.lastFollowedKey = key;
    var page = target.page || 'dashboard';
    // Activate the matching sidebar nav item visually.
    document.querySelectorAll('.nav-item').forEach(function(n) {
      n.classList.toggle('active', n.getAttribute('data-page') === page);
      if (n.getAttribute('data-page') === page) {
        var titleEl = document.getElementById('pageTitle');
        var span = n.querySelector('span');
        if (titleEl && span) titleEl.textContent = span.textContent;
      }
    });
    state.currentPage = page;
    if (page === 'content') {
      if (target.editingPage) state.editingPage = target.editingPage;
      if (target.editingSection) state.editingSection = target.editingSection;
      state.detailSlug = target.detailSlug || null;
      // Pull the leader's saved content for the matching section so we see
      // what they see, then render.
      var isDetail = (state.editingSection === 'project-detail' || state.editingSection === 'service-detail');
      var saveKey = isDetail ? state.editingSection + '-' + (state.detailSlug || '') : state.editingSection;
      state.editedContent = {};
      fetch('/admin/api/site-content/' + saveKey, { headers: authHeaders() })
        .then(function(r) { return r.json(); })
        .then(function(result) {
          if (result && result.success && result.data) {
            Object.keys(result.data).forEach(function(k) { state.editedContent[k] = result.data[k]; });
          }
          var fb = document.getElementById('editorFieldsBody');
          if (fb) { fb.innerHTML = buildSectionFieldsHtml(state.editingSection, state.detailSlug); if (typeof bindContentEditorExtras === 'function') bindContentEditorExtras(); }
        }).catch(function() {
          var fb = document.getElementById('editorFieldsBody');
          if (fb) { fb.innerHTML = buildSectionFieldsHtml(state.editingSection, state.detailSlug); if (typeof bindContentEditorExtras === 'function') bindContentEditorExtras(); }
        });
    } else {
      renderPage(page);
    }
  }
  // Public helpers used by the pill dropdown buttons.
  window.cahitFollowStart = function(sid) {
    presence.followingSid = sid;
    presence.lastFollowedKey = '';
    if (typeof showToast === 'function') showToast('Following — your screen will mirror theirs.', 'success');
    presenceHeartbeat();
  };
  window.cahitFollowStop = function() {
    presence.followingSid = null;
    presence.lastFollowedKey = '';
    if (typeof showToast === 'function') showToast('Stopped following.', 'info');
    presenceHeartbeat();
  };

  // "View each other's screen" header button → instructions modal.
  // Built lazily on first click so it doesn't bloat initial DOM.
  window.cahitOpenScreenShareHelp = function() {
    var existing = document.getElementById('screenShareHelpModal');
    if (existing) { existing.style.display = 'flex'; return; }
    var overlay = document.createElement('div');
    overlay.id = 'screenShareHelpModal';
    overlay.setAttribute('data-testid', 'modal-screen-share-help');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    overlay.innerHTML =
      '<div role="dialog" aria-labelledby="ssTitle" style="background:#fff;border-radius:14px;max-width:560px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 64px rgba(0,0,0,.3)">' +
        '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="width:36px;height:36px;border-radius:10px;background:#eff6ff;color:#1e40af;display:flex;align-items:center;justify-content:center">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
            '</div>' +
            '<h3 id="ssTitle" style="margin:0;font-size:18px;color:#0f172a">How to see each other\'s screen</h3>' +
          '</div>' +
          '<button type="button" data-ss-close style="background:none;border:0;font-size:24px;line-height:1;color:#64748b;cursor:pointer;padding:4px 8px" aria-label="Close">×</button>' +
        '</div>' +
        '<div style="padding:20px 24px;color:#334155;font-size:14px;line-height:1.6">' +
          '<p style="margin:0 0 14px"><strong>Follow mode</strong> lets one admin mirror another admin\'s screen in real time. When the leader navigates between pages or sections, the follower\'s panel automatically jumps with them.</p>' +
          '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:16px">' +
            '<div style="font-weight:700;color:#0A3D6B;font-size:13px;margin-bottom:8px">Step by step</div>' +
            '<ol style="margin:0;padding-left:20px">' +
              '<li style="margin-bottom:6px">Both admins log in to <code style="background:#e2e8f0;padding:1px 6px;border-radius:4px">/admin</code> from any device.</li>' +
              '<li style="margin-bottom:6px">In the top-right header you\'ll see a green <strong>Online</strong> pill — it shows how many other admins are signed in.</li>' +
              '<li style="margin-bottom:6px">Click that pill to open the live activity dropdown. You\'ll see the other admin\'s name and which page/section they\'re on.</li>' +
              '<li style="margin-bottom:6px">Click the blue <strong>Follow</strong> button next to their name. Your panel will switch to whatever screen they\'re on within a few seconds.</li>' +
              '<li style="margin-bottom:6px">As they navigate, your view follows them automatically. The pill turns amber and says <em>“Following [name]”</em>.</li>' +
              '<li>To stop, click the pill again and hit <strong>Stop following</strong> (or the Stop button on their row).</li>' +
            '</ol>' +
          '</div>' +
          '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:#78350f">' +
            '<strong>Good to know</strong><ul style="margin:6px 0 0;padding-left:18px">' +
              '<li>Follow is one-way — you see them, they don\'t see you. They keep working normally.</li>' +
              '<li>Don\'t both follow each other at the same time, or you\'ll be locked watching each other.</li>' +
              '<li>If you start editing something while following, you stay on that screen but the auto-mirror keeps trying — click <strong>Stop</strong> first if you want to take over.</li>' +
              '<li>When the other admin saves a section you\'re both editing, the editor auto-refreshes so you don\'t overwrite their work.</li>' +
            '</ul></div>' +
          '<p style="margin:0;color:#64748b;font-size:12px">Tip: keep this admin tab open on a second monitor or phone if you want a passive live view of what the other person is doing.</p>' +
        '</div>' +
        '<div style="padding:14px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:8px">' +
          '<button type="button" data-ss-close class="btn btn-primary" style="background:#0A3D6B;color:#fff;border:0;padding:9px 18px;border-radius:8px;font-weight:600;cursor:pointer">Got it</button>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function(ev) {
      if (ev.target === overlay || (ev.target.closest && ev.target.closest('[data-ss-close]'))) {
        overlay.style.display = 'none';
      }
    });
    document.addEventListener('keydown', function escHandler(ev) {
      if (ev.key === 'Escape' && overlay.style.display !== 'none') overlay.style.display = 'none';
    });
    document.body.appendChild(overlay);
  };
  function buildPresenceLabel() {
    var p = state.currentPage;
    if (p === 'content') {
      var pageName = state.editingPage || '/';
      var pageObj = (state.pages || []).filter(function(pg) { return pg.path === pageName; })[0];
      var pretty = pageObj ? pageObj.name : pageName;
      var section = state.editingSection || 'hero';
      var detail = state.detailSlug ? ' › ' + state.detailSlug : '';
      return 'Editing: ' + pretty + ' › ' + section + detail;
    }
    var map = { dashboard:'Dashboard', pages:'Pages', cards:'Cards', media:'Media Library',
                blog:'Blog Posts', leads:'Leads & Contacts', analytics:'Analytics',
                chatbot:'Chatbot Knowledge', settings:'Settings' };
    return 'Viewing: ' + (map[p] || p || 'Admin');
  }
  function presenceCurrentSectionKey() {
    if (state.currentPage !== 'content') return null;
    var s = state.editingSection;
    if (!s) return null;
    if (s === 'project-detail' || s === 'service-detail') {
      return state.detailSlug ? (s + '-' + state.detailSlug) : null;
    }
    return s;
  }
  function renderPresencePill(others) {
    var pill = document.getElementById('livePresencePill');
    var txt = document.getElementById('livePresenceText');
    var dd = document.getElementById('livePresenceDropdown');
    if (!pill || !txt || !dd) return;
    pill.style.visibility = 'visible';  // reveal without shifting layout (starts as visibility:hidden)
    var n = others ? others.length : 0;
    if (presence.followingSid) {
      var lead = (others || []).filter(function(o) { return o.sid === presence.followingSid; })[0];
      txt.textContent = 'Following ' + (lead ? lead.user : '…');
      pill.style.background = '#fef3c7';
      pill.style.borderColor = '#fcd34d';
      pill.style.color = '#92400e';
    } else if (n === 0) {
      txt.textContent = 'You\'re the only admin online';
      pill.style.background = '#f0f9ff';
      pill.style.borderColor = '#bae6fd';
      pill.style.color = '#075985';
    } else {
      txt.textContent = n + ' other admin' + (n === 1 ? '' : 's') + ' online';
      pill.style.background = '#ecfdf5';
      pill.style.borderColor = '#6ee7b7';
      pill.style.color = '#065f46';
    }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    }
    var rows = '';
    rows += '<div style="font-weight:700;color:#0A3D6B;font-size:12px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Live admin activity</div>';
    rows += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">' +
            '<div style="width:28px;height:28px;border-radius:50%;background:#0A3D6B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">' + esc((presence.me || 'Y').charAt(0).toUpperCase()) + '</div>' +
            '<div style="flex:1;min-width:0"><div style="font-weight:600">' + esc(presence.me || 'You') + ' <span style="color:#10b981;font-size:11px;font-weight:400">(you)</span></div>' +
            '<div style="color:#64748b;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(presence.pageLabel) + '</div></div>' +
            (presence.followingSid ? '<button type="button" data-presence-action="stop-follow" style="background:#92400e;color:#fff;border:0;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;font-weight:600">Stop following</button>' : '') +
            '</div>';
    if (n === 0) {
      rows += '<div style="padding:10px 4px;color:#94a3b8;font-size:12px;text-align:center">No other admins online right now.</div>';
    } else {
      others.forEach(function(o) {
        var ago = Math.max(0, Math.round((Date.now() - (o.ts || Date.now())) / 1000));
        var isFollowing = presence.followingSid === o.sid;
        var btn;
        if (isFollowing) {
          btn = '<button type="button" data-presence-action="stop-follow" style="background:#92400e;color:#fff;border:0;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;font-weight:600">Stop</button>';
        } else if (presence.followingSid) {
          btn = '<button type="button" data-presence-action="follow" data-sid="' + esc(o.sid) + '" style="background:#e2e8f0;color:#475569;border:0;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer">Switch</button>';
        } else {
          btn = '<button type="button" data-presence-action="follow" data-sid="' + esc(o.sid) + '" style="background:#0A3D6B;color:#fff;border:0;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;font-weight:600">Follow</button>';
        }
        rows += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9">' +
                '<div style="width:28px;height:28px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">' + esc(o.user.charAt(0).toUpperCase()) + '</div>' +
                '<div style="flex:1;min-width:0"><div style="font-weight:600">' + esc(o.user) + ' <span style="color:#10b981;font-size:11px">● online</span></div>' +
                '<div style="color:#64748b;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(o.label || '—') + '</div>' +
                '<div style="color:#94a3b8;font-size:11px">last seen ' + ago + 's ago</div></div>' +
                btn +
                '</div>';
      });
      rows += '<div style="padding:8px 4px 2px;color:#64748b;font-size:11px;line-height:1.4">Click <strong>Follow</strong> to mirror that admin\'s screen — your panel will auto-navigate to whatever page or section they are on.</div>';
    }
    // Only rebuild the dropdown HTML when it's open — hidden repaints every 8s
    // are wasted work and can cause compositing jank on some browsers.
    if (dd.style.display !== 'none') dd.innerHTML = rows;
    // Wire up the Follow / Stop / Switch buttons. We delegate on the dropdown
    // so dynamic re-renders keep working without stacking listeners.
    if (!dd._followBound) {
      dd._followBound = true;
      dd.addEventListener('click', function(ev) {
        var btnEl = ev.target.closest('[data-presence-action]');
        if (!btnEl) return;
        ev.stopPropagation();
        var action = btnEl.getAttribute('data-presence-action');
        if (action === 'follow') {
          var sid = btnEl.getAttribute('data-sid');
          if (sid && window.cahitFollowStart) window.cahitFollowStart(sid);
        } else if (action === 'stop-follow') {
          if (window.cahitFollowStop) window.cahitFollowStop();
        }
      });
    }
    if (!pill._bound) {
      pill._bound = true;
      pill.addEventListener('click', function(e) {
        e.stopPropagation();
        dd.style.display = (dd.style.display === 'none' ? 'block' : 'none');
      });
      document.addEventListener('click', function(e) {
        if (!pill.contains(e.target)) dd.style.display = 'none';
      });
    }
  }
  function applyRemoteSaves(saves) {
    if (!saves) return;
    var curKey = presenceCurrentSectionKey();
    if (!curKey || !saves[curKey]) return;
    var ev = saves[curKey];
    if (ev.sid && ev.sid === presence.mySid) return;
    var lastApplied = presence.lastSeenSaveTs[curKey] || 0;
    var loadedAt = presence.sectionLoadedAt[curKey] || 0;
    if (ev.ts <= lastApplied || ev.ts <= loadedAt) return;
    presence.lastSeenSaveTs[curKey] = ev.ts;
    // Pull the latest content for this section and merge it into the editor.
    fetch('/admin/api/site-content/' + curKey, { headers: authHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (!result || !result.success || !result.data) return;
        Object.keys(result.data).forEach(function(k) { state.editedContent[k] = result.data[k]; });
        var fb = document.getElementById('editorFieldsBody');
        if (fb) { fb.innerHTML = buildSectionFieldsHtml(state.editingSection, state.detailSlug); if (typeof bindContentEditorExtras === 'function') bindContentEditorExtras(); }
        if (typeof showToast === 'function') {
          showToast(ev.by + ' just saved this section — your editor was refreshed.', 'success');
        }
        var iframe = document.getElementById('previewFrame');
        if (iframe) { try { iframe.src = iframe.src; } catch (e) {} }
      }).catch(function() {});
  }
  function presenceHeartbeat() {
    presence.pageLabel = buildPresenceLabel();
    var curKey = presenceCurrentSectionKey();
    if (curKey && !presence.sectionLoadedAt[curKey]) {
      presence.sectionLoadedAt[curKey] = Date.now();
    }
    fetch('/admin/api/presence', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(buildPresencePayload())
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (!data || !data.success) return;
      presence.me = data.me || presence.me;
      presence.mySid = data.mySid || presence.mySid;
      var others = data.others || [];
      renderPresencePill(others);
      applyRemoteSaves(data.saves || {});
      // If we are following another admin and they are still online, mirror
      // their current screen. If they've gone offline, stop following.
      if (presence.followingSid) {
        var leader = others.filter(function(o) { return o.sid === presence.followingSid; })[0];
        if (leader) {
          followNavigateTo(leader);
        } else {
          presence.followingSid = null;
          presence.lastFollowedKey = '';
          if (typeof showToast === 'function') showToast('The admin you were following went offline.', 'info');
          renderPresencePill(others);
        }
      }
    }).catch(function() {});
  }
  function startPresence() {
    if (presence.timer) return;
    presenceHeartbeat();
    presence.timer = setInterval(presenceHeartbeat, 8000);
    window.addEventListener('beforeunload', function() {
      try {
        var token = getAdminToken();
        if (navigator.sendBeacon) {
          // sendBeacon can't set Authorization headers — fall back to fetch keepalive.
        }
        fetch('/admin/api/presence/leave', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ clientId: presence.clientId }),
          keepalive: true
        });
      } catch (e) {}
    });
  }
  // Expose so renderPage / section-change handlers can force an immediate
  // heartbeat instead of waiting up to 3s for the next tick.
  window.cahitPresenceTick = function() { try { presenceHeartbeat(); } catch (e) {} };

  function renderPage(page) {
    var content = document.getElementById('mainContent');
    switch(page) {
      case 'dashboard': content.innerHTML = renderDashboard(); break;
      case 'pages': content.innerHTML = renderPages(); bindPageActions(); break;
      case 'content': content.innerHTML = renderContentEditor(); bindEditorActions(); break;
      case 'cards': content.innerHTML = renderCardManager(); bindCardManagerActions(); break;
      case 'media': content.innerHTML = renderMedia(); bindMediaActions(); loadMediaFromServer(function() { if (state.currentPage === 'media') { document.getElementById('mainContent').innerHTML = renderMedia(); bindMediaActions(); } }); break;
      case 'blog': content.innerHTML = renderBlogManager(); loadBlogPosts(); break;
      case 'leads': content.innerHTML = renderLeads(); break;
      case 'analytics': content.innerHTML = renderAnalytics(); loadAnalyticsData(); bindAnalyticsActions(); break;
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
      { key: 'about-hero-title', label: 'Page Title', selector: '[data-field=about-hero-title]', type: 'text', defaultVal: 'About Cahit Trading & Contracting' },
      { key: 'about-hero-subtitle', label: 'Subtitle', selector: '[data-field=about-hero-subtitle]', type: 'textarea', defaultVal: 'Cahit Trading & Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.' },
      { key: 'about-hero-bg', label: 'Hero Background Image', selector: '[data-field=about-hero-bg]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'about-overview': [
      { key: 'about-overview-title', label: 'Section Title', selector: '[data-field=about-overview-title]', type: 'text', defaultVal: 'Company Overview' },
      { key: 'about-overview-subtitle', label: 'Section Subtitle', selector: '[data-field=about-overview-subtitle]', type: 'text', defaultVal: 'Building critical infrastructure across Oman since 2009' },
      { key: 'about-overview-p1', label: 'Paragraph 1', selector: '[data-field=about-overview-p1]', type: 'textarea', defaultVal: 'Cahit Trading & Contracting LLC has been operating in Oman since 2009, delivering a wide range of construction and infrastructure services.' },
      { key: 'about-overview-p2', label: 'Paragraph 2', selector: '[data-field=about-overview-p2]', type: 'textarea', defaultVal: 'The company has successfully participated in major projects across marine construction, infrastructure development and industrial services.' },
      { key: 'about-overview-p3', label: 'Paragraph 3', selector: '[data-field=about-overview-p3]', type: 'textarea', defaultVal: 'Through experienced leadership and skilled engineering teams, Cahit continues to contribute to the development of critical infrastructure throughout the region.' },
      { key: 'about-overview-video', label: 'Overview Video', selector: '[data-field=about-overview-video]', type: 'video', attr: 'src', defaultVal: '' },
      { key: 'about-rolling-img1', label: 'Rolling Image 1', selector: '[data-field=about-rolling-img1]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-rolling-img2', label: 'Rolling Image 2', selector: '[data-field=about-rolling-img2]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-rolling-img3', label: 'Rolling Image 3', selector: '[data-field=about-rolling-img3]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-rolling-img4', label: 'Rolling Image 4', selector: '[data-field=about-rolling-img4]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-stat1-number', label: 'Stat 1 Number', selector: '[data-field=about-stat1-number]', type: 'text', defaultVal: '25+' },
      { key: 'about-stat1-label', label: 'Stat 1 Label', selector: '[data-field=about-stat1-label]', type: 'text', defaultVal: 'Years of Industry-Leading Experience' },
      { key: 'about-stat2-number', label: 'Stat 2 Number', selector: '[data-field=about-stat2-number]', type: 'text', defaultVal: '50+' },
      { key: 'about-stat2-label', label: 'Stat 2 Label', selector: '[data-field=about-stat2-label]', type: 'text', defaultVal: 'Major Infrastructure Projects Completed' },
      { key: 'about-stat3-number', label: 'Stat 3 Number', selector: '[data-field=about-stat3-number]', type: 'text', defaultVal: '100%' },
      { key: 'about-stat3-label', label: 'Stat 3 Label', selector: '[data-field=about-stat3-label]', type: 'text', defaultVal: 'Operations Across Oman' }
    ],
    'about-mission': [
      { key: 'about-mission-title', label: 'Mission Title', selector: '[data-field=about-mission-title]', type: 'text', defaultVal: 'Our Mission' },
      { key: 'about-mission-text', label: 'Mission Text', selector: '[data-field=about-mission-text]', type: 'textarea', defaultVal: 'To apply our knowledge and experience in the construction industry to deliver high-quality infrastructure projects while contributing to the development of Oman.' },
      { key: 'about-vision-title', label: 'Vision Title', selector: '[data-field=about-vision-title]', type: 'text', defaultVal: 'Our Vision' },
      { key: 'about-vision-text', label: 'Vision Text', selector: '[data-field=about-vision-text]', type: 'textarea', defaultVal: 'To become a leading regional contractor recognized for excellence in marine construction, infrastructure development and industrial services.' }
    ],
    'about-leadership': [
      { key: 'about-leadership-title', label: 'Section Title', selector: '[data-field=about-leadership-title]', type: 'text', defaultVal: 'Leadership' },
      { key: 'about-leadership-subtitle', label: 'Section Subtitle', selector: '[data-field=about-leadership-subtitle]', type: 'text', defaultVal: 'Meet the professionals behind Cahit Trading & Contracting.' },
      { key: 'about-leader1-name', label: 'Leader Name', selector: '[data-field=about-leader1-name]', type: 'text', defaultVal: 'Tahir Şenyurt' },
      { key: 'about-leader1-role', label: 'Leader Role', selector: '[data-field=about-leader1-role]', type: 'text', defaultVal: 'Managing Director' },
      { key: 'about-leader1-bio1', label: 'Leader Bio Paragraph 1', selector: '[data-field=about-leader1-bio1]', type: 'textarea', defaultVal: '' },
      { key: 'about-leader1-bio2', label: 'Leader Bio Paragraph 2', selector: '[data-field=about-leader1-bio2]', type: 'textarea', defaultVal: '' },
      { key: 'about-leader1-education', label: 'Education', selector: '[data-field=about-leader1-education]', type: 'text', defaultVal: '' },
      { key: 'about-leader1-license', label: 'License', selector: '[data-field=about-leader1-license]', type: 'text', defaultVal: '' }
    ],
    'about-commitment': [
      { key: 'about-commitment-title', label: 'Section Title', selector: '[data-field=about-commitment-title]', type: 'text', defaultVal: 'Our Commitment' },
      { key: 'about-commit1-title', label: 'Card 1 Title', selector: '[data-field=about-commit1-title]', type: 'text', defaultVal: 'Best Quality' },
      { key: 'about-commit1-desc', label: 'Card 1 Description', selector: '[data-field=about-commit1-desc]', type: 'textarea', defaultVal: 'We maintain the highest engineering and construction standards in every project.' },
      { key: 'about-commit2-title', label: 'Card 2 Title', selector: '[data-field=about-commit2-title]', type: 'text', defaultVal: 'On-Time Delivery' },
      { key: 'about-commit2-desc', label: 'Card 2 Description', selector: '[data-field=about-commit2-desc]', type: 'textarea', defaultVal: 'We respect project timelines and deliver reliable execution without compromising quality.' },
      { key: 'about-commit3-title', label: 'Card 3 Title', selector: '[data-field=about-commit3-title]', type: 'text', defaultVal: 'Experience' },
      { key: 'about-commit3-desc', label: 'Card 3 Description', selector: '[data-field=about-commit3-desc]', type: 'textarea', defaultVal: 'Our experienced professionals ensure efficient project delivery and operational excellence.' }
    ],
    'about-clients': [
      { key: 'about-clients-title', label: 'Section Title', selector: '[data-field=about-clients-title]', type: 'text', defaultVal: 'Trusted by Leading Organizations' },
      { key: 'about-client1-img', label: 'Client Logo 1', selector: '[data-field=about-client1-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client2-img', label: 'Client Logo 2', selector: '[data-field=about-client2-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client3-img', label: 'Client Logo 3', selector: '[data-field=about-client3-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client4-img', label: 'Client Logo 4', selector: '[data-field=about-client4-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client5-img', label: 'Client Logo 5', selector: '[data-field=about-client5-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client6-img', label: 'Client Logo 6', selector: '[data-field=about-client6-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client7-img', label: 'Client Logo 7', selector: '[data-field=about-client7-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client8-img', label: 'Client Logo 8', selector: '[data-field=about-client8-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client9-img', label: 'Client Logo 9', selector: '[data-field=about-client9-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client10-img', label: 'Client Logo 10', selector: '[data-field=about-client10-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'about-client11-img', label: 'Client Logo 11', selector: '[data-field=about-client11-img]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'services-hero': [
      { key: 'services-hero-title', label: 'Page Title', selector: '.hero-banner-title', type: 'text', defaultVal: 'Our Services' },
      { key: 'services-hero-subtitle', label: 'Subtitle', selector: '.hero-banner-subtitle', type: 'textarea', defaultVal: 'Our diverse expertise allows us to support complex infrastructure projects across multiple sectors.' },
      { key: 'services-hero-video', label: 'Hero Background Video', selector: '.hero-banner-video source', type: 'video', attr: 'src', defaultVal: '' }
    ],
    'services-list': [
      { key: 'services-card1-title', label: 'Service 1 Title', selector: '[data-field=services-card1-title]', type: 'text', defaultVal: 'Marine & Coastal Construction' },
      { key: 'services-card1-desc', label: 'Service 1 Description', selector: '[data-field=services-card1-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card1-img', label: 'Service 1 Image', selector: '[data-field=services-card1-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card1-readmore-slug', label: 'Service 1 Read More Slug', selector: '[data-field=services-card1-readmore]', type: 'text', defaultVal: 'marine-coastal-construction' },

      { key: 'services-card2-title', label: 'Service 2 Title', selector: '[data-field=services-card2-title]', type: 'text', defaultVal: 'Infrastructure Development' },
      { key: 'services-card2-desc', label: 'Service 2 Description', selector: '[data-field=services-card2-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card2-img', label: 'Service 2 Image', selector: '[data-field=services-card2-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card2-readmore-slug', label: 'Service 2 Read More Slug', selector: '[data-field=services-card2-readmore]', type: 'text', defaultVal: 'infrastructure-development' },

      { key: 'services-card3-title', label: 'Service 3 Title', selector: '[data-field=services-card3-title]', type: 'text', defaultVal: 'Earthworks' },
      { key: 'services-card3-desc', label: 'Service 3 Description', selector: '[data-field=services-card3-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card3-img', label: 'Service 3 Image', selector: '[data-field=services-card3-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card3-readmore-slug', label: 'Service 3 Read More Slug', selector: '[data-field=services-card3-readmore]', type: 'text', defaultVal: 'earthworks' },

      { key: 'services-card4-title', label: 'Service 4 Title', selector: '[data-field=services-card4-title]', type: 'text', defaultVal: 'Dewatering & Shoring' },
      { key: 'services-card4-desc', label: 'Service 4 Description', selector: '[data-field=services-card4-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card4-img', label: 'Service 4 Image', selector: '[data-field=services-card4-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card4-readmore-slug', label: 'Service 4 Read More Slug', selector: '[data-field=services-card4-readmore]', type: 'text', defaultVal: 'dewatering-shoring' },

      { key: 'services-card5-title', label: 'Service 5 Title', selector: '[data-field=services-card5-title]', type: 'text', defaultVal: 'MEP Works' },
      { key: 'services-card5-desc', label: 'Service 5 Description', selector: '[data-field=services-card5-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card5-img', label: 'Service 5 Image', selector: '[data-field=services-card5-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card5-readmore-slug', label: 'Service 5 Read More Slug', selector: '[data-field=services-card5-readmore]', type: 'text', defaultVal: 'mep-works' },

      { key: 'services-card6-title', label: 'Service 6 Title', selector: '[data-field=services-card6-title]', type: 'text', defaultVal: 'General Construction' },
      { key: 'services-card6-desc', label: 'Service 6 Description', selector: '[data-field=services-card6-desc]', type: 'richtext', defaultVal: '' },
      { key: 'services-card6-img', label: 'Service 6 Image', selector: '[data-field=services-card6-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'services-card6-readmore-slug', label: 'Service 6 Read More Slug', selector: '[data-field=services-card6-readmore]', type: 'text', defaultVal: 'general-construction' }
    ],
    'services-cta': [
      { key: 'services-cta-title', label: 'CTA Title', selector: '[data-field=services-cta-title]', type: 'text', defaultVal: "Let's Build Your Next Project" },
      { key: 'services-cta-subtitle', label: 'CTA Subtitle', selector: '[data-field=services-cta-subtitle]', type: 'textarea', defaultVal: '' },
      { key: 'services-cta-btn', label: 'CTA Button Text', selector: '[data-field=services-cta-btn]', type: 'text', defaultVal: 'Contact Our Team' }
    ],
    'projects-hero': [
      { key: 'projects-hero-title', label: 'Page Title', selector: '[data-field=projects-hero-title]', type: 'text', defaultVal: 'Our Projects' },
      { key: 'projects-hero-subtitle', label: 'Subtitle', selector: '[data-field=projects-hero-subtitle]', type: 'textarea', defaultVal: 'Delivering excellence across marine, infrastructure, and industrial projects throughout Oman.' },
      { key: 'projects-hero-bg', label: 'Hero Background Image', selector: '[data-field=projects-hero-bg]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'projects-grid': [
      { key: 'projects-card1-title', label: 'Project 1 Title', selector: '[data-field=projects-card1-title]', type: 'text', defaultVal: 'Seaport Infrastructure' },
      { key: 'projects-card1-desc', label: 'Project 1 Description', selector: '[data-field=projects-card1-desc]', type: 'richtext', defaultVal: 'Quay wall construction and breakwater installation' },
      { key: 'projects-card1-location', label: 'Project 1 Location', selector: '[data-field=projects-card1-location]', type: 'text', defaultVal: 'Muscat, Oman' },
      { key: 'projects-card1-badge', label: 'Project 1 Category', selector: '[data-field=projects-card1-badge]', type: 'text', defaultVal: 'Marine' },
      { key: 'projects-card1-img', label: 'Project 1 Image', selector: '[data-field=projects-card1-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card1-readmore-slug', label: 'Project 1 Read More Slug', selector: '[data-field=projects-card1-readmore]', type: 'text', defaultVal: 'seaport-infrastructure' },

      { key: 'projects-card2-title', label: 'Project 2 Title', selector: '[data-field=projects-card2-title]', type: 'text', defaultVal: 'Coastal Protection Systems' },
      { key: 'projects-card2-desc', label: 'Project 2 Description', selector: '[data-field=projects-card2-desc]', type: 'richtext', defaultVal: 'Rock armour installation and coastal defense' },
      { key: 'projects-card2-location', label: 'Project 2 Location', selector: '[data-field=projects-card2-location]', type: 'text', defaultVal: 'Salalah, Oman' },
      { key: 'projects-card2-badge', label: 'Project 2 Category', selector: '[data-field=projects-card2-badge]', type: 'text', defaultVal: 'Coastal' },
      { key: 'projects-card2-img', label: 'Project 2 Image', selector: '[data-field=projects-card2-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card2-readmore-slug', label: 'Project 2 Read More Slug', selector: '[data-field=projects-card2-readmore]', type: 'text', defaultVal: 'coastal-protection' },

      { key: 'projects-card3-title', label: 'Project 3 Title', selector: '[data-field=projects-card3-title]', type: 'text', defaultVal: 'Road Infrastructure Development' },
      { key: 'projects-card3-desc', label: 'Project 3 Description', selector: '[data-field=projects-card3-desc]', type: 'richtext', defaultVal: 'Road construction and infrastructure development' },
      { key: 'projects-card3-location', label: 'Project 3 Location', selector: '[data-field=projects-card3-location]', type: 'text', defaultVal: 'Oman' },
      { key: 'projects-card3-badge', label: 'Project 3 Category', selector: '[data-field=projects-card3-badge]', type: 'text', defaultVal: 'Infrastructure' },
      { key: 'projects-card3-img', label: 'Project 3 Image', selector: '[data-field=projects-card3-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card3-readmore-slug', label: 'Project 3 Read More Slug', selector: '[data-field=projects-card3-readmore]', type: 'text', defaultVal: 'road-infrastructure' },

      { key: 'projects-card4-title', label: 'Project 4 Title', selector: '[data-field=projects-card4-title]', type: 'text', defaultVal: 'Asphalt Paving Works' },
      { key: 'projects-card4-desc', label: 'Project 4 Description', selector: '[data-field=projects-card4-desc]', type: 'richtext', defaultVal: 'Asphalt paving with modern equipment' },
      { key: 'projects-card4-location', label: 'Project 4 Location', selector: '[data-field=projects-card4-location]', type: 'text', defaultVal: 'Oman' },
      { key: 'projects-card4-badge', label: 'Project 4 Category', selector: '[data-field=projects-card4-badge]', type: 'text', defaultVal: 'Infrastructure' },
      { key: 'projects-card4-img', label: 'Project 4 Image', selector: '[data-field=projects-card4-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card4-readmore-slug', label: 'Project 4 Read More Slug', selector: '[data-field=projects-card4-readmore]', type: 'text', defaultVal: 'asphalt-paving' },

      { key: 'projects-card5-title', label: 'Project 5 Title', selector: '[data-field=projects-card5-title]', type: 'text', defaultVal: 'Underground Pipe Installation' },
      { key: 'projects-card5-desc', label: 'Project 5 Description', selector: '[data-field=projects-card5-desc]', type: 'richtext', defaultVal: 'Water and sewage pipe installation' },
      { key: 'projects-card5-location', label: 'Project 5 Location', selector: '[data-field=projects-card5-location]', type: 'text', defaultVal: 'Oman' },
      { key: 'projects-card5-badge', label: 'Project 5 Category', selector: '[data-field=projects-card5-badge]', type: 'text', defaultVal: 'Infrastructure' },
      { key: 'projects-card5-img', label: 'Project 5 Image', selector: '[data-field=projects-card5-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card5-readmore-slug', label: 'Project 5 Read More Slug', selector: '[data-field=projects-card5-readmore]', type: 'text', defaultVal: 'pipe-installation' },

      { key: 'projects-card6-title', label: 'Project 6 Title', selector: '[data-field=projects-card6-title]', type: 'text', defaultVal: 'Concrete Formwork' },
      { key: 'projects-card6-desc', label: 'Project 6 Description', selector: '[data-field=projects-card6-desc]', type: 'richtext', defaultVal: 'Concrete formwork and reinforcement works' },
      { key: 'projects-card6-location', label: 'Project 6 Location', selector: '[data-field=projects-card6-location]', type: 'text', defaultVal: 'Oman' },
      { key: 'projects-card6-badge', label: 'Project 6 Category', selector: '[data-field=projects-card6-badge]', type: 'text', defaultVal: 'Infrastructure' },
      { key: 'projects-card6-img', label: 'Project 6 Image', selector: '[data-field=projects-card6-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'projects-card6-readmore-slug', label: 'Project 6 Read More Slug', selector: '[data-field=projects-card6-readmore]', type: 'text', defaultVal: 'concrete-formwork' }
    ],
    'project-detail': [
      { key: 'project-detail-title', label: 'Project Title (English)', selector: '[data-field=project-detail-title]', type: 'text', defaultVal: '' },
      { key: 'project-detail-title-ar', label: 'Project Title (Arabic)', selector: '[data-field=project-detail-title]', type: 'text', defaultVal: '', rtl: true },
      { key: 'project-detail-subtitle', label: 'Subtitle / Tagline (English)', selector: '[data-field=project-detail-subtitle]', type: 'text', defaultVal: '' },
      { key: 'project-detail-subtitle-ar', label: 'Subtitle / Tagline (Arabic)', selector: '[data-field=project-detail-subtitle]', type: 'text', defaultVal: '', rtl: true },
      { key: 'project-detail-hero-img', label: 'Hero Image', selector: '[data-field=project-detail-hero-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'project-detail-location', label: 'Location', selector: '[data-field=project-detail-location]', type: 'text', defaultVal: '' },
      { key: 'project-detail-category', label: 'Category', selector: '[data-field=project-detail-category]', type: 'text', defaultVal: '' },
      { key: 'project-detail-client', label: 'Client', selector: '[data-field=project-detail-client]', type: 'text', defaultVal: '' },
      { key: 'project-detail-year', label: 'Year', selector: '[data-field=project-detail-year]', type: 'text', defaultVal: '' },
      { key: 'project-detail-content', label: 'Full Description (English)', selector: '[data-field=project-detail-content]', type: 'richtext', defaultVal: '' },
      { key: 'project-detail-content-ar', label: 'Full Description (Arabic)', selector: '[data-field=project-detail-content]', type: 'richtext', defaultVal: '', rtl: true },
      { key: 'project-detail-scope', label: 'Scope of Work (English)', selector: '[data-field=project-detail-scope]', type: 'richtext', defaultVal: '' },
      { key: 'project-detail-scope-ar', label: 'Scope of Work (Arabic)', selector: '[data-field=project-detail-scope]', type: 'richtext', defaultVal: '', rtl: true },
      { key: 'project-detail-img2', label: 'Gallery Image 2', selector: '[data-field=project-detail-img2]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'project-detail-img3', label: 'Gallery Image 3', selector: '[data-field=project-detail-img3]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'service-detail': [
      { key: 'service-detail-title', label: 'Service Title (English)', selector: '[data-field=service-detail-title]', type: 'text', defaultVal: '' },
      { key: 'service-detail-title-ar', label: 'Service Title (Arabic)', selector: '[data-field=service-detail-title]', type: 'text', defaultVal: '', rtl: true },
      { key: 'service-detail-subtitle', label: 'Subtitle / Tagline (English)', selector: '[data-field=service-detail-subtitle]', type: 'text', defaultVal: '' },
      { key: 'service-detail-subtitle-ar', label: 'Subtitle / Tagline (Arabic)', selector: '[data-field=service-detail-subtitle]', type: 'text', defaultVal: '', rtl: true },
      { key: 'service-detail-hero-img', label: 'Hero Image', selector: '[data-field=service-detail-hero-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'service-detail-content', label: 'Full Description (English)', selector: '[data-field=service-detail-content]', type: 'richtext', defaultVal: '' },
      { key: 'service-detail-content-ar', label: 'Full Description (Arabic)', selector: '[data-field=service-detail-content]', type: 'richtext', defaultVal: '', rtl: true },
      { key: 'service-detail-features', label: 'Key Features / Capabilities (English)', selector: '[data-field=service-detail-features]', type: 'richtext', defaultVal: '' },
      { key: 'service-detail-features-ar', label: 'Key Features / Capabilities (Arabic)', selector: '[data-field=service-detail-features]', type: 'richtext', defaultVal: '', rtl: true },
      { key: 'service-detail-process', label: 'Our Process / Approach (English)', selector: '[data-field=service-detail-process]', type: 'richtext', defaultVal: '' },
      { key: 'service-detail-process-ar', label: 'Our Process / Approach (Arabic)', selector: '[data-field=service-detail-process]', type: 'richtext', defaultVal: '', rtl: true },
      { key: 'service-detail-img2', label: 'Gallery Image 2', selector: '[data-field=service-detail-img2]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'service-detail-img3', label: 'Gallery Image 3', selector: '[data-field=service-detail-img3]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'clients-hero': [
      { key: 'clients-hero-title', label: 'Page Title', selector: '[data-field=clients-hero-title]', type: 'text', defaultVal: 'Our Clients' },
      { key: 'clients-hero-subtitle', label: 'Subtitle', selector: '[data-field=clients-hero-subtitle]', type: 'textarea', defaultVal: 'Trusted by leading organizations across the Sultanate of Oman and the wider Gulf region.' },
      { key: 'clients-hero-bg', label: 'Hero Background Image', selector: '[data-field=clients-hero-bg]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'clients-grid': [
      { key: 'clients-grid-title', label: 'Section Title', selector: '[data-field=clients-grid-title]', type: 'text', defaultVal: 'Trusted by Leading Organizations' },
      { key: 'clients-grid-subtitle', label: 'Section Subtitle', selector: '[data-field=clients-grid-subtitle]', type: 'textarea', defaultVal: 'We are proud to work with some of the most respected organizations in the region.' },
      { key: 'clients-logo1-name', label: 'Client 1 Name', selector: '[data-field=clients-logo1-name]', type: 'text', defaultVal: 'Doosan Heavy Industries' },
      { key: 'clients-logo1-img', label: 'Client 1 Logo', selector: '[data-field=clients-logo1-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo2-name', label: 'Client 2 Name', selector: '[data-field=clients-logo2-name]', type: 'text', defaultVal: 'Al Jazeera International' },
      { key: 'clients-logo2-img', label: 'Client 2 Logo', selector: '[data-field=clients-logo2-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo3-name', label: 'Client 3 Name', selector: '[data-field=clients-logo3-name]', type: 'text', defaultVal: 'Al-Hashemi & Al-Rawas' },
      { key: 'clients-logo3-img', label: 'Client 3 Logo', selector: '[data-field=clients-logo3-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo4-name', label: 'Client 4 Name', selector: '[data-field=clients-logo4-name]', type: 'text', defaultVal: 'Fisia Italimpianti' },
      { key: 'clients-logo4-img', label: 'Client 4 Logo', selector: '[data-field=clients-logo4-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo5-name', label: 'Client 5 Name', selector: '[data-field=clients-logo5-name]', type: 'text', defaultVal: 'GPS In The New Millennium' },
      { key: 'clients-logo5-img', label: 'Client 5 Logo', selector: '[data-field=clients-logo5-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo6-name', label: 'Client 6 Name', selector: '[data-field=clients-logo6-name]', type: 'text', defaultVal: 'Makyol' },
      { key: 'clients-logo6-img', label: 'Client 6 Logo', selector: '[data-field=clients-logo6-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo7-name', label: 'Client 7 Name', selector: '[data-field=clients-logo7-name]', type: 'text', defaultVal: 'Omran' },
      { key: 'clients-logo7-img', label: 'Client 7 Logo', selector: '[data-field=clients-logo7-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo8-name', label: 'Client 8 Name', selector: '[data-field=clients-logo8-name]', type: 'text', defaultVal: 'Salalah Sanitary Drainage' },
      { key: 'clients-logo8-img', label: 'Client 8 Logo', selector: '[data-field=clients-logo8-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo9-name', label: 'Client 9 Name', selector: '[data-field=clients-logo9-name]', type: 'text', defaultVal: 'SNC-Lavalin' },
      { key: 'clients-logo9-img', label: 'Client 9 Logo', selector: '[data-field=clients-logo9-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo10-name', label: 'Client 10 Name', selector: '[data-field=clients-logo10-name]', type: 'text', defaultVal: 'STFA' },
      { key: 'clients-logo10-img', label: 'Client 10 Logo', selector: '[data-field=clients-logo10-img]', type: 'image', attr: 'src', defaultVal: '' },
      { key: 'clients-logo11-name', label: 'Client 11 Name', selector: '[data-field=clients-logo11-name]', type: 'text', defaultVal: 'TAV Construction' },
      { key: 'clients-logo11-img', label: 'Client 11 Logo', selector: '[data-field=clients-logo11-img]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'clients-sectors': [
      { key: 'clients-sectors-title', label: 'Section Title', selector: '[data-field=clients-sectors-title]', type: 'text', defaultVal: 'Sectors We Serve' },
      { key: 'clients-sector1-name', label: 'Sector 1 Name', selector: '[data-field=clients-sector1-name]', type: 'text', defaultVal: 'Marine & Ports' },
      { key: 'clients-sector2-name', label: 'Sector 2 Name', selector: '[data-field=clients-sector2-name]', type: 'text', defaultVal: 'Infrastructure & Transport' },
      { key: 'clients-sector3-name', label: 'Sector 3 Name', selector: '[data-field=clients-sector3-name]', type: 'text', defaultVal: 'Government & Public Sector' },
      { key: 'clients-sector4-name', label: 'Sector 4 Name', selector: '[data-field=clients-sector4-name]', type: 'text', defaultVal: 'Energy & Utilities' },
      { key: 'clients-sector5-name', label: 'Sector 5 Name', selector: '[data-field=clients-sector5-name]', type: 'text', defaultVal: 'Commercial & Residential' },
      { key: 'clients-sector6-name', label: 'Sector 6 Name', selector: '[data-field=clients-sector6-name]', type: 'text', defaultVal: 'Healthcare' }
    ],
    'careers-hero': [
      { key: 'careers-hero-title', label: 'Page Title', selector: '[data-field=careers-hero-title]', type: 'text', defaultVal: 'Careers' },
      { key: 'careers-hero-subtitle', label: 'Subtitle', selector: '[data-field=careers-hero-subtitle]', type: 'textarea', defaultVal: 'Join our team and help build the future of Oman\'s infrastructure.' },
      { key: 'careers-hero-bg', label: 'Hero Background Image', selector: '[data-field=careers-hero-bg]', type: 'image', attr: 'src', defaultVal: '' }
    ],
    'careers-intro': [
      { key: 'careers-intro-title', label: 'Section Title', selector: '[data-field=careers-intro-title]', type: 'text', defaultVal: 'Work With Us' },
      { key: 'careers-intro-subtitle', label: 'Section Subtitle', selector: '[data-field=careers-intro-subtitle]', type: 'textarea', defaultVal: 'Cahit Trading & Contracting LLC offers exciting career opportunities in marine construction, infrastructure development, and engineering.' },
      { key: 'careers-card1-title', label: 'Card 1 Title', selector: '[data-field=careers-card1-title]', type: 'text', defaultVal: 'Team Culture' },
      { key: 'careers-card1-desc', label: 'Card 1 Description', selector: '[data-field=careers-card1-desc]', type: 'textarea', defaultVal: 'We foster a collaborative environment where every team member\'s contribution is valued and recognized.' },
      { key: 'careers-card2-title', label: 'Card 2 Title', selector: '[data-field=careers-card2-title]', type: 'text', defaultVal: 'Professional Growth' },
      { key: 'careers-card2-desc', label: 'Card 2 Description', selector: '[data-field=careers-card2-desc]', type: 'textarea', defaultVal: 'We invest in continuous training and development to help our employees grow their skills and advance their careers.' },
      { key: 'careers-card3-title', label: 'Card 3 Title', selector: '[data-field=careers-card3-title]', type: 'text', defaultVal: 'Safety First' },
      { key: 'careers-card3-desc', label: 'Card 3 Description', selector: '[data-field=careers-card3-desc]', type: 'textarea', defaultVal: 'We maintain the highest safety standards across all our operations, ensuring a safe workplace for everyone.' }
    ],
    'careers-cta': [
      { key: 'careers-cta-title', label: 'CTA Title', selector: '[data-field=careers-cta-title]', type: 'text', defaultVal: 'Interested in Joining Our Team?' },
      { key: 'careers-cta-subtitle', label: 'CTA Subtitle', selector: '[data-field=careers-cta-subtitle]', type: 'textarea', defaultVal: 'Send your CV to our email and our HR team will review your application.' },
      { key: 'careers-cta-btn1', label: 'Button 1 Text', selector: '[data-field=careers-cta-btn1]', type: 'text', defaultVal: 'Send Your CV' },
      { key: 'careers-cta-btn2', label: 'Button 2 Text', selector: '[data-field=careers-cta-btn2]', type: 'text', defaultVal: 'Contact Us' }
    ]
  };

  var sectionScrollTargets = {
    hero: '.hero-section', logos: '.logos-section', 'about-preview': '.about-preview-section',
    services: '#services-section', marine: '.marine-section', stats: '#stats-section',
    projects: '#projects-section', leadership: '.leadership-section', cta: '.cta-section',
    header: 'header', footer: 'footer',
    'blog-hero': '[data-testid=section-blog-hero]', 'blog-posts': '[data-testid=section-blog-posts]',
    'about-hero': '[data-testid=section-about-hero]', 'about-overview': '[data-testid=section-company-overview]',
    'about-mission': '[data-testid=section-mission-vision]', 'about-leadership': '[data-testid=section-leadership]',
    'about-commitment': '[data-testid=section-commitment]',
    'about-clients': '[data-testid=section-clients]',
    'services-hero': '[data-testid=section-services-hero]', 'services-list': '[data-testid=section-services-list]',
    'services-cta': '[data-testid=section-cta]',
    'projects-hero': '[data-testid=section-projects-hero]', 'projects-grid': '[data-testid=section-projects-grid]',
    'project-detail': '[data-testid=section-projects-grid]', 'service-detail': '[data-testid=section-services-list]',
    'clients-hero': '[data-testid=section-clients-hero]', 'clients-grid': '[data-testid=section-clients-grid]',
    'clients-sectors': '[data-testid=section-sectors]',
    'careers-hero': '[data-testid=section-careers-hero]', 'careers-intro': '[data-testid=section-careers-intro]',
    'careers-cta': '[data-testid=section-careers-cta]'
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
      { id: 'blog-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'blog-posts', name: 'Blog Posts Section', group: 'Page Sections' }
    ],
    '/about': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'about-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'about-overview', name: 'Company Overview', group: 'Page Sections' },
      { id: 'about-mission', name: 'Mission & Vision', group: 'Page Sections' },
      { id: 'about-leadership', name: 'Leadership', group: 'Page Sections' },
      { id: 'about-commitment', name: 'Our Commitment', group: 'Page Sections' },
      { id: 'about-clients', name: 'Client Logos', group: 'Page Sections' }
    ],
    '/services': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'services-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'services-list', name: 'Service Cards', group: 'Page Sections' },
      { id: 'services-cta', name: 'Call to Action', group: 'Page Sections' },
      { id: 'service-detail', name: 'Service Detail Page Content', group: 'Detail Pages' }
    ],
    '/projects': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'projects-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'projects-grid', name: 'Project Cards', group: 'Page Sections' },
      { id: 'project-detail', name: 'Project Detail Page Content', group: 'Detail Pages' }
    ],
    '/clients': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'clients-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'clients-grid', name: 'Client Logos', group: 'Page Sections' },
      { id: 'clients-sectors', name: 'Sectors We Serve', group: 'Page Sections' }
    ],
    '/careers': [
      { id: 'header', name: 'Header & Navigation', group: 'Global' },
      { id: 'footer', name: 'Footer', group: 'Global' },
      { id: 'careers-hero', name: 'Hero Banner', group: 'Page Sections' },
      { id: 'careers-intro', name: 'Work With Us', group: 'Page Sections' },
      { id: 'careers-cta', name: 'Call to Action', group: 'Page Sections' }
    ]
  };

  function renderCardManager() {
    if (!state.cardManagerType) state.cardManagerType = 'projects';
    var cards = state.cardManagerType === 'projects' ? (state.projectCards || []) : (state.serviceCards || []);
    var isProjects = state.cardManagerType === 'projects';

    var cardsHtml = '';
    if (cards.length === 0) {
      cardsHtml = '<div class="empty-state" style="padding:40px;text-align:center"><div class="empty-state-title">No cards yet</div><p>Click "Add New Card" to create your first ' + (isProjects ? 'project' : 'service') + ' card.</p></div>';
    } else {
      cards.forEach(function(card, idx) {
        cardsHtml += '<div class="card-manager-item" data-index="' + idx + '" data-testid="card-item-' + idx + '">' +
          '<div class="card-manager-drag">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="16" y1="12" x2="16" y2="12.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>' +
          '</div>' +
          '<div class="card-manager-thumb">' +
            (card.img ? '<img src="' + card.img + '" alt="" />' : '<div class="card-manager-thumb-placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>') +
          '</div>' +
          '<div class="card-manager-info">' +
            '<div class="card-manager-title">' + (card.title || 'Untitled') + '</div>' +
            '<div class="card-manager-slug">' + (isProjects ? '/projects/' : '/services/') + (card.slug || '') + '</div>' +
            (isProjects ? '<div class="card-manager-meta">' + (card.badge || '') + (card.location ? ' &middot; ' + card.location : '') + '</div>' : '') +
          '</div>' +
          '<div class="card-manager-actions">' +
            '<button class="btn-icon card-move-up" data-idx="' + idx + '" title="Move Up" data-testid="btn-move-up-' + idx + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></button>' +
            '<button class="btn-icon card-move-down" data-idx="' + idx + '" title="Move Down" data-testid="btn-move-down-' + idx + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>' +
            '<button class="btn-icon card-edit-btn" data-idx="' + idx + '" title="Edit" data-testid="btn-edit-card-' + idx + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button class="btn-icon card-delete-btn" data-idx="' + idx + '" title="Delete" data-testid="btn-delete-card-' + idx + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
          '</div>' +
        '</div>';
      });
    }

    var editFormHtml = '';
    if (state.editingCardIndex !== undefined && state.editingCardIndex !== null) {
      var ec = cards[state.editingCardIndex] || {};
      editFormHtml = '<div class="card-edit-form" data-testid="card-edit-form">' +
        '<h3 style="margin:0 0 16px;font-size:1.1rem;font-weight:600;color:#0A3D6B">Edit ' + (isProjects ? 'Project' : 'Service') + ' Card</h3>' +
        '<div class="form-group"><label class="form-label">Title</label><input class="form-input card-field" data-card-field="title" value="' + (ec.title || '').replace(/"/g,'&quot;') + '" data-testid="input-card-title" /></div>' +
        '<div class="form-group"><label class="form-label">Slug (URL path)</label><input class="form-input card-field" data-card-field="slug" value="' + (ec.slug || '').replace(/"/g,'&quot;') + '" data-testid="input-card-slug" placeholder="e.g. my-project-name" /></div>' +
        '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea card-field" data-card-field="desc" data-testid="input-card-desc" rows="3">' + (ec.desc || '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Image URL</label><input class="form-input card-field" data-card-field="img" value="' + (ec.img || '').replace(/"/g,'&quot;') + '" data-testid="input-card-img" />' +
          '<div class="card-img-upload" style="margin-top:8px">' +
            '<input type="file" class="upload-file-input" id="cardImgUpload" accept="image/*" data-testid="upload-card-img" style="display:none" />' +
            '<button class="btn btn-outline btn-sm" id="cardImgUploadBtn" data-testid="btn-upload-card-img" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Image</button>' +
            (ec.img ? '<img src="' + ec.img + '" style="height:60px;border-radius:8px;margin-left:10px;object-fit:cover" />' : '') +
          '</div>' +
        '</div>' +
        (isProjects ? '<div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<div class="form-group"><label class="form-label">Category Badge</label><input class="form-input card-field" data-card-field="badge" value="' + (ec.badge || '').replace(/"/g,'&quot;') + '" data-testid="input-card-badge" /></div>' +
          '<div class="form-group"><label class="form-label">Location</label><input class="form-input card-field" data-card-field="location" value="' + (ec.location || '').replace(/"/g,'&quot;') + '" data-testid="input-card-location" /></div>' +
        '</div>' : '') +
        (!isProjects ? '<div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<div class="form-group"><label class="form-label">Title (Arabic)</label><input class="form-input card-field" data-card-field="titleAr" value="' + (ec.titleAr || '').replace(/"/g,'&quot;') + '" dir="rtl" data-testid="input-card-titleAr" /></div>' +
          '<div class="form-group"><label class="form-label">Description (Arabic)</label><input class="form-input card-field" data-card-field="descAr" value="' + (ec.descAr || '').replace(/"/g,'&quot;') + '" dir="rtl" data-testid="input-card-descAr" /></div>' +
        '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:16px">' +
          '<button class="btn btn-primary" id="saveCardEditBtn" data-testid="btn-save-card-edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Save Card</button>' +
          '<button class="btn btn-outline" id="cancelCardEditBtn" data-testid="btn-cancel-card-edit">Cancel</button>' +
        '</div>' +
      '</div>';
    }

    return '' +
      '<div class="toolbar">' +
        '<h2 style="margin:0;font-weight:600;font-size:1rem;color:#0A3D6B">Card Manager</h2>' +
        '<div class="toolbar-spacer"></div>' +
      '</div>' +
      '<div style="padding:24px">' +
        '<div style="display:flex;gap:12px;margin-bottom:20px;align-items:center;flex-wrap:wrap">' +
          '<div class="card-type-tabs" data-testid="card-type-tabs">' +
            '<button class="card-type-tab' + (isProjects ? ' active' : '') + '" data-type="projects" data-testid="tab-projects">Projects (' + (state.projectCards || []).length + ')</button>' +
            '<button class="card-type-tab' + (!isProjects ? ' active' : '') + '" data-type="services" data-testid="tab-services">Services (' + (state.serviceCards || []).length + ')</button>' +
          '</div>' +
          '<div style="flex:1"></div>' +
          '<button class="btn btn-primary" id="addNewCardBtn" data-testid="btn-add-card"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add New Card</button>' +
          '<button class="btn btn-outline" id="saveAllCardsBtn" data-testid="btn-save-all-cards"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save & Publish</button>' +
        '</div>' +
        '<p style="font-size:13px;color:#64748b;margin-bottom:16px">Add, edit, reorder, or remove ' + (isProjects ? 'project' : 'service') + ' cards. Click "Save & Publish" to update the live site. Each card automatically gets a "Read More" link to its detail page.</p>' +
        '<div class="card-manager-list" data-testid="card-manager-list">' + cardsHtml + '</div>' +
        editFormHtml +
      '</div>';
  }

  function bindCardManagerActions() {
    document.querySelectorAll('.card-type-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.cardManagerType = this.getAttribute('data-type');
        state.editingCardIndex = null;
        renderPage('cards');
      });
    });

    var addBtn = document.getElementById('addNewCardBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        var newId = (isProjects ? 'proj-' : 'svc-') + Date.now();
        var newCard = { id: newId, title: '', slug: '', desc: '', img: '' };
        if (isProjects) { newCard.badge = ''; newCard.location = ''; }
        else { newCard.titleAr = ''; newCard.descAr = ''; }
        cards.push(newCard);
        if (isProjects) state.projectCards = cards; else state.serviceCards = cards;
        state.editingCardIndex = cards.length - 1;
        renderPage('cards');
      });
    }

    document.querySelectorAll('.card-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.editingCardIndex = parseInt(this.getAttribute('data-idx'));
        renderPage('cards');
      });
    });

    document.querySelectorAll('.card-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        var cardTitle = cards[idx] ? cards[idx].title : '';
        if (confirm('Delete "' + (cardTitle || 'this card') + '"? This cannot be undone.')) {
          cards.splice(idx, 1);
          if (isProjects) state.projectCards = cards; else state.serviceCards = cards;
          state.editingCardIndex = null;
          renderPage('cards');
          showToast('Card deleted. Click "Save & Publish" to update the live site.', 'success');
        }
      });
    });

    document.querySelectorAll('.card-move-up').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        if (idx <= 0) return;
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        var temp = cards[idx]; cards[idx] = cards[idx - 1]; cards[idx - 1] = temp;
        if (isProjects) state.projectCards = cards; else state.serviceCards = cards;
        state.editingCardIndex = null;
        renderPage('cards');
      });
    });

    document.querySelectorAll('.card-move-down').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        if (idx >= cards.length - 1) return;
        var temp = cards[idx]; cards[idx] = cards[idx + 1]; cards[idx + 1] = temp;
        if (isProjects) state.projectCards = cards; else state.serviceCards = cards;
        state.editingCardIndex = null;
        renderPage('cards');
      });
    });

    var cancelBtn = document.getElementById('cancelCardEditBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        state.editingCardIndex = null;
        renderPage('cards');
      });
    }

    var saveEditBtn = document.getElementById('saveCardEditBtn');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', function() {
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        var card = cards[state.editingCardIndex];
        if (!card) return;
        document.querySelectorAll('.card-field').forEach(function(f) {
          var field = f.getAttribute('data-card-field');
          card[field] = f.tagName === 'TEXTAREA' ? f.value : f.value;
        });
        if (!card.slug && card.title) {
          card.slug = card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (isProjects) state.projectCards = cards; else state.serviceCards = cards;
        state.editingCardIndex = null;
        renderPage('cards');
        showToast('Card updated. Click "Save & Publish" to update the live site.', 'success');
      });
    }

    var uploadBtn = document.getElementById('cardImgUploadBtn');
    var uploadInput = document.getElementById('cardImgUpload');
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', function() { uploadInput.click(); });
      uploadInput.addEventListener('change', function() {
        if (!this.files || !this.files[0]) return;
        var formData = new FormData();
        formData.append('file', this.files[0]);
        fetch('/admin/api/upload', { method: 'POST', headers: authHeaders(), body: formData })
          .then(function(r) { return r.json(); })
          .then(function(result) {
            if (result.success && result.url) {
              var imgField = document.querySelector('[data-card-field="img"]');
              if (imgField) imgField.value = result.url;
              showToast('Image uploaded', 'success');
            }
          }).catch(function() { showToast('Upload failed', 'error'); });
      });
    }

    var saveAllBtn = document.getElementById('saveAllCardsBtn');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', function() {
        var isProjects = state.cardManagerType === 'projects';
        var cards = isProjects ? (state.projectCards || []) : (state.serviceCards || []);
        var type = isProjects ? 'projects' : 'services';
        saveAllBtn.disabled = true;
        saveAllBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving...';
        fetch('/admin/api/dynamic-cards/' + type, {
          method: 'PUT',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ cards: cards })
        }).then(function(r) { return r.json(); }).then(function(result) {
          saveAllBtn.disabled = false;
          saveAllBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save & Publish';
          if (result.success) {
            showToast(cards.length + ' ' + type + ' cards saved and published!', 'success');
          } else {
            showToast('Error saving: ' + (result.error || 'Unknown'), 'error');
          }
        }).catch(function() {
          saveAllBtn.disabled = false;
          saveAllBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save & Publish';
          showToast('Error saving cards', 'error');
        });
      });
    }
  }

  function loadDynamicCards() {
    fetch('/admin/api/dynamic-cards/projects', { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.cards) state.projectCards = d.cards;
    }).catch(function() {});
    fetch('/admin/api/dynamic-cards/services', { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success && d.cards) state.serviceCards = d.cards;
    }).catch(function() {});
  }

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

    var isDetailSection = (state.editingSection === 'project-detail' || state.editingSection === 'service-detail');
    var detailSlugs = [];
    if (state.editingSection === 'project-detail') {
      detailSlugs = [
        { slug: 'seaport-infrastructure', label: 'Seaport Infrastructure' },
        { slug: 'coastal-protection', label: 'Coastal Protection Systems' },
        { slug: 'road-infrastructure', label: 'Road Infrastructure Development' },
        { slug: 'asphalt-paving', label: 'Asphalt Paving Works' },
        { slug: 'pipe-installation', label: 'Underground Pipe Installation' },
        { slug: 'concrete-formwork', label: 'Concrete Formwork' }
      ];
    } else if (state.editingSection === 'service-detail') {
      detailSlugs = [
        { slug: 'marine-coastal-construction', label: 'Marine & Coastal Construction' },
        { slug: 'infrastructure-development', label: 'Infrastructure Development' },
        { slug: 'earthworks', label: 'Earthworks' },
        { slug: 'dewatering-shoring', label: 'Dewatering & Shoring' },
        { slug: 'mep-works', label: 'MEP Works' },
        { slug: 'general-construction', label: 'General Construction' }
      ];
    }

    var fields = sectionFields[state.editingSection] || [];
    var fieldsHtml = '';

    if (isDetailSection) {
      if (!state.detailSlug && detailSlugs.length > 0) state.detailSlug = detailSlugs[0].slug;
      fieldsHtml += '<div class="form-group" style="margin-bottom:16px;padding-bottom:16px;border-bottom:2px solid #e2e8f0">' +
        '<label class="form-label" style="font-weight:700;color:#0A3D6B">Select ' + (state.editingSection === 'project-detail' ? 'Project' : 'Service') + ' to Edit</label>' +
        '<select class="form-input" id="detailSlugSelector" data-testid="select-detail-slug" style="font-weight:600">' +
          detailSlugs.map(function(d) {
            return '<option value="' + d.slug + '"' + (d.slug === state.detailSlug ? ' selected' : '') + '>' + d.label + '</option>';
          }).join('') +
        '</select>' +
        '<p style="font-size:12px;color:#64748b;margin-top:4px">This content appears on the detail page: <strong>/' + (state.editingSection === 'project-detail' ? 'projects' : 'services') + '/' + (state.detailSlug || detailSlugs[0].slug) + '</strong></p>' +
      '</div>';
    }

    // Build a quick lookup of which keys have an Arabic counterpart in this
    // section. Used to render "Translate to Arabic" buttons next to the EN
    // fields. We treat any field whose `${key}-ar` exists in the same section
    // as the source side of an EN→AR pair.
    var arPairKeys = {};
    fields.forEach(function(ff) { arPairKeys[ff.key] = true; });
    function makeTranslateBtn(enKey) {
      var arKey = enKey + '-ar';
      if (!arPairKeys[arKey]) return '';
      return '<button type="button" class="ai-translate-pair-btn" data-source-key="' + enKey + '" data-target-key="' + arKey + '" data-testid="button-translate-' + enKey + '" ' +
        'style="margin-left:8px;background:#f59e0b;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px" ' +
        'title="Translate the text in this field to Arabic and place it in the matching Arabic field below">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>' +
        'Translate → Arabic</button>';
    }

    if (fields.length > 0) {
      fields.forEach(function(f) {
        var rawVal = state.editedContent[f.key];
        if (rawVal === undefined || rawVal === null) rawVal = f.defaultVal;
        var val = (rawVal === undefined || rawVal === null) ? '' : String(rawVal);
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
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtn(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage and extra whitespace from this field" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<textarea class="form-textarea live-edit-field" data-key="' + f.key + '" data-selector="' + f.selector + '" data-testid="field-' + f.key + '">' + val + '</textarea>' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (val || '').length + ' chars</span></div>' +
          '</div>';
        } else if (f.type === 'richtext') {
          var rtHtml = (typeof rteInitialHtml === 'function') ? rteInitialHtml(val || '') : (val || '');
          var rtlAttr = f.rtl ? ' dir="rtl"' : '';
          var rtlStyle = f.rtl ? 'text-align:right;font-family:\'Noto Sans Arabic\',Arial,sans-serif;' : '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtn(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage and extra whitespace from this field" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<div class="rte-mini-toolbar" data-rte-target="rte-' + f.key + '" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;background:#f1f5f9;border:1px solid #e2e8f0;border-bottom:none;border-radius:6px 6px 0 0;padding:4px">' +
              '<button type="button" class="rte-mini-btn" data-cmd="bold" title="Bold (select text first)" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;font-weight:700;min-width:28px">B</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="italic" title="Italic (select text first)" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;font-style:italic;min-width:28px">I</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="underline" title="Underline (select text first)" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;text-decoration:underline;min-width:28px">U</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="insertUnorderedList" title="Bulleted list (place cursor on a line)" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">&bull; List</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="insertOrderedList" title="Numbered list (place cursor on a line)" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">1. List</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="removeFormat" title="Clear formatting" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">Clear</button>' +
              '<span style="margin-left:auto;font-size:11px;color:#64748b;padding:0 6px">Tip: Ctrl+Shift+V pastes as plain text</span>' +
            '</div>' +
            '<div class="rte-editor rte-mini-editor live-edit-richtext" id="rte-' + f.key + '"' + rtlAttr + ' contenteditable="true" data-key="' + f.key + '" data-selector="' + f.selector + '" data-testid="field-' + f.key + '" style="min-height:120px;border:1px solid #e2e8f0;border-radius:0 0 6px 6px;padding:10px 12px;background:#fff;font-size:14px;line-height:1.6;outline:none;' + rtlStyle + '">' + rtHtml + '</div>' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (rtHtml || '').replace(/<[^>]+>/g, '').length + ' chars</span></div>' +
          '</div>';
        } else {
          var rtlAttrIn = f.rtl ? ' dir="rtl"' : '';
          var rtlStyleIn = f.rtl ? ' style="text-align:right;font-family:\'Noto Sans Arabic\',Arial,sans-serif"' : '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtn(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage and extra whitespace from this field" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<input class="form-input live-edit-field"' + rtlAttrIn + rtlStyleIn + ' data-key="' + f.key + '" data-selector="' + f.selector + '" value="' + val.replace(/"/g, '&quot;') + '" data-testid="field-' + f.key + '" />' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (val || '').length + ' chars</span></div>' +
          '</div>';
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
        '<button class="btn btn-outline" id="translateAllBtn" data-testid="button-translate-all" title="Translate every EN field in this section to Arabic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg> Translate All</button>' +
        '<button class="btn btn-outline" id="revisionsBtn" data-testid="button-revisions" title="View revision history for this section"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> History</button>' +
        '<span id="unsavedBadge" style="display:none;align-self:center;font-size:11px;color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:999px;padding:2px 8px;font-weight:600">Unsaved</span>' +
        '<span id="autosaveBadge" style="display:none;align-self:center;font-size:11px;color:#166534;background:#dcfce7;border:1px solid #bbf7d0;border-radius:999px;padding:2px 8px;font-weight:600">Saved</span>' +
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

  // Build only the fields-panel HTML for a given section+slug without touching
  // the rest of the editor layout or the preview iframe.
  function buildSectionFieldsHtml(section, detailSlug) {
    var isDetailSection = (section === 'project-detail' || section === 'service-detail');
    var detailSlugs = [];
    if (section === 'project-detail') {
      detailSlugs = [
        { slug: 'seaport-infrastructure', label: 'Seaport Infrastructure' },
        { slug: 'coastal-protection', label: 'Coastal Protection Systems' },
        { slug: 'road-infrastructure', label: 'Road Infrastructure Development' },
        { slug: 'asphalt-paving', label: 'Asphalt Paving Works' },
        { slug: 'pipe-installation', label: 'Underground Pipe Installation' },
        { slug: 'concrete-formwork', label: 'Concrete Formwork' }
      ];
    } else if (section === 'service-detail') {
      detailSlugs = [
        { slug: 'marine-coastal-construction', label: 'Marine & Coastal Construction' },
        { slug: 'infrastructure-development', label: 'Infrastructure Development' },
        { slug: 'earthworks', label: 'Earthworks' },
        { slug: 'dewatering-shoring', label: 'Dewatering & Shoring' },
        { slug: 'mep-works', label: 'MEP Works' },
        { slug: 'general-construction', label: 'General Construction' }
      ];
    }
    var currentDetailSlug = detailSlug || (detailSlugs.length ? detailSlugs[0].slug : '');
    var fields = sectionFields[section] || [];
    var fieldsHtml = '';
    if (isDetailSection) {
      fieldsHtml += '<div class="form-group" style="margin-bottom:16px;padding-bottom:16px;border-bottom:2px solid #e2e8f0">' +
        '<label class="form-label" style="font-weight:700;color:#0A3D6B">Select ' + (section === 'project-detail' ? 'Project' : 'Service') + ' to Edit</label>' +
        '<select class="form-input" id="detailSlugSelector" data-testid="select-detail-slug" style="font-weight:600">' +
          detailSlugs.map(function(d) {
            return '<option value="' + d.slug + '"' + (d.slug === currentDetailSlug ? ' selected' : '') + '>' + d.label + '</option>';
          }).join('') +
        '</select>' +
        '<p style="font-size:12px;color:#64748b;margin-top:4px">This content appears on the detail page: <strong>/' + (section === 'project-detail' ? 'projects' : 'services') + '/' + currentDetailSlug + '</strong></p>' +
      '</div>';
    }
    var arPairKeys = {};
    fields.forEach(function(ff) { arPairKeys[ff.key] = true; });
    function makeTranslateBtnLocal(enKey) {
      var arKey = enKey + '-ar';
      if (!arPairKeys[arKey]) return '';
      return '<button type="button" class="ai-translate-pair-btn" data-source-key="' + enKey + '" data-target-key="' + arKey + '" data-testid="button-translate-' + enKey + '" ' +
        'style="margin-left:8px;background:#f59e0b;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px" ' +
        'title="Translate the text in this field to Arabic and place it in the matching Arabic field below">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>' +
        'Translate → Arabic</button>';
    }
    if (fields.length > 0) {
      fields.forEach(function(f) {
        var rawVal = state.editedContent[f.key];
        if (rawVal === undefined || rawVal === null) rawVal = f.defaultVal;
        var val = (rawVal === undefined || rawVal === null) ? '' : String(rawVal);
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
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtnLocal(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<textarea class="form-textarea live-edit-field" data-key="' + f.key + '" data-selector="' + f.selector + '" data-testid="field-' + f.key + '">' + val + '</textarea>' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (val || '').length + ' chars</span></div>' +
          '</div>';
        } else if (f.type === 'richtext') {
          var rtHtml = val || '';
          var rtlAttr = f.rtl ? ' dir="rtl"' : '';
          var rtlStyle = f.rtl ? 'text-align:right;font-family:\'Noto Sans Arabic\',Arial,sans-serif;' : '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtnLocal(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<div class="rte-mini-toolbar" data-rte-target="rte-' + f.key + '" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;background:#f1f5f9;border:1px solid #e2e8f0;border-bottom:none;border-radius:6px 6px 0 0;padding:4px">' +
              '<button type="button" class="rte-mini-btn" data-cmd="bold" title="Bold" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;font-weight:700;min-width:28px">B</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="italic" title="Italic" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;font-style:italic;min-width:28px">I</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="underline" title="Underline" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer;text-decoration:underline;min-width:28px">U</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="insertUnorderedList" title="Bulleted list" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">&bull; List</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="insertOrderedList" title="Numbered list" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">1. List</button>' +
              '<button type="button" class="rte-mini-btn" data-cmd="removeFormat" title="Clear formatting" style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;cursor:pointer">Clear</button>' +
              '<span style="margin-left:auto;font-size:11px;color:#64748b;padding:0 6px">Tip: Ctrl+Shift+V pastes as plain text</span>' +
            '</div>' +
            '<div class="rte-editor rte-mini-editor live-edit-richtext" id="rte-' + f.key + '"' + rtlAttr + ' contenteditable="true" data-key="' + f.key + '" data-selector="' + f.selector + '" data-testid="field-' + f.key + '" style="min-height:120px;border:1px solid #e2e8f0;border-radius:0 0 6px 6px;padding:10px 12px;background:#fff;font-size:14px;line-height:1.6;outline:none;' + rtlStyle + '">' + rtHtml + '</div>' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (rtHtml || '').replace(/<[^>]+>/g, '').length + ' chars</span></div>' +
          '</div>';
        } else {
          var rtlAttrIn = f.rtl ? ' dir="rtl"' : '';
          var rtlStyleIn = f.rtl ? ' style="text-align:right;font-family:\'Noto Sans Arabic\',Arial,sans-serif"' : '';
          fieldsHtml += '<div class="form-group"><label class="form-label">' + f.label + makeTranslateBtnLocal(f.key) +
              ' <button type="button" class="clean-field-btn" data-clean-key="' + f.key + '" title="Strip Word/MSO garbage" style="margin-left:6px;font-size:11px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:4px;padding:2px 8px;cursor:pointer">Clean</button>' +
            '</label>' +
            '<input class="form-input live-edit-field"' + rtlAttrIn + rtlStyleIn + ' data-key="' + f.key + '" data-selector="' + f.selector + '" value="' + val.replace(/"/g, '&quot;') + '" data-testid="field-' + f.key + '" />' +
            '<div class="field-meta" data-meta-for="' + f.key + '" style="display:flex;justify-content:flex-end;font-size:11px;color:#64748b;margin-top:2px"><span class="char-count">' + (val || '').length + ' chars</span></div>' +
          '</div>';
        }
      });
    } else {
      fieldsHtml = '<div class="empty-state" style="padding:20px"><div class="empty-state-title">Select a section</div><div>Choose a section to edit its content</div></div>';
    }
    return fieldsHtml;
  }

  // Switch to a different section without destroying the editor layout or
  // reloading the preview iframe. Only the fields panel and section title
  // are updated in-place — no layout shift, no iframe flicker.
  function switchSectionInPlace(newSection) {
    var isDetail = (newSection === 'project-detail' || newSection === 'service-detail');
    if (isDetail) {
      if (!state.detailSlug) {
        state.detailSlug = newSection === 'project-detail' ? 'seaport-infrastructure' : 'marine-coastal-construction';
      }
    } else {
      state.detailSlug = null;
    }
    state.editingSection = newSection;
    state.editedContent = {};
    state._serverLoaded = state._serverLoaded || {};
    delete state._serverLoaded[newSection];

    // Update fields panel in-place
    var fieldsBody = document.getElementById('editorFieldsBody');
    if (fieldsBody) {
      fieldsBody.innerHTML = buildSectionFieldsHtml(newSection, state.detailSlug);
      // Re-initialize Quill on any new richtext fields
      if (typeof bindContentEditorExtras === 'function') bindContentEditorExtras();
    }
    // Update card title
    var cardTitle = document.querySelector('.editor-fields .card-title');
    if (cardTitle) {
      var secs = pageSections[state.editingPage || '/'] || pageSections['/'];
      var found = secs && secs.find(function(s) { return s.id === newSection; });
      cardTitle.textContent = found ? found.name : 'Editor';
    }
    // Re-bind detail slug selector if present
    var slugSel = document.getElementById('detailSlugSelector');
    if (slugSel && !slugSel._bound) {
      slugSel._bound = true;
      slugSel.addEventListener('change', function() {
        state.detailSlug = this.value;
        state.editedContent = {};
        switchSectionInPlace(state.editingSection);
      });
    }
    // Wire upload/remove buttons on the new fields
    document.querySelectorAll('#editorFieldsBody .upload-drop-area').forEach(function(area) {
      if (area._bound) return; area._bound = true;
      area.addEventListener('click', function() { var i = this.querySelector('.upload-file-input'); if (i) i.click(); });
      area.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
      area.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
      area.addEventListener('drop', function(e) {
        e.preventDefault(); this.classList.remove('drag-over');
        var files = e.dataTransfer.files;
        if (files.length > 0) uploadFile(files[0], this.getAttribute('data-key'), this.getAttribute('data-selector'), this.getAttribute('data-attr'));
      });
    });
    document.querySelectorAll('#editorFieldsBody .upload-file-input').forEach(function(input) {
      if (input._bound) return; input._bound = true;
      input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) uploadFile(this.files[0], this.getAttribute('data-key'), this.getAttribute('data-selector'), this.getAttribute('data-attr'));
      });
    });
    document.querySelectorAll('#editorFieldsBody .upload-remove-btn').forEach(function(btn) {
      if (btn._bound) return; btn._bound = true;
      btn.addEventListener('click', function() {
        state.editedContent[this.getAttribute('data-key')] = '';
        switchSectionInPlace(state.editingSection);
        showToast('Media removed', 'success');
      });
    });
    // Load saved content from DB into the new fields
    loadSavedSectionContent(newSection);
    scrollPreviewToSection(newSection);
    if (window.cahitPresenceTick) window.cahitPresenceTick();
  }

  function bindEditorActions() {
    document.querySelectorAll('.section-item').forEach(function(el) {
      if (el._bound) return;
      el._bound = true;
      el.addEventListener('click', function() {
        document.querySelectorAll('.section-item').forEach(function(s) { s.classList.remove('active'); });
        this.classList.add('active');
        // Surgical in-place update — does NOT rebuild iframe or full editor layout
        switchSectionInPlace(this.getAttribute('data-section'));
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

    // Strip Microsoft Word / Outlook paste garbage (the same junk the server
    // strips on render): MSO conditional blocks, <o:p>/<w:*>/<v:*>/<m:*>
    // namespaced tags, inline <style>, mso-* styles, MsoNormal classes,
    // empty spans, <font> tags. Keeps real content + basic formatting.
    function sanitizePastedHtml(raw) {
      if (!raw) return '';
      var s = String(raw);
      s = s.replace(/<!--\[if[\s\S]*?\[endif\]-->/gi, '');
      s = s.replace(/<!\[if[\s\S]*?\[endif\]>/gi, '');
      s = s.replace(/<!\[endif\]>/gi, '');
      s = s.replace(/<!\[if[^\]]*\]>/gi, '');
      s = s.replace(/<\?xml[\s\S]*?\?>/gi, '');
      s = s.replace(/<xml[\s\S]*?<\/xml>/gi, '');
      s = s.replace(/<(o|w|v|m|st1):[^>]*>/gi, '');
      s = s.replace(/<\/(o|w|v|m|st1):[^>]*>/gi, '');
      s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
      s = s.replace(/<meta[^>]*>/gi, '');
      s = s.replace(/<link[^>]*>/gi, '');
      s = s.replace(/<title[\s\S]*?<\/title>/gi, '');
      s = s.replace(/<!--[\s\S]*?-->/g, '');
      s = s.replace(/\sclass="?Mso[^"\s>]*"?/gi, '');
      s = s.replace(/\s(lang|xml:lang)="[^"]*"/gi, '');
      s = s.replace(/\sstyle="[^"]*mso-[^"]*"/gi, '');
      s = s.replace(/<(\/?)font[^>]*>/gi, '');
      s = s.replace(/<span[^>]*>(\s|&nbsp;)*<\/span>/gi, '');
      s = s.replace(/<p[^>]*>\s*<\/p>/gi, '');
      s = s.replace(/(\s|&nbsp;){3,}/g, ' ');
      return s.trim();
    }
    window.sanitizePastedHtml = sanitizePastedHtml;

    document.querySelectorAll('.live-edit-richtext').forEach(function(editor) {
      editor.addEventListener('paste', function(e) {
        if (this._quill) return;  // Quill handles paste sanitization itself.
        if (!e.clipboardData) return;
        var html = e.clipboardData.getData('text/html');
        var text = e.clipboardData.getData('text/plain');
        // If clipboard has HTML, clean it. Otherwise insert plain text as-is.
        var insert;
        if (html && /<\w+/.test(html)) {
          insert = sanitizePastedHtml(html);
        } else {
          insert = (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>');
        }
        if (!insert) return;
        e.preventDefault();
        try {
          document.execCommand('insertHTML', false, insert);
        } catch (err) {
          // Fallback: append
          this.innerHTML += insert;
        }
        // Trigger input handler manually
        var ev;
        try { ev = new Event('input', { bubbles: true }); } catch (e2) { ev = document.createEvent('Event'); ev.initEvent('input', true, true); }
        this.dispatchEvent(ev);
      });
      editor.addEventListener('input', function() {
        if (this._quill) return;  // Quill emits text-change instead.
        var key = this.getAttribute('data-key');
        var selector = this.getAttribute('data-selector');
        var value = this.innerHTML;
        state.editedContent[key] = value;
        updatePreviewElement(selector, value, key);
      });
      editor.addEventListener('blur', function() {
        if (this._quill) return;
        var key = this.getAttribute('data-key');
        state.editedContent[key] = this.innerHTML;
      });
    });

    // EN→AR auto-translate buttons (Service Detail / Project Detail editors).
    // Reads the current value from the EN field's editor (richtext, textarea or
    // input), POSTs to /admin/api/translate, and writes the translated text
    // into the matching AR field's editor + state.editedContent.
    document.querySelectorAll('.ai-translate-pair-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var sourceKey = btn.getAttribute('data-source-key');
        var targetKey = btn.getAttribute('data-target-key');
        if (!sourceKey || !targetKey) return;
        function readField(key) {
          var rte = document.querySelector('.live-edit-richtext[data-key="' + key + '"]');
          if (rte) return { kind: 'richtext', el: rte, value: rte._quill ? rte._quill.root.innerHTML : rte.innerHTML };
          var ta = document.querySelector('textarea.live-edit-field[data-key="' + key + '"]');
          if (ta) return { kind: 'textarea', el: ta, value: ta.value };
          var inp = document.querySelector('input.live-edit-field[data-key="' + key + '"]');
          if (inp) return { kind: 'text', el: inp, value: inp.value };
          return null;
        }
        var source = readField(sourceKey);
        var target = readField(targetKey);
        if (!source) { showToast('English field not found', 'error'); return; }
        if (!target) { showToast('Arabic field not found — make sure you are on the same section', 'error'); return; }
        var text = (source.value || '').trim();
        if (!text) { showToast('Type or paste English text first, then click Translate.', 'info'); return; }
        if (target.value && target.value.trim() && !confirm('The Arabic field already has content. Replace it with the translation?')) return;
        var origLabel = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Translating...';
        var token = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
        fetch('/admin/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ text: text, target: 'ar' })
        }).then(function(r) { return r.json(); }).then(function(data) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = origLabel;
          if (!data || !data.success) {
            showToast((data && data.error) || 'Translation failed', 'error');
            return;
          }
          var translated = data.translated || '';
          if (target.kind === 'richtext') {
            if (target.el._quill) {
              target.el._quill.root.innerHTML = translated;
            } else {
              target.el.innerHTML = translated;
            }
          } else {
            target.el.value = translated;
          }
          state.editedContent[targetKey] = translated;
          var sel = target.el.getAttribute('data-selector');
          if (sel) updatePreviewElement(sel, translated, targetKey);
          showToast('Arabic translation placed below. Review and Save when ready.', 'success');
          target.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }).catch(function(err) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = origLabel;
          showToast('Translation failed: ' + (err && err.message ? err.message : 'network error'), 'error');
        });
      });
    });

    // Track last selection per-editor so toolbar buttons keep working after focus loss
    document.querySelectorAll('.live-edit-richtext').forEach(function(editor) {
      var saveSel = function() {
        var sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          var range = sel.getRangeAt(0);
          if (editor.contains(range.commonAncestorContainer)) {
            editor._savedRange = range.cloneRange();
          }
        }
      };
      editor.addEventListener('keyup', saveSel);
      editor.addEventListener('mouseup', saveSel);
      editor.addEventListener('focus', saveSel);
    });

    document.querySelectorAll('.rte-mini-toolbar .rte-mini-btn').forEach(function(btn) {
      btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var toolbar = this.closest('.rte-mini-toolbar');
        var targetId = toolbar && toolbar.getAttribute('data-rte-target');
        var editor = targetId && document.getElementById(targetId);
        if (!editor) return;
        var cmd = this.getAttribute('data-cmd');
        var key = editor.getAttribute('data-key');
        var selector = editor.getAttribute('data-selector');
        // Quill path: use the Quill API so formatting survives the editor's
        // internal sanitizer instead of being stripped.
        if (editor._quill) {
          var q = editor._quill;
          var range = q.getSelection(true);
          if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
            var cur = range && range.length ? q.getFormat(range)[cmd] : false;
            q.format(cmd, !cur);
          } else if (cmd === 'insertUnorderedList') {
            q.format('list', q.getFormat(range || {}).list === 'bullet' ? false : 'bullet');
          } else if (cmd === 'insertOrderedList') {
            q.format('list', q.getFormat(range || {}).list === 'ordered' ? false : 'ordered');
          } else if (cmd === 'removeFormat') {
            if (range && range.length) q.removeFormat(range.index, range.length);
          }
          var html = q.root.innerHTML;
          state.editedContent[key] = html;
          updatePreviewElement(selector, html, key);
          return;
        }
        editor.focus();
        // Restore previously saved selection so the command applies to the right text
        if (editor._savedRange) {
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(editor._savedRange);
        }
        var ok = false;
        try { ok = document.execCommand(cmd, false, null); } catch(err) {}
        // Manual fallback for B/I/U if execCommand returned false (rare in modern browsers)
        if (!ok && (cmd === 'bold' || cmd === 'italic' || cmd === 'underline')) {
          var sel2 = window.getSelection();
          if (sel2 && sel2.rangeCount > 0 && !sel2.isCollapsed) {
            var r = sel2.getRangeAt(0);
            var tag = cmd === 'bold' ? 'strong' : (cmd === 'italic' ? 'em' : 'u');
            var wrap = document.createElement(tag);
            try { wrap.appendChild(r.extractContents()); r.insertNode(wrap); } catch(err2) {}
          }
        }
        // Update active state on B / I / U
        ['bold','italic','underline'].forEach(function(c) {
          var b = toolbar.querySelector('[data-cmd="' + c + '"]');
          if (!b) return;
          var active = false;
          try { active = document.queryCommandState(c); } catch(_) {}
          b.style.background = active ? '#0ea5e9' : '#fff';
          b.style.color = active ? '#fff' : '';
        });
        // Re-save selection
        var sel3 = window.getSelection();
        if (sel3 && sel3.rangeCount > 0) editor._savedRange = sel3.getRangeAt(0).cloneRange();
        state.editedContent[key] = editor.innerHTML;
        updatePreviewElement(selector, editor.innerHTML, key);
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

    var detailSlugSel = document.getElementById('detailSlugSelector');
    if (detailSlugSel && !detailSlugSel._bound) {
      detailSlugSel._bound = true;
      detailSlugSel.addEventListener('change', function() {
        state.detailSlug = this.value;
        switchSectionInPlace(state.editingSection);
      });
    }

    var saveBtn = document.getElementById('saveContentBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var section = state.editingSection || 'hero';
        var isDetail = (section === 'project-detail' || section === 'service-detail');
        var saveKey = isDetail ? section + '-' + (state.detailSlug || '') : section;
        var data = {};
        var fields = sectionFields[section] || [];
        fields.forEach(function(f) {
          if (state.editedContent[f.key] !== undefined) {
            data[f.key] = state.editedContent[f.key];
          }
        });
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving...';
        fetch('/admin/api/site-content/' + saveKey, {
          method: 'PUT',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ data: data })
        }).then(function(r) { return r.json(); }).then(function(result) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save';
          if (result && result.success) {
            state._saveFailed = false;
            showToast('Content saved successfully', 'success');
          } else {
            state._saveFailed = true;
            showToast('Error saving: ' + ((result && result.error) || 'Unknown error'), 'error');
          }
        }).catch(function(err) {
          state._saveFailed = true;
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
    if (iframe && !iframe._loadBound) {
      iframe._loadBound = true;
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
      if (btn._bound) return; btn._bound = true;
      btn.addEventListener('click', function() {
        var key = this.getAttribute('data-key');
        state.editedContent[key] = '';
        switchSectionInPlace(state.editingSection);
        showToast('Media removed', 'success');
      });
    });

    bindContentEditorExtras();
  }

  // ---------------------------------------------------------------------------
  // Editor extras: Clean-field button, character counts, Ctrl+Shift+V plain
  // paste, Translate All, autosave + unsaved badge, History modal.
  // ---------------------------------------------------------------------------
  function localSanitize(raw) {
    if (window.sanitizePastedHtml) return window.sanitizePastedHtml(String(raw || ''));
    return String(raw || '');
  }
  function plainTextLength(htmlOrText) {
    var s = String(htmlOrText || '');
    if (/<[^>]+>/.test(s)) {
      var tmp = document.createElement('div'); tmp.innerHTML = s;
      return (tmp.textContent || tmp.innerText || '').length;
    }
    return s.length;
  }
  function richtextHTML(el) {
    if (!el) return '';
    if (el._quill) return el._quill.root.innerHTML;
    return el.innerHTML;
  }
  function setRichtextHTML(el, html) {
    if (!el) return;
    if (el._quill) { el._quill.root.innerHTML = html; }
    else { el.innerHTML = html; }
  }
  function updateCharCount(key) {
    var meta = document.querySelector('[data-meta-for="' + key + '"] .char-count');
    if (!meta) return;
    var val = state.editedContent[key];
    if (val === undefined || val === null) {
      var f = document.querySelector('[data-key="' + key + '"]');
      if (f && f.classList && f.classList.contains('live-edit-richtext')) val = richtextHTML(f);
      else val = f ? (f.value !== undefined ? f.value : f.innerHTML) : '';
    }
    meta.textContent = plainTextLength(val) + ' chars';
  }
  function markUnsaved() {
    state._dirty = true;
    var u = document.getElementById('unsavedBadge');
    var s = document.getElementById('autosaveBadge');
    if (u) u.style.display = 'inline-block';
    if (s) s.style.display = 'none';
    scheduleAutosave();
  }
  function markSaved() {
    state._dirty = false;
    var u = document.getElementById('unsavedBadge');
    var s = document.getElementById('autosaveBadge');
    if (u) u.style.display = 'none';
    if (s) { s.style.display = 'inline-block'; s.textContent = 'Saved ' + new Date().toLocaleTimeString(); }
  }
  function scheduleAutosave() {
    if (state._autosaveTimer) clearTimeout(state._autosaveTimer);
    state._autosaveTimer = setTimeout(function() {
      var btn = document.getElementById('saveContentBtn');
      if (btn && state._dirty && !btn.disabled) btn.click();
    }, 4000);
  }

  function bindContentEditorExtras() {
    // Upgrade every rich-text field to a Quill editor. Quill gives us reliable
    // paste sanitization (strips Word/MSO junk for free), keyboard handling,
    // and a clean HTML model — without any build step. The existing toolbar
    // buttons keep working because they detect el._quill and route through
    // quill.format() instead of execCommand.
    if (typeof Quill !== 'undefined') {
      document.querySelectorAll('.live-edit-richtext').forEach(function(el) {
        if (el._quill || el.classList.contains('ql-container')) return;
        var key = el.getAttribute('data-key');
        var selector = el.getAttribute('data-selector');
        var isRTL = (el.getAttribute('dir') === 'rtl') || (el.style && el.style.direction === 'rtl');
        var initial = el.innerHTML;
        try { el.innerHTML = ''; } catch(_) {}
        var quill;
        try {
          quill = new Quill(el, {
            theme: 'snow',
            modules: { toolbar: false, clipboard: { matchVisual: false } },
            formats: ['bold','italic','underline','strike','list','link','header','blockquote']
          });
        } catch(initErr) {
          el.innerHTML = initial;  // Restore on failure so editing still works.
          return;
        }
        // Suppress text-change during programmatic init so Quill's
        // MutationObserver doesn't immediately fire markUnsaved().
        el._quillLoading = true;
        quill.root.innerHTML = initial;
        if (isRTL) { quill.root.setAttribute('dir', 'rtl'); quill.format('direction', 'rtl'); }
        el._quill = quill;
        setTimeout(function() { el._quillLoading = false; }, 0);
        quill.on('text-change', function() {
          // Ignore events fired by programmatic innerHTML changes (init / DB load).
          if (el._quillLoading) return;
          var html = quill.root.innerHTML;
          // Quill emits "<p><br></p>" for empty content — normalize so we don't
          // ship visible placeholder paragraphs to the live site.
          if (html === '<p><br></p>') html = '';
          state.editedContent[key] = html;
          if (selector) updatePreviewElement(selector, html, key);
          updateCharCount(key);
          markUnsaved();
        });
      });
    }

    // Char count live updates
    document.querySelectorAll('.live-edit-field, .live-edit-richtext').forEach(function(el) {
      var key = el.getAttribute('data-key');
      if (!key) return;
      if (el._quill) return;  // Quill text-change already handles char count + dirty.
      var evt = el.classList.contains('live-edit-richtext') ? 'input' : 'input';
      el.addEventListener(evt, function() { updateCharCount(key); markUnsaved(); });
    });

    // Clean-field button: re-sanitize current value and write it back.
    document.querySelectorAll('.clean-field-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.getAttribute('data-clean-key');
        var rte = document.querySelector('.live-edit-richtext[data-key="' + key + '"]');
        var ta  = document.querySelector('textarea.live-edit-field[data-key="' + key + '"]');
        var ip  = document.querySelector('input.live-edit-field[data-key="' + key + '"]');
        var before, after;
        if (rte) {
          before = richtextHTML(rte);
          after = localSanitize(before);
          setRichtextHTML(rte, after);
          state.editedContent[key] = after;
        } else if (ta) {
          before = ta.value;
          after = localSanitize(before).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
          ta.value = after;
          state.editedContent[key] = after;
        } else if (ip) {
          before = ip.value;
          after = localSanitize(before).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
          ip.value = after;
          state.editedContent[key] = after;
        } else { return; }
        updateCharCount(key);
        markUnsaved();
        showToast('Cleaned ' + (before.length - after.length) + ' chars of junk', 'success');
      });
    });

    // Ctrl+Shift+V: paste current clipboard as plain text into rich editor.
    document.querySelectorAll('.live-edit-richtext').forEach(function(editor) {
      editor.addEventListener('keydown', function(e) {
        var isPasteShortcut = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'V' || e.key === 'v');
        if (!isPasteShortcut) return;
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        e.preventDefault();
        navigator.clipboard.readText().then(function(text) {
          var html = (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>');
          try { document.execCommand('insertHTML', false, html); }
          catch (err) { editor.innerHTML += html; }
          var ev; try { ev = new Event('input', { bubbles: true }); } catch (e2) { ev = document.createEvent('Event'); ev.initEvent('input', true, true); }
          editor.dispatchEvent(ev);
        }).catch(function() { showToast('Could not read clipboard — browser denied access', 'error'); });
      });
    });

    // Translate-All: walk every EN field in the current section and POST it to
    // /admin/api/translate, then write the result into the matching AR field.
    var taBtn = document.getElementById('translateAllBtn');
    if (taBtn) {
      taBtn.addEventListener('click', function() {
        var pairBtns = Array.prototype.slice.call(document.querySelectorAll('.ai-translate-pair-btn'));
        if (!pairBtns.length) { showToast('No translatable fields in this section', 'error'); return; }
        if (!confirm('Translate ' + pairBtns.length + ' field(s) to Arabic? This calls OpenAI and may take a moment.')) return;
        taBtn.disabled = true;
        var orig = taBtn.innerHTML;
        var done = 0;
        function next() {
          if (done >= pairBtns.length) {
            taBtn.disabled = false; taBtn.innerHTML = orig;
            showToast('Translated ' + done + ' field(s) — review and Save', 'success');
            return;
          }
          taBtn.innerHTML = 'Translating ' + (done + 1) + ' / ' + pairBtns.length + '...';
          pairBtns[done].click();
          done++;
          // The per-field handler is async; give each ~2.5s to complete before firing the next.
          setTimeout(next, 2500);
        }
        next();
      });
    }

    // History modal
    var histBtn = document.getElementById('revisionsBtn');
    if (histBtn) {
      histBtn.addEventListener('click', function() {
        var section = state.editingSection || 'hero';
        var isDetail = (section === 'project-detail' || section === 'service-detail');
        var key = isDetail ? section + '-' + (state.detailSlug || '') : section;
        fetch('/admin/api/site-content/' + key + '/revisions', { headers: authHeaders() })
          .then(function(r) { return r.json(); })
          .then(function(d) {
            if (!d.success || !d.revisions || !d.revisions.length) { showToast('No revision history yet for this section', 'error'); return; }
            var rows = d.revisions.map(function(r) {
              var when = new Date(r.created_at).toLocaleString();
              return '<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">' + when + '</td>' +
                '<td style="padding:8px;border-bottom:1px solid #e2e8f0">' + (r.saved_by || 'admin') + '</td>' +
                '<td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">' +
                  '<button class="btn btn-outline" data-restore-id="' + r.id + '" style="font-size:12px;padding:4px 10px">Restore</button></td></tr>';
            }).join('');
            var modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
            modal.innerHTML = '<div style="background:#fff;max-width:560px;width:100%;border-radius:10px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.25)">' +
              '<div style="padding:14px 18px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center"><strong>Revision history — ' + key + '</strong><button class="rev-close" style="background:none;border:0;font-size:20px;cursor:pointer">&times;</button></div>' +
              '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:8px;background:#f8fafc;border-bottom:1px solid #e2e8f0">When</th><th style="text-align:left;padding:8px;background:#f8fafc;border-bottom:1px solid #e2e8f0">By</th><th style="padding:8px;background:#f8fafc;border-bottom:1px solid #e2e8f0"></th></tr></thead><tbody>' + rows + '</tbody></table>' +
              '<div style="padding:10px 18px;font-size:12px;color:#64748b">Showing up to 20 most recent saves. Restoring also creates a new revision so nothing is lost.</div>' +
            '</div>';
            document.body.appendChild(modal);
            modal.querySelector('.rev-close').addEventListener('click', function() { document.body.removeChild(modal); });
            modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });
            modal.querySelectorAll('[data-restore-id]').forEach(function(b) {
              b.addEventListener('click', function() {
                var revId = b.getAttribute('data-restore-id');
                if (!confirm('Restore this revision? Your current unsaved changes will be lost.')) return;
                fetch('/admin/api/site-content/' + key + '/restore/' + revId, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: '{}' })
                  .then(function(r) { return r.json(); })
                  .then(function(rr) {
                    if (rr.success) {
                      showToast('Revision restored — reloading editor', 'success');
                      document.body.removeChild(modal);
                      state.editedContent = {};
                      switchSectionInPlace(state.editingSection);
                    } else { showToast('Restore failed', 'error'); }
                  });
              });
            });
          });
      });
    }

    // Hook into Save button so we can flip the badges.
    var saveBtnX = document.getElementById('saveContentBtn');
    if (saveBtnX && !saveBtnX._badgeHook) {
      saveBtnX._badgeHook = true;
      saveBtnX.addEventListener('click', function() {
        // Optimistic: after a short delay assume save handler ran fine. The
        // real fetch callback will overwrite this if it failed.
        setTimeout(function() { if (!state._saveFailed) markSaved(); state._saveFailed = false; }, 1500);
      }, true);
    }
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
        var fb = document.getElementById('editorFieldsBody');
        if (fb) { fb.innerHTML = buildSectionFieldsHtml(state.editingSection, state.detailSlug); if (typeof bindContentEditorExtras === 'function') bindContentEditorExtras(); }
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
        var hasHtml = typeof value === 'string' && /<[a-z][\s\S]*>/i.test(value);
        if (hasHtml) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
        el.style.outline = '2px solid #0ea5e9';
        el.style.outlineOffset = '2px';
        setTimeout(function() { el.style.outline = ''; el.style.outlineOffset = ''; }, 800);
      }
    } catch(e) {}
  }

  function populateFieldsFromPreview() {
    var iframe = document.getElementById('previewFrame');
    if (!iframe || !iframe.contentDocument) return;
    // If the DB load has already populated this section, do NOT overwrite
    // anything from preview text — DB is the source of truth.
    if (state._serverLoaded && state._serverLoaded[state.editingSection]) return;
    var fields = sectionFields[state.editingSection] || [];
    fields.forEach(function(f) {
      if (state.editedContent[f.key]) return;
      try {
        var el = iframe.contentDocument.querySelector(f.selector);
        if (!el) return;
        var inputEl = document.querySelector('[data-key="' + f.key + '"]');
        if (!inputEl) return;
        // Never push preview plain-text into a richtext field — it would
        // strip formatting from the Quill editor. Richtext gets its initial
        // value from the PHP-rendered editor template or the DB load.
        if (inputEl.classList && inputEl.classList.contains('live-edit-richtext')) return;
        if (!inputEl.value) {
          var text = el.textContent.trim();
          inputEl.value = text;
          state.editedContent[f.key] = text;
        }
      } catch(e) {}
    });
  }

  function renderMedia() {
    var items = '';
    state.mediaItems.forEach(function(m, i) {
      var safeUrl = (m.url || '').replace(/"/g, '&quot;');
      var safeName = (m.name || '').replace(/[<>"]/g, '');
      var thumb = '';
      if (m.type === 'image' && m.url) {
        thumb = '<img src="' + safeUrl + '" alt="' + safeName + '" loading="lazy" onerror="this.parentNode.innerHTML=\'<div style=&quot;width:100%;height:140px;background:#fee2e2;display:flex;align-items:center;justify-content:center;color:#b91c1c;font-size:11px;text-align:center;padding:8px&quot;>Image unavailable</div>\'" />';
      } else if (m.type === 'image' && mediaImages[m.name]) {
        thumb = '<img src="' + BASE_URL + mediaImages[m.name] + '" alt="' + safeName + '" loading="lazy" />';
      } else if (m.type === 'video' && m.url) {
        thumb = '<div style="position:relative;width:100%;height:140px;background:#0f172a;overflow:hidden">' +
          '<video src="' + safeUrl + '#t=0.5" preload="metadata" muted playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none">' +
            '<div style="background:rgba(0,0,0,.55);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (m.type === 'video') {
        thumb = '<div style="width:100%;height:140px;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#94a3b8">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>';
      } else {
        thumb = '<div style="width:100%;height:140px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
      }
      var copyBtn = m.url ? '<button class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText(window.location.origin+\'' + safeUrl + '\');this.textContent=\'Copied!\';setTimeout(function(){},1000)" style="font-size:11px;padding:2px 6px;margin-top:4px" data-testid="btn-copy-url-' + i + '">Copy URL</button>' : '';
      var openBtn = m.url ? '<a class="btn btn-sm btn-outline" href="' + safeUrl + '" target="_blank" rel="noopener" style="font-size:11px;padding:2px 6px;margin-top:4px;margin-left:4px">Open</a>' : '';
      items += '<div class="media-item" data-testid="media-item-' + i + '">' + thumb +
        '<div class="media-item-info"><div class="media-item-name">' + safeName + '</div><div class="media-item-size">' + m.size + ' &middot; ' + m.date + '</div>' + copyBtn + openBtn + '</div></div>';
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
            var mime = d.type || file.type || '';
            var kind = d.kind || (mime.indexOf('video') === 0 ? 'video' : 'image');
            state.mediaItems.unshift({
              name: d.name || file.name,
              type: kind,
              mime: mime,
              size: ((d.size || file.size) / (1024 * 1024)).toFixed(1) + ' MB',
              date: new Date().toISOString().split('T')[0],
              url: d.url
            });
          } else {
            showToast(d.message || 'Upload failed', 'error');
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
      var safeStatus = escapeHtml(String(l.status || 'New'));
      var statusBadge = l.status === 'new' ? '<span class="badge badge-blue">New</span>' :
                        l.status === 'contacted' ? '<span class="badge badge-green">Contacted</span>' :
                        '<span class="badge badge-gray">' + safeStatus + '</span>';
      var dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '-';
      var leadId = parseInt(l.id, 10) || 0;
      var actions = l.status === 'new' ?
        '<button class="btn btn-sm btn-outline" onclick="markLeadStatus(' + leadId + ', \'contacted\')" data-testid="btn-lead-contact-' + leadId + '">Mark Contacted</button>' :
        '<button class="btn btn-sm btn-outline" onclick="markLeadStatus(' + leadId + ', \'new\')" data-testid="btn-lead-new-' + leadId + '">Mark New</button>';
      var safeName = escapeHtml(l.name || 'Unknown');
      var safeEmail = escapeHtml(l.email || '');
      var safePhone = escapeHtml(l.phone || '-');
      var safeService = escapeHtml(l.service_type || '-');
      var safeDetailsText = escapeHtml(l.details || '-');
      var safeDetailsAttr = escapeHtml(l.details || '');
      rows += '<tr data-testid="lead-row-' + i + '">' +
        '<td><div class="lead-name">' + safeName + '</div><div class="lead-email">' + safeEmail + '</div></td>' +
        '<td>' + safePhone + '</td>' +
        '<td>' + safeService + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + dateStr + '</td>' +
        '<td>' + actions + '</td>' +
        '<td><div class="lead-details-text" style="max-width:200px;font-size:12px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + safeDetailsAttr + '">' + safeDetailsText + '</div></td>' +
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
    return '' +
      '<div class="toolbar">' +
        '<h2 style="margin:0;font-weight:600;font-size:1rem;color:#0A3D6B">Analytics</h2>' +
        '<div class="toolbar-spacer"></div>' +
        '<button class="btn btn-outline" id="refreshAnalyticsBtn" data-testid="btn-refresh-analytics"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh</button>' +
      '</div>' +
      '<div id="analytics-content" style="padding:24px">' +
        '<div style="text-align:center;padding:60px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><p style="margin-top:12px;color:#64748b">Loading analytics data...</p></div>' +
      '</div>';
  }

  function loadAnalyticsData() {
    fetch('/admin/api/analytics', { headers: authHeaders() }).then(function(r) { return r.json(); }).then(function(result) {
      if (!result.success || !result.data) {
        document.getElementById('analytics-content').innerHTML = '<div style="text-align:center;padding:60px;color:#64748b"><p>Unable to load analytics data.</p></div>';
        return;
      }
      var d = result.data;
      var viewsChange = d.lastMonthViews > 0 ? Math.round(((d.thisMonthViews - d.lastMonthViews) / d.lastMonthViews) * 100) : (d.thisMonthViews > 0 ? 100 : 0);
      var visitorsChange = d.uniqueLastMonth > 0 ? Math.round(((d.uniqueThisMonth - d.uniqueLastMonth) / d.uniqueLastMonth) * 100) : (d.uniqueThisMonth > 0 ? 100 : 0);
      var viewsDir = viewsChange >= 0 ? '+' : '';
      var visitorsDir = visitorsChange >= 0 ? '+' : '';

      var dailyBars = '';
      var dailyLabels = '';
      if (d.dailyData && d.dailyData.length > 0) {
        var maxDaily = Math.max.apply(null, d.dailyData.map(function(x) { return parseInt(x.views); }));
        if (maxDaily === 0) maxDaily = 1;
        d.dailyData.forEach(function(day) {
          var v = parseInt(day.views);
          var dateStr = new Date(day.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyBars += '<div class="chart-bar" style="height:' + Math.max(4, Math.round((v / maxDaily) * 160)) + 'px" title="' + dateStr + ': ' + v + ' views"></div>';
        });
      } else {
        dailyBars = '<div style="height:160px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px">No page view data yet. Tracking starts now.</div>';
      }

      var topPagesHtml = '';
      if (d.topPages && d.topPages.length > 0) {
        d.topPages.forEach(function(p) {
          topPagesHtml += '<tr><td>' + escapeHtml(p.page || '') + '</td><td>' + parseInt(p.views).toLocaleString() + '</td></tr>';
        });
      } else {
        topPagesHtml = '<tr><td colspan="2" style="text-align:center;color:#94a3b8">No data yet</td></tr>';
      }

      var referrerHtml = '';
      var totalRefVisitors = 0;
      if (d.referrers) d.referrers.forEach(function(r) { totalRefVisitors += parseInt(r.visitors); });
      if (d.referrers && d.referrers.length > 0) {
        d.referrers.forEach(function(r) {
          var pct = totalRefVisitors > 0 ? ((parseInt(r.visitors) / totalRefVisitors) * 100).toFixed(1) : '0';
          var badgeClass = r.source === 'Direct' ? 'badge-blue' : (r.source === 'Google Search' ? 'badge-green' : 'badge-orange');
          referrerHtml += '<tr><td>' + escapeHtml(r.source || '') + '</td><td>' + parseInt(r.visitors).toLocaleString() + '</td><td><span class="badge ' + badgeClass + '">' + pct + '%</span></td></tr>';
        });
      } else {
        referrerHtml = '<tr><td colspan="3" style="text-align:center;color:#94a3b8">No data yet</td></tr>';
      }

      var recentHtml = '';
      if (d.recentViews && d.recentViews.length > 0) {
        d.recentViews.slice(0, 10).forEach(function(v) {
          var timeAgo = getTimeAgo(new Date(v.created_at));
          var refTxt = v.referrer ? String(v.referrer).substring(0, 40) : 'Direct';
          recentHtml += '<tr><td>' + escapeHtml(v.page || '') + '</td><td>' + escapeHtml(timeAgo) + '</td><td style="font-size:11px;color:#94a3b8">' + escapeHtml(refTxt) + '</td></tr>';
        });
      } else {
        recentHtml = '<tr><td colspan="3" style="text-align:center;color:#94a3b8">No recent visits</td></tr>';
      }

      document.getElementById('analytics-content').innerHTML = '' +
        '<div class="stats-row">' +
          '<div class="stat-card" data-testid="stat-total-views"><div class="stat-card-header"><span class="stat-card-label">Total Page Views</span></div><div class="stat-card-value">' + d.totalViews.toLocaleString() + '</div><div class="stat-card-change">' + d.thisMonthViews.toLocaleString() + ' this month</div></div>' +
          '<div class="stat-card" data-testid="stat-unique-visitors"><div class="stat-card-header"><span class="stat-card-label">Unique Visitors</span></div><div class="stat-card-value">' + d.uniqueVisitors.toLocaleString() + '</div><div class="stat-card-change">' + d.uniqueThisMonth.toLocaleString() + ' this month</div></div>' +
          '<div class="stat-card" data-testid="stat-today-views"><div class="stat-card-header"><span class="stat-card-label">Today\'s Views</span></div><div class="stat-card-value">' + d.todayViews.toLocaleString() + '</div><div class="stat-card-change">' + d.yesterdayViews.toLocaleString() + ' yesterday</div></div>' +
          '<div class="stat-card" data-testid="stat-month-change"><div class="stat-card-header"><span class="stat-card-label">Month vs Last</span></div><div class="stat-card-value">' + viewsDir + viewsChange + '%</div><div class="stat-card-change' + (viewsChange < 0 ? ' down' : '') + '">' + d.thisMonthViews.toLocaleString() + ' vs ' + d.lastMonthViews.toLocaleString() + '</div></div>' +
        '</div>' +
        '<div class="analytics-grid">' +
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">Daily Views (Last 30 Days)</span></div>' +
            '<div class="card-body"><div class="chart-placeholder">' + dailyBars + '</div></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">Top Pages</span></div>' +
            '<div class="card-body-np">' +
              '<table class="table"><thead><tr><th>Page</th><th>Views</th></tr></thead><tbody>' + topPagesHtml + '</tbody></table>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="analytics-grid">' +
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">Traffic Sources</span></div>' +
            '<div class="card-body-np">' +
              '<table class="table"><thead><tr><th>Source</th><th>Visitors</th><th>Share</th></tr></thead><tbody>' + referrerHtml + '</tbody></table>' +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">Recent Visits</span></div>' +
            '<div class="card-body-np">' +
              '<table class="table"><thead><tr><th>Page</th><th>When</th><th>Source</th></tr></thead><tbody>' + recentHtml + '</tbody></table>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).catch(function(e) {
      var el = document.getElementById('analytics-content');
      if (el) el.innerHTML = '<div style="text-align:center;padding:60px;color:#64748b"><p>Error loading analytics. Please try again.</p></div>';
    });
  }

  function getTimeAgo(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 30) return days + 'd ago';
    return date.toLocaleDateString();
  }

  function bindAnalyticsActions() {
    var btn = document.getElementById('refreshAnalyticsBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        document.getElementById('analytics-content').innerHTML = '<div style="text-align:center;padding:60px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><p style="margin-top:12px;color:#64748b">Refreshing...</p></div>';
        loadAnalyticsData();
      });
    }
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
      '<div style="margin-top:24px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">' +
        '<button class="btn btn-primary" id="saveKnowledgeBtn" data-testid="button-save-knowledge">Save All Settings</button>' +
        '<button class="btn" id="clearChatbotKeyBtn" data-testid="button-clear-chatbot-key" style="display:none;background:#ef4444;color:#fff;border:none">Clear API key</button>' +
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

    function refreshChatbotKeyStatus() {
      return fetch('/admin/api/openai-key-status', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var ks = document.getElementById('chatbot-key-status');
          if (ks) {
            if (d.hasKey) { ks.textContent = 'Key configured: ' + d.maskedKey; ks.style.color = '#22c55e'; }
            else { ks.textContent = 'No API key configured'; ks.style.color = '#ef4444'; }
          }
          var clearBtn = document.getElementById('clearChatbotKeyBtn');
          if (clearBtn) { clearBtn.style.display = d.hasKey ? 'inline-block' : 'none'; }
        }).catch(function() {});
    }
    refreshChatbotKeyStatus();

    var clearChatbotKeyBtn = document.getElementById('clearChatbotKeyBtn');
    if (clearChatbotKeyBtn) {
      clearChatbotKeyBtn.addEventListener('click', function() {
        if (!window.confirm('Clear the stored OpenAI API key? The chatbot and AI Assistant will stop working until a new key is saved.')) return;
        clearChatbotKeyBtn.disabled = true;
        var originalText = clearChatbotKeyBtn.textContent;
        clearChatbotKeyBtn.textContent = 'Clearing...';
        fetch('/admin/api/save-openai-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ clear: true })
        })
        .then(function(r) {
          if (r.status === 401) return { success: false, message: 'Session expired' };
          return r.json();
        })
        .then(function(d) {
          clearChatbotKeyBtn.disabled = false;
          clearChatbotKeyBtn.textContent = originalText;
          if (d && d.success === false && d.message === 'Session expired') {
            showToast('Session expired. Please log in again.', 'error');
            setTimeout(function() { window.location.href = '/admin/login'; }, 1500);
            return;
          }
          if (d && d.success) {
            showToast('API key cleared', 'success');
            var keyInputEl = document.getElementById('chatbot-api-key');
            if (keyInputEl) keyInputEl.value = '';
            refreshChatbotKeyStatus();
          } else {
            showToast((d && d.message) || 'Failed to clear API key', 'error');
          }
        })
        .catch(function() {
          clearChatbotKeyBtn.disabled = false;
          clearChatbotKeyBtn.textContent = originalText;
          showToast('Error clearing API key', 'error');
        });
      });
    }

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
            document.getElementById('chatbot-api-key').value = '';
            refreshChatbotKeyStatus();
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
        '<div class="settings-title">Active Sessions</div>' +
        '<p class="settings-row-desc" style="margin-bottom:12px">Devices and browsers currently signed in to this admin account. Sign out a row to revoke that session immediately, or use the button below to clear every other device at once.</p>' +
        '<button class="btn btn-sm" id="logoutOthersBtn" data-testid="button-logout-others" style="background:#dc2626;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-bottom:12px">Sign out all other devices</button>' +
        '<div id="active-sessions-list" data-testid="list-active-sessions">' +
          '<div class="settings-row-desc">Loading sessions…</div>' +
        '</div>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Password Recovery Emails</div>' +
        '<p class="settings-row-desc" style="margin-bottom:12px">If you ever forget your password, click <strong>Forgot password?</strong> on the login screen. A one-time reset link (valid 1 hour) will be emailed to every address listed below. Keep at least one address you always have access to.</p>' +
        '<div class="form-group"><label class="form-label">Recovery emails (comma-separated)</label><input class="form-input" id="setting-recovery-emails" placeholder="ctc@cahitcontracting.com, twolf.om@gmail.com" data-testid="input-recovery-emails" /></div>' +
        '<button class="btn btn-primary" id="saveRecoveryEmailsBtn" data-testid="button-save-recovery-emails">Save recovery emails</button>' +
      '</div>' +
      '<div class="settings-section">' +
        '<div class="settings-title">Admin Users & Recovery</div>' +
        '<p class="settings-row-desc" style="margin-bottom:12px">If another admin forgets their password, you can reset it here (you\'ll need to re-enter your own password to confirm). The other admin will be signed out of all devices.</p>' +
        '<div id="admin-users-list" data-testid="list-admin-users"><div class="settings-row-desc">Loading admins…</div></div>' +
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
    loadAdminUsersList();
    loadRecoveryEmails();
    var recoveryBtn = document.getElementById('saveRecoveryEmailsBtn');
    if (recoveryBtn) {
      recoveryBtn.addEventListener('click', function() {
        var v = (document.getElementById('setting-recovery-emails').value || '').trim();
        if (!v) { showToast('Please enter at least one recovery email', 'error'); return; }
        recoveryBtn.disabled = true; recoveryBtn.textContent = 'Saving…';
        fetch('/admin/api/recovery-emails', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
          body: JSON.stringify({ emails: v })
        })
          .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, d: d }; }); })
          .then(function(res) {
            recoveryBtn.disabled = false; recoveryBtn.textContent = 'Save recovery emails';
            if (res.ok && res.d.success) {
              showToast('Recovery emails saved', 'success');
              document.getElementById('setting-recovery-emails').value = (res.d.emails || []).join(', ');
            } else {
              showToast((res.d && res.d.message) || 'Save failed', 'error');
            }
          })
          .catch(function() { recoveryBtn.disabled = false; recoveryBtn.textContent = 'Save recovery emails'; showToast('Network error', 'error'); });
      });
    }
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
            headers: authHeaders({ 'Content-Type': 'application/json' }),
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
    loadActiveSessions();
    var logoutOthersBtn = document.getElementById('logoutOthersBtn');
    if (logoutOthersBtn) {
      logoutOthersBtn.addEventListener('click', function() {
        if (!confirm('Sign out every other device signed in as you? This device stays signed in.')) return;
        logoutOthersBtn.disabled = true;
        var originalText = logoutOthersBtn.textContent;
        logoutOthersBtn.textContent = 'Signing out…';
        fetch('/admin/api/sessions/logout-others', { method: 'POST', headers: authHeaders() })
          .then(function(r) { return r.json(); })
          .then(function(d) {
            logoutOthersBtn.disabled = false;
            logoutOthersBtn.textContent = originalText;
            if (d && d.success) {
              var n = d.revoked || 0;
              showToast(n ? ('Signed out ' + n + ' other ' + (n === 1 ? 'device' : 'devices')) : 'No other devices were signed in', 'success');
              loadActiveSessions();
            } else {
              showToast((d && d.message) || 'Failed to sign out other devices', 'error');
            }
          })
          .catch(function() {
            logoutOthersBtn.disabled = false;
            logoutOthersBtn.textContent = originalText;
            showToast('Failed to sign out other devices', 'error');
          });
      });
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function summarizeUserAgent(ua) {
    if (!ua) return 'Unknown device';
    var browser = 'Browser';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
    var os = 'Unknown OS';
    if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    return browser + ' on ' + os;
  }

  function formatRelativeTime(iso) {
    if (!iso) return '—';
    var t = Date.parse(iso);
    if (!t) return '—';
    var diff = Math.max(0, Date.now() - t);
    var s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' hr ago';
    var d = Math.floor(h / 24);
    if (d < 30) return d + ' day' + (d === 1 ? '' : 's') + ' ago';
    try { return new Date(t).toLocaleDateString(); } catch (e) { return iso.slice(0, 10); }
  }

  function loadRecoveryEmails() {
    var input = document.getElementById('setting-recovery-emails');
    if (!input) return;
    fetch('/admin/api/recovery-emails', { headers: authHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.success && Array.isArray(d.emails)) input.value = d.emails.join(', ');
      })
      .catch(function() {});
  }

  function loadAdminUsersList() {
    var box = document.getElementById('admin-users-list');
    if (!box) return;
    fetch('/admin/api/admin-users', { headers: authHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d || !d.success) { box.innerHTML = '<div class="settings-row-desc" style="color:#ef4444">Could not load admin users.</div>'; return; }
        if (!d.users || !d.users.length) { box.innerHTML = '<div class="settings-row-desc">No admin users found.</div>'; return; }
        box.innerHTML = d.users.map(function(u) {
          var nameEsc = String(u.username).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
          var badges = '';
          if (u.primary) badges += '<span style="background:#dbeafe;color:#1e40af;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px">Primary</span>';
          if (u.isMe) badges += '<span style="background:#dcfce7;color:#15803d;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px">You</span>';
          var btn = u.isMe
            ? '<span class="settings-row-desc" style="font-size:12px">Use Account Security below to change your own password</span>'
            : '<button type="button" class="btn btn-secondary" data-reset-admin="' + nameEsc + '" data-testid="button-reset-admin-' + nameEsc + '">Reset password</button>';
          return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9">' +
                   '<div><div style="font-weight:600;color:#0f172a">' + nameEsc + badges + '</div></div>' +
                   '<div>' + btn + '</div>' +
                 '</div>';
        }).join('');
        box.querySelectorAll('[data-reset-admin]').forEach(function(b) {
          b.addEventListener('click', function() { openResetAdminDialog(b.getAttribute('data-reset-admin')); });
        });
      })
      .catch(function() { box.innerHTML = '<div class="settings-row-desc" style="color:#ef4444">Could not load admin users.</div>'; });
  }

  function openResetAdminDialog(targetUsername) {
    var newPw = window.prompt('Set a NEW password for "' + targetUsername + '" (at least 6 characters):', '');
    if (newPw === null) return;
    newPw = String(newPw);
    if (newPw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    var confirmPw = window.prompt('Confirm the new password for "' + targetUsername + '":', '');
    if (confirmPw === null) return;
    if (confirmPw !== newPw) { showToast('Passwords do not match', 'error'); return; }
    var myPw = window.prompt('Confirm YOUR own current password to authorize this reset:', '');
    if (myPw === null) return;
    if (!myPw) { showToast('Your current password is required', 'error'); return; }
    fetch('/admin/api/admin-users/reset-password', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ targetUsername: targetUsername, currentPassword: myPw, newPassword: newPw })
    })
      .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, body: d }; }); })
      .then(function(res) {
        if (res.ok && res.body && res.body.success) {
          showToast('Password reset for ' + targetUsername + '. They have been signed out everywhere.', 'success');
        } else {
          showToast((res.body && res.body.message) || 'Failed to reset password', 'error');
        }
      })
      .catch(function() { showToast('Network error while resetting password', 'error'); });
  }

  function loadActiveSessions() {
    var container = document.getElementById('active-sessions-list');
    if (!container) return;
    fetch('/admin/api/sessions', { headers: authHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d || !d.success) {
          container.innerHTML = '<div class="settings-row-desc" style="color:#ef4444">Could not load active sessions.</div>';
          return;
        }
        renderActiveSessions(container, d.sessions || [], d.currentTokenId || '');
      })
      .catch(function() {
        container.innerHTML = '<div class="settings-row-desc" style="color:#ef4444">Could not load active sessions.</div>';
      });
  }

  function renderActiveSessions(container, sessions, currentTokenId) {
    if (!sessions.length) {
      container.innerHTML = '<div class="settings-row-desc">No active sessions found.</div>';
      return;
    }
    var html = sessions.map(function(s) {
      var isCurrent = s.tokenId === currentTokenId;
      var lastDevice = summarizeUserAgent(s.lastUserAgent);
      var lastIp = s.lastIp ? s.lastIp : 'IP unknown';
      var createdIp = s.createdIp || '';
      var createdUa = s.createdUserAgent || '';
      var createdDevice = summarizeUserAgent(createdUa);
      var createdIpLabel = createdIp || 'IP unknown';
      var ipChanged = createdIp && s.lastIp && createdIp !== s.lastIp;
      var uaChanged = createdUa && s.lastUserAgent && createdUa !== s.lastUserAgent;
      var anyChange = ipChanged || uaChanged;
      var signedInRel = s.createdAt ? formatRelativeTime(s.createdAt) : '';
      var lastSeenRel = formatRelativeTime(s.lastSeenAt || s.createdAt);
      var expires = s.expiresAt ? ('Expires ' + formatRelativeTime(s.expiresAt).replace(' ago', '').replace('just now', 'soon')) : '';
      var borderColor = isCurrent ? '#0ea5e9' : (anyChange ? '#f59e0b' : '#e2e8f0');
      var bg = isCurrent ? '#f0f9ff' : (anyChange ? '#fffbeb' : '#fff');
      var rowStyle = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid ' +
        borderColor + ';border-radius:8px;margin-bottom:8px;background:' + bg + ';';
      var badge = isCurrent
        ? '<span style="display:inline-block;font-size:11px;font-weight:600;color:#0369a1;background:#e0f2fe;padding:2px 8px;border-radius:999px;margin-left:8px" data-testid="badge-current-session">This device</span>'
        : '';
      var changeBadge = anyChange
        ? '<span style="display:inline-block;font-size:11px;font-weight:600;color:#92400e;background:#fef3c7;padding:2px 8px;border-radius:999px;margin-left:8px" data-testid="badge-session-changed-' + escapeHtml(s.tokenId) + '" title="The current IP or device differs from where this session was first signed in">Device/IP changed</span>'
        : '';
      var btn = isCurrent
        ? '<span class="settings-row-desc" style="font-size:12px;color:#64748b">Use the Sign Out button in the header to end this session</span>'
        : '<button class="btn btn-sm" data-revoke-token="' + escapeHtml(s.tokenId) + '" data-testid="button-revoke-session-' + escapeHtml(s.tokenId) + '" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500">Sign out</button>';
      var signedInRow = '<div class="settings-row-desc" style="margin-top:4px" data-testid="text-session-signed-in-' + escapeHtml(s.tokenId) + '">' +
          '<strong style="color:#475569">Signed in from</strong> ' + escapeHtml(createdIpLabel) + ' · ' + escapeHtml(createdDevice) +
          (signedInRel ? ' · ' + escapeHtml(signedInRel) : '') +
        '</div>';
      return '<div style="' + rowStyle + '" data-testid="row-session-' + escapeHtml(s.tokenId) + '">' +
        '<div style="min-width:0;flex:1">' +
          '<div style="font-weight:600;color:#0f172a">' + escapeHtml(lastDevice) + badge + changeBadge + '</div>' +
          signedInRow +
          '<div class="settings-row-desc" style="margin-top:4px" data-testid="text-session-last-active-' + escapeHtml(s.tokenId) + '">' +
            '<strong style="color:#475569">Last active from</strong> ' + escapeHtml(lastIp) + ' · ' + escapeHtml(lastDevice) + ' · ' + escapeHtml(lastSeenRel) +
            (expires ? ' · ' + escapeHtml(expires) : '') +
          '</div>' +
          '<div class="settings-row-desc" style="margin-top:2px;font-size:11px;color:#94a3b8;word-break:break-all">' + escapeHtml(s.lastUserAgent || '') + '</div>' +
        '</div>' +
        '<div>' + btn + '</div>' +
      '</div>';
    }).join('');
    container.innerHTML = html;
    container.querySelectorAll('[data-revoke-token]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tid = btn.getAttribute('data-revoke-token');
        if (!tid) return;
        if (!confirm('Sign this session out? The device will be signed out on its next request.')) return;
        btn.disabled = true;
        btn.textContent = 'Signing out…';
        fetch('/admin/api/sessions/' + encodeURIComponent(tid), {
          method: 'DELETE',
          headers: authHeaders()
        })
          .then(function(r) { return r.json(); })
          .then(function(d) {
            if (d && d.success) {
              showToast('Session signed out', 'success');
              loadActiveSessions();
            } else {
              btn.disabled = false;
              btn.textContent = 'Sign out';
              showToast((d && d.message) || 'Failed to sign out session', 'error');
            }
          })
          .catch(function() {
            btn.disabled = false;
            btn.textContent = 'Sign out';
            showToast('Failed to sign out session', 'error');
          });
      });
    });
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
      headers: authHeaders({ 'Content-Type': 'application/json' }),
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

  function aiBlogCall(type, topic, language, sourceText) {
    return fetch('/admin/api/ai-blog-generate', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: type, topic: topic, language: language || 'en', sourceText: sourceText || '' })
    }).then(function(r) { return r.json(); });
  }

  function rteInitialHtml(text) {
    if (!text) return '';
    var s = String(text);
    if (/<\/?(p|div|br|h[1-6]|ul|ol|li|img|a|strong|em|b|i|u|blockquote)\b/i.test(s)) return s;
    return s.split(/\n\n+/).map(function(p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function normalizeEditorSpacing(editor) {
    if (!editor) return;
    try {
      var temp = document.createElement('div');
      temp.innerHTML = editor.innerHTML;
      Array.prototype.forEach.call(temp.querySelectorAll('*'), function(el) {
        var tag = el.tagName;
        var keepStyle = (tag === 'VIDEO' || tag === 'AUDIO' || tag === 'IFRAME' || tag === 'IMG' || tag === 'SOURCE');
        if (!keepStyle && el.hasAttribute('style')) el.removeAttribute('style');
        if (el.hasAttribute('align')) el.removeAttribute('align');
        if (el.hasAttribute('class')) el.removeAttribute('class');
      });
      Array.prototype.forEach.call(temp.querySelectorAll('span,font'), function(el) {
        var parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      });
      Array.prototype.forEach.call(temp.querySelectorAll('div'), function(div) {
        var p = document.createElement('p');
        while (div.firstChild) p.appendChild(div.firstChild);
        div.parentNode.replaceChild(p, div);
      });
      var html = temp.innerHTML
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>(\s*<br\s*\/?>)+/gi, '</p><p>')
        .replace(/<br\s*\/?>/gi, '</p><p>')
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/[ \t]+/g, ' ');
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      var children = Array.prototype.slice.call(wrapper.childNodes);
      var pendingP = null;
      children.forEach(function(node) {
        var isBlock = node.nodeType === 1 && /^(P|H[1-6]|UL|OL|BLOCKQUOTE|PRE|FIGURE|TABLE|HR)$/.test(node.tagName);
        if (isBlock) {
          pendingP = null;
        } else {
          if (node.nodeType === 3 && !node.textContent.trim()) return;
          if (!pendingP) {
            pendingP = document.createElement('p');
            wrapper.insertBefore(pendingP, node);
          }
          pendingP.appendChild(node);
        }
      });
      Array.prototype.forEach.call(wrapper.querySelectorAll('p'), function(p) {
        var hasContent = (p.textContent || '').replace(/\u00a0/g, '').trim().length > 0
          || p.querySelector('img,iframe,video,audio,source');
        if (!hasContent) p.parentNode.removeChild(p);
      });
      editor.innerHTML = wrapper.innerHTML || '<p><br></p>';
      if (typeof showToast === 'function') showToast('Spacing normalized', 'success');
    } catch (err) {
      console.error('normalizeEditorSpacing failed:', err);
      if (typeof showToast === 'function') showToast('Could not normalize spacing', 'error');
    }
  }
  window.openBlogEditor = function(post) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:#fff;border-radius:12px;padding:0;width:95%;max-width:1100px;max-height:90vh;overflow:hidden;position:relative;display:flex">' +

      '<div style="flex:1;padding:24px;overflow-y:auto;border-right:1px solid #e2e8f0">' +
        '<button onclick="this.closest(\'.modal-overlay\').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:22px;cursor:pointer;color:#64748b;z-index:10">&times;</button>' +
        '<h3 style="margin:0 0 16px;color:#0A3D6B">' + (post ? 'Edit Post' : 'New Blog Post') + '</h3>' +
        '<div class="form-group"><label class="form-label">Title (English)</label><input class="form-input" id="bp-title" data-testid="input-blog-title" value="' + (post ? (post.title || '').replace(/"/g,'&quot;') : '') + '" /></div>' +
        '<div class="form-group"><label class="form-label">Title (Arabic)</label><input class="form-input" id="bp-title-ar" data-testid="input-blog-title-ar" value="' + (post ? (post.title_ar || '').replace(/"/g,'&quot;') : '') + '" dir="rtl" /></div>' +
        '<div class="form-group"><label class="form-label">Excerpt (English)</label><textarea class="form-textarea" id="bp-excerpt" data-testid="input-blog-excerpt" rows="2">' + (post ? (post.excerpt || '') : '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Excerpt (Arabic)</label><textarea class="form-textarea" id="bp-excerpt-ar" data-testid="input-blog-excerpt-ar" rows="2" dir="rtl">' + (post ? (post.excerpt_ar || '') : '') + '</textarea></div>' +
        '<div class="form-group"><label class="form-label">Content (English)</label>' +
          '<div class="rte-toolbar" data-target="bp-content">' +
            '<button type="button" data-cmd="bold" title="Bold"><b>B</b></button>' +
            '<button type="button" data-cmd="italic" title="Italic"><i>I</i></button>' +
            '<button type="button" data-cmd="underline" title="Underline"><u>U</u></button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="formatBlock" data-val="h2" title="Heading">H2</button>' +
            '<button type="button" data-cmd="formatBlock" data-val="h3" title="Subheading">H3</button>' +
            '<button type="button" data-cmd="formatBlock" data-val="p" title="Paragraph">P</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="insertUnorderedList" title="Bullet list">&bull; List</button>' +
            '<button type="button" data-cmd="insertOrderedList" title="Numbered list">1. List</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="createLink" title="Insert link">🔗 Link</button>' +
            '<button type="button" data-cmd="insertImage" title="Insert image by URL">🖼 Image URL</button>' +
            '<button type="button" data-cmd="uploadImage" title="Upload image from your computer">📤 Upload Image</button>' +
            '<button type="button" data-cmd="uploadVideo" title="Upload video from your computer">🎬 Upload Video</button>' +
            '<button type="button" data-cmd="insertVideoUrl" title="Embed video by URL (mp4/webm)">🔗 Video URL</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="normalizeSpacing" title="Make all paragraph spacing equal">⇅ Even Spacing</button>' +
            '<button type="button" data-cmd="removeFormat" title="Clear formatting">✕ Clear</button>' +
          '</div>' +
          '<div class="rte-editor" id="bp-content" data-testid="input-blog-content" contenteditable="true" data-placeholder="Write your blog post here...">' + (post ? rteInitialHtml(post.content || '') : '') + '</div>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Content (Arabic)</label>' +
          '<div class="rte-toolbar" data-target="bp-content-ar">' +
            '<button type="button" data-cmd="bold" title="Bold"><b>B</b></button>' +
            '<button type="button" data-cmd="italic" title="Italic"><i>I</i></button>' +
            '<button type="button" data-cmd="underline" title="Underline"><u>U</u></button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="formatBlock" data-val="h2" title="Heading">H2</button>' +
            '<button type="button" data-cmd="formatBlock" data-val="h3" title="Subheading">H3</button>' +
            '<button type="button" data-cmd="formatBlock" data-val="p" title="Paragraph">P</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="insertUnorderedList" title="Bullet list">&bull; List</button>' +
            '<button type="button" data-cmd="insertOrderedList" title="Numbered list">1. List</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="createLink" title="Insert link">🔗 Link</button>' +
            '<button type="button" data-cmd="insertImage" title="Insert image by URL">🖼 Image URL</button>' +
            '<button type="button" data-cmd="uploadImage" title="Upload image from your computer">📤 Upload Image</button>' +
            '<button type="button" data-cmd="uploadVideo" title="Upload video from your computer">🎬 Upload Video</button>' +
            '<button type="button" data-cmd="insertVideoUrl" title="Embed video by URL (mp4/webm)">🔗 Video URL</button>' +
            '<span class="rte-sep"></span>' +
            '<button type="button" data-cmd="normalizeSpacing" title="Make all paragraph spacing equal">⇅ Even Spacing</button>' +
            '<button type="button" data-cmd="removeFormat" title="Clear formatting">✕ Clear</button>' +
          '</div>' +
          '<div class="rte-editor" id="bp-content-ar" data-testid="input-blog-content-ar" contenteditable="true" dir="rtl" data-placeholder="اكتب محتوى المدونة هنا...">' + (post ? rteInitialHtml(post.content_ar || '') : '') + '</div>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Featured Image</label>' +
          '<div style="display:flex;gap:8px;align-items:flex-start">' +
            '<input class="form-input" id="bp-image" data-testid="input-blog-image" value="' + (post ? (post.image_url || '').replace(/"/g,'&quot;') : '') + '" placeholder="Image URL" style="flex:1" />' +
          '</div>' +
          '<div id="bp-image-preview" style="margin-top:8px"></div>' +
        '</div>' +
        '<div class="form-group"><label class="form-label">Slug</label><input class="form-input" id="bp-slug" data-testid="input-blog-slug" value="' + (post ? (post.slug || '').replace(/"/g,'&quot;') : '') + '" placeholder="auto-generated-from-title" /></div>' +
        '<div style="display:flex;gap:8px;margin-top:16px">' +
          '<button class="btn btn-primary" id="bp-save" data-testid="button-save-post" data-id="' + (post ? post.id : '') + '">Save Post</button>' +
          '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Cancel</button>' +
        '</div>' +
      '</div>' +

      '<div style="width:340px;background:#f8fafc;padding:20px;overflow-y:auto;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z"/><circle cx="12" cy="6" r="1.5"/></svg>' +
          '<span style="font-weight:600;font-size:15px;color:#0A3D6B">AI Assistant</span>' +
        '</div>' +

        '<div class="form-group" style="margin-bottom:12px">' +
          '<label class="form-label" style="font-size:12px">Topic / Prompt</label>' +
          '<textarea class="form-textarea" id="ai-topic" data-testid="input-ai-topic" rows="2" placeholder="e.g. Marine piling techniques in the Gulf region" style="font-size:13px"></textarea>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">' +
          '<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Generate Content</div>' +
          '<button class="btn btn-sm" id="ai-titles" data-testid="button-ai-titles" style="background:#0ea5e9;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h12"/></svg> Suggest Titles</button>' +
          '<button class="btn btn-sm" id="ai-full" data-testid="button-ai-full" style="background:#0ea5e9;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Write Full Post</button>' +
          '<button class="btn btn-sm" id="ai-outline" data-testid="button-ai-outline" style="background:#0ea5e9;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> Generate Outline</button>' +
          '<button class="btn btn-sm" id="ai-excerpt" data-testid="button-ai-excerpt" style="background:#0ea5e9;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Generate Excerpt</button>' +
          '<button class="btn btn-sm" id="ai-seo" data-testid="button-ai-seo" style="background:#6366f1;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> SEO Meta & Keywords</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">' +
          '<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Translate & Improve</div>' +
          '<button class="btn btn-sm" id="ai-translate-ar" data-testid="button-ai-translate-ar" style="background:#f59e0b;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg> Translate to Arabic</button>' +
          '<button class="btn btn-sm" id="ai-translate-en" data-testid="button-ai-translate-en" style="background:#f59e0b;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg> Translate to English</button>' +
          '<button class="btn btn-sm" id="ai-improve" data-testid="button-ai-improve" style="background:#10b981;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Improve Content</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">' +
          '<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Image</div>' +
          '<button class="btn btn-sm" id="ai-gen-image" data-testid="button-ai-gen-image" style="background:#8b5cf6;color:#fff;justify-content:flex-start;font-size:12px">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Generate Cover Image</button>' +
        '</div>' +

        '<div id="ai-output-wrap" style="display:none;margin-top:12px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<span style="font-size:12px;font-weight:600;color:#0A3D6B">AI Output</span>' +
            '<div style="display:flex;gap:4px">' +
              '<button class="btn btn-sm" id="ai-copy" data-testid="button-ai-copy" style="font-size:11px;padding:3px 8px;background:#e2e8f0;color:#334155">Copy</button>' +
              '<button class="btn btn-sm" id="ai-use-title" data-testid="button-ai-use-title" style="font-size:11px;padding:3px 8px;background:#0ea5e9;color:#fff">Use as Title</button>' +
              '<button class="btn btn-sm" id="ai-use-content" data-testid="button-ai-use-content" style="font-size:11px;padding:3px 8px;background:#0ea5e9;color:#fff">Use as Content</button>' +
              '<button class="btn btn-sm" id="ai-use-excerpt" data-testid="button-ai-use-excerpt" style="font-size:11px;padding:3px 8px;background:#0ea5e9;color:#fff">Use as Excerpt</button>' +
            '</div>' +
          '</div>' +
          '<textarea class="form-textarea" id="ai-output" data-testid="textarea-ai-output" rows="8" style="font-size:12px;background:#fff" readonly></textarea>' +
        '</div>' +

        '<div id="ai-loading" style="display:none;text-align:center;padding:20px;color:#64748b">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="margin:0 auto 8px;display:block"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' +
          '<span style="font-size:13px" id="ai-loading-text">Generating...</span>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(overlay);

    Array.prototype.forEach.call(overlay.querySelectorAll('.rte-toolbar'), function(toolbar) {
      var targetId = toolbar.getAttribute('data-target');
      var editor = document.getElementById(targetId);
      Array.prototype.forEach.call(toolbar.querySelectorAll('button[data-cmd]'), function(btn) {
        btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var cmd = btn.getAttribute('data-cmd');
          var val = btn.getAttribute('data-val') || null;
          editor.focus();
          if (cmd === 'createLink') {
            var url = prompt('Enter URL:', 'https://');
            if (url) document.execCommand('createLink', false, url);
          } else if (cmd === 'insertImage') {
            var imgUrl = prompt('Image URL:', 'https://');
            if (imgUrl) document.execCommand('insertImage', false, imgUrl);
          } else if (cmd === 'insertVideoUrl') {
            var vUrl = prompt('Video URL (must be a direct .mp4 / .webm / .ogg link):', 'https://');
            if (vUrl) {
              var safeVUrl = vUrl.replace(/"/g, '&quot;');
              var vidHtml = '<p><video controls playsinline preload="metadata" style="max-width:100%;border-radius:8px" src="' + safeVUrl + '"></video></p><p><br></p>';
              editor.focus();
              document.execCommand('insertHTML', false, vidHtml);
            }
          } else if (cmd === 'uploadImage' || cmd === 'uploadVideo') {
            var isVid = (cmd === 'uploadVideo');
            var fi = document.createElement('input');
            fi.type = 'file';
            fi.accept = isVid ? 'video/*' : 'image/*';
            fi.onchange = function() {
              var f = fi.files[0]; if (!f) return;
              var maxBytes = isVid ? (4 * 1024 * 1024) : (4 * 1024 * 1024);
              if (f.size > maxBytes) {
                showToast((isVid ? 'Video' : 'Image') + ' too large. Hosted limit is ~4 MB. ' + (isVid ? 'For longer videos, host on YouTube/Vimeo and use Video URL.' : 'Try compressing the image.'), 'error');
                return;
              }
              var rteToken = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
              var fd = new FormData(); fd.append('file', f);
              showToast('Uploading ' + (isVid ? 'video' : 'image') + '...', 'info');
              fetch('/admin/api/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + rteToken }, body: fd })
                .then(function(r) { return r.json().then(function(j){ return { ok: r.ok, data: j }; }); })
                .then(function(res) {
                  var d = res.data;
                  if (d && d.success && d.url) {
                    editor.focus();
                    if (d.kind === 'video' || isVid) {
                      var safeUrl = d.url.replace(/"/g, '&quot;');
                      var html = '<p><video controls playsinline preload="metadata" style="max-width:100%;border-radius:8px" src="' + safeUrl + '"></video></p><p><br></p>';
                      document.execCommand('insertHTML', false, html);
                    } else {
                      document.execCommand('insertImage', false, d.url);
                    }
                    showToast('Uploaded', 'success');
                  } else {
                    showToast((d && (d.message || d.error)) || 'Upload failed', 'error');
                  }
                }).catch(function() { showToast('Upload failed', 'error'); });
            };
            fi.click();
          } else if (cmd === 'formatBlock') {
            document.execCommand('formatBlock', false, val);
          } else if (cmd === 'normalizeSpacing') {
            normalizeEditorSpacing(editor);
          } else {
            document.execCommand(cmd, false, val);
          }
        });
      });
      editor.addEventListener('paste', function(e) {
        var items = (e.clipboardData || window.clipboardData).items;
        if (items) {
          for (var i = 0; i < items.length; i++) {
            if (items[i].type && items[i].type.indexOf('image') === 0) {
              e.preventDefault();
              var file = items[i].getAsFile();
              var rteToken = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
              var fd = new FormData(); fd.append('file', file);
              fetch('/admin/api/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + rteToken }, body: fd })
                .then(function(r) { return r.json(); })
                .then(function(d) {
                  if (d.success && d.url) {
                    editor.focus();
                    document.execCommand('insertImage', false, d.url);
                  }
                }).catch(function() {});
              return;
            }
          }
        }
      });
    });

    var imgInput = document.getElementById('bp-image');
    function updateImagePreview() {
      var prev = document.getElementById('bp-image-preview');
      if (imgInput.value) {
        prev.innerHTML = '<img src="' + escapeHtml(imgInput.value) + '" style="max-width:100%;max-height:120px;border-radius:6px;border:1px solid #e2e8f0" />';
      } else { prev.innerHTML = ''; }
    }
    imgInput.addEventListener('input', updateImagePreview);
    updateImagePreview();

    function showAiLoading(text) {
      document.getElementById('ai-loading').style.display = 'block';
      document.getElementById('ai-loading-text').textContent = text || 'Generating...';
      document.getElementById('ai-output-wrap').style.display = 'none';
    }
    function showAiOutput(text) {
      document.getElementById('ai-loading').style.display = 'none';
      document.getElementById('ai-output-wrap').style.display = 'block';
      document.getElementById('ai-output').value = text;
    }
    function showAiError(msg) {
      document.getElementById('ai-loading').style.display = 'none';
      showToast(msg, 'error');
    }
    function getTopic() {
      var t = document.getElementById('ai-topic').value.trim();
      if (!t) { var title = document.getElementById('bp-title').value.trim(); if (title) return title; }
      return t;
    }

    document.getElementById('ai-titles').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Generating title ideas...');
      aiBlogCall('title-ideas', topic, 'en').then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Failed to generate'); });
    });
    document.getElementById('ai-full').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Writing full blog post...');
      aiBlogCall('full-post', topic, 'en').then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Failed to generate'); });
    });
    document.getElementById('ai-outline').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Generating outline...');
      aiBlogCall('outline', topic, 'en').then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Failed to generate'); });
    });
    document.getElementById('ai-excerpt').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Generating excerpt...');
      aiBlogCall('excerpt', topic, 'en').then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Failed to generate'); });
    });
    document.getElementById('ai-seo').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Generating SEO data...');
      aiBlogCall('seo-meta', topic, 'en').then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Failed to generate'); });
    });
    function rteText(id) { var el = document.getElementById(id); return el ? (el.innerText || '').trim() : ''; }
    function rteHtml(id) { var el = document.getElementById(id); return el ? (el.innerHTML || '').trim() : ''; }
    function rteSetHtml(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
    function plainToHtml(text) {
      if (!text) return '';
      if (text.indexOf('<') !== -1 && text.indexOf('>') !== -1) return text;
      return text.split(/\n\n+/).map(function(p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
    }

    document.getElementById('ai-translate-ar').addEventListener('click', function() {
      var content = rteText('bp-content');
      var title = document.getElementById('bp-title').value.trim();
      var excerpt = document.getElementById('bp-excerpt').value.trim();
      if (!content && !title) { showToast('Write English content first', 'error'); return; }
      showAiLoading('Translating to Arabic...');
      var fullText = (title ? 'TITLE: ' + title + '\n\n' : '') + (excerpt ? 'EXCERPT: ' + excerpt + '\n\n' : '') + (content ? 'CONTENT:\n' + content : '');
      aiBlogCall('translate', '', 'ar', fullText).then(function(d) {
        if (d.success) {
          showAiOutput(d.content);
          var parts = d.content;
          var titleMatch = parts.match(/TITLE:\s*(.+)/i) || parts.match(/العنوان:\s*(.+)/i);
          var excerptMatch = parts.match(/EXCERPT:\s*(.+)/i) || parts.match(/المقتطف:\s*(.+)/i);
          var contentMatch = parts.match(/CONTENT:\s*([\s\S]+)/i) || parts.match(/المحتوى:\s*([\s\S]+)/i);
          if (titleMatch) document.getElementById('bp-title-ar').value = titleMatch[1].trim();
          if (excerptMatch) document.getElementById('bp-excerpt-ar').value = excerptMatch[1].trim();
          if (contentMatch) rteSetHtml('bp-content-ar', plainToHtml(contentMatch[1].trim()));
          else if (!titleMatch && !excerptMatch) {
            rteSetHtml('bp-content-ar', plainToHtml(d.content.trim()));
          }
          showToast('Arabic fields filled', 'success');
        } else { showAiError(d.error); }
      }).catch(function() { showAiError('Translation failed'); });
    });
    document.getElementById('ai-translate-en').addEventListener('click', function() {
      var content = rteText('bp-content-ar');
      if (!content) { showToast('Write Arabic content first', 'error'); return; }
      showAiLoading('Translating to English...');
      aiBlogCall('translate', '', 'en', content).then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Translation failed'); });
    });
    document.getElementById('ai-improve').addEventListener('click', function() {
      var content = rteText('bp-content');
      if (!content) { showToast('Write content first to improve', 'error'); return; }
      showAiLoading('Improving content...');
      aiBlogCall('improve', '', 'en', content).then(function(d) { d.success ? showAiOutput(d.content) : showAiError(d.error); }).catch(function() { showAiError('Improvement failed'); });
    });
    document.getElementById('ai-gen-image').addEventListener('click', function() {
      var topic = getTopic(); if (!topic) { showToast('Enter a topic first', 'error'); return; }
      showAiLoading('Generating image prompt...');
      aiBlogCall('image-prompt', topic, 'en').then(function(d) {
        if (!d.success) { showAiError(d.error); return; }
        var imgPrompt = d.content;
        showAiLoading('Creating cover image with AI (this may take 30-60s)...');
        fetch('/admin/api/ai-blog-image', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ prompt: imgPrompt })
        }).then(function(r) { return r.json(); }).then(function(imgD) {
          if (imgD.success) {
            document.getElementById('bp-image').value = imgD.url;
            updateImagePreview();
            showAiOutput('Image generated!\n\nPrompt used:\n' + imgPrompt + '\n\nImage URL:\n' + imgD.url);
            showToast('Cover image generated', 'success');
          } else { showAiError(imgD.error || 'Image generation failed'); }
        }).catch(function() { showAiError('Image generation failed'); });
      }).catch(function() { showAiError('Failed to generate image prompt'); });
    });

    document.getElementById('ai-copy').addEventListener('click', function() {
      var out = document.getElementById('ai-output');
      navigator.clipboard.writeText(out.value).then(function() { showToast('Copied to clipboard', 'success'); });
    });
    document.getElementById('ai-use-title').addEventListener('click', function() {
      var out = document.getElementById('ai-output').value.trim();
      var firstLine = out.split('\n')[0].replace(/^\d+[\.\)]\s*/, '').replace(/^#+\s*/, '').replace(/^\*+/, '').replace(/\*+$/, '').trim();
      document.getElementById('bp-title').value = firstLine;
      showToast('Title set', 'success');
    });
    document.getElementById('ai-use-content').addEventListener('click', function() {
      rteSetHtml('bp-content', plainToHtml(document.getElementById('ai-output').value.trim()));
      showToast('Content set', 'success');
    });
    document.getElementById('ai-use-excerpt').addEventListener('click', function() {
      document.getElementById('bp-excerpt').value = document.getElementById('ai-output').value.trim();
      showToast('Excerpt set', 'success');
    });

    document.getElementById('bp-save').addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var body = {
        title: document.getElementById('bp-title').value.trim(),
        title_ar: document.getElementById('bp-title-ar').value.trim(),
        excerpt: document.getElementById('bp-excerpt').value.trim(),
        excerpt_ar: document.getElementById('bp-excerpt-ar').value.trim(),
        content: rteHtml('bp-content'),
        content_ar: rteHtml('bp-content-ar'),
        image_url: document.getElementById('bp-image').value.trim(),
        slug: document.getElementById('bp-slug').value.trim(),
        status: 'published'
      };
      if (!body.title) { showToast('Title is required', 'error'); return; }
      var url = id ? '/admin/api/blog-posts/' + id : '/admin/api/blog-posts';
      var method = id ? 'PATCH' : 'POST';
      this.disabled = true;
      this.textContent = 'Saving...';
      var saveToken = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
      fetch(url, { method: method, headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + saveToken}, body: JSON.stringify(body) })
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
    var delToken = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    fetch('/admin/api/blog-posts/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + delToken } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success) { showToast('Post deleted', 'success'); loadBlogPosts(); }
        else showToast('Error deleting post', 'error');
      }).catch(function() { showToast('Error deleting post', 'error'); });
  };

  function loadBlogPosts() {
    var loadToken = sessionStorage.getItem('cahit_admin_token') || localStorage.getItem('cahit_admin_token');
    fetch('/admin/api/blog-posts', { headers: { 'Authorization': 'Bearer ' + loadToken } }).then(function(r) { return r.json(); }).then(function(d) {
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

  function bindScreenShareHelp() {
    var btn = document.getElementById('screenShareHelpBtn');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', function() { window.cahitOpenScreenShareHelp(); });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { bindScreenShareHelp(); init(); });
  } else {
    bindScreenShareHelp();
    init();
  }
})();
