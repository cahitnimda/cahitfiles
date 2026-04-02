<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Cahit Trading & Contracting LLC - A Solid Ground For Your Project. Construction and infrastructure company in Oman.">
  <meta property="og:title" content="Cahit Trading & Contracting LLC">
  <meta property="og:description" content="Construction and infrastructure company operating in the Sultanate of Oman since 2009.">
  <meta property="og:type" content="website">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if (function_exists('wp_body_open')) { wp_body_open(); } ?>

<nav class="navbar sticky" id="main-nav">
  <div class="container navbar-inner">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="navbar-logo">
      <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png" alt="Cahit Logo" class="logo-img">
    </a>
    <div class="nav-links" id="nav-links">
      <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-link<?php if (is_front_page()) echo ' active'; ?>">Home</a>
      <a href="<?php echo esc_url(home_url('/about')); ?>" class="nav-link<?php if (is_page('about')) echo ' active'; ?>">About Us</a>
      <a href="<?php echo esc_url(home_url('/services')); ?>" class="nav-link<?php if (is_page('services')) echo ' active'; ?>">Services</a>
      <a href="<?php echo esc_url(home_url('/projects')); ?>" class="nav-link<?php if (is_page('projects')) echo ' active'; ?>">Projects</a>
      <a href="<?php echo esc_url(home_url('/clients')); ?>" class="nav-link<?php if (is_page('clients')) echo ' active'; ?>">Clients</a>
      <a href="<?php echo esc_url(home_url('/blog')); ?>" class="nav-link<?php if (is_page('blog') || is_home()) echo ' active'; ?>">Blog</a>
      <a href="<?php echo esc_url(home_url('/careers')); ?>" class="nav-link nav-link-careers<?php if (is_page('careers')) echo ' active'; ?>">Careers</a>
      <button class="nav-link nav-link-button" id="contact-nav-btn" onclick="openContactPopup()">Contact</button>
    </div>
    <div class="navbar-actions">
      <div class="lang-toggle" data-testid="lang-toggle">
        <button class="lang-btn lang-btn-active" id="lang-en" onclick="switchLang('en')" data-testid="button-lang-en">EN</button>
        <span class="lang-divider">|</span>
        <button class="lang-btn" id="lang-ar" onclick="switchLang('ar')" data-testid="button-lang-ar">AR</button>
      </div>
      <button class="btn btn-white" id="get-quote-btn" onclick="openQuoteModal()">Get Quote</button>
      <button class="mobile-menu-toggle" id="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle menu">
        <svg class="menu-icon" id="menu-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg class="menu-icon" id="menu-icon-close" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="mobile-nav-link<?php if (is_front_page()) echo ' active'; ?>">Home</a>
    <a href="<?php echo esc_url(home_url('/about')); ?>" class="mobile-nav-link<?php if (is_page('about')) echo ' active'; ?>">About Us</a>
    <a href="<?php echo esc_url(home_url('/services')); ?>" class="mobile-nav-link<?php if (is_page('services')) echo ' active'; ?>">Services</a>
    <a href="<?php echo esc_url(home_url('/projects')); ?>" class="mobile-nav-link<?php if (is_page('projects')) echo ' active'; ?>">Projects</a>
    <a href="<?php echo esc_url(home_url('/clients')); ?>" class="mobile-nav-link<?php if (is_page('clients')) echo ' active'; ?>">Clients</a>
    <a href="<?php echo esc_url(home_url('/blog')); ?>" class="mobile-nav-link<?php if (is_page('blog') || is_home()) echo ' active'; ?>">Blog</a>
    <a href="<?php echo esc_url(home_url('/careers')); ?>" class="mobile-nav-link nav-link-careers<?php if (is_page('careers')) echo ' active'; ?>">Careers</a>
    <button class="mobile-nav-link mobile-nav-link-button" onclick="openContactPopup(); toggleMobileMenu();">Contact</button>
  </div>
</nav>

<div class="modal-overlay" id="contact-popup" style="display:none;" onclick="if(event.target===this)closeContactPopup();">
  <div class="modal-content modal-sm">
    <div class="modal-header-row">
      <h2 class="modal-title">Contact Us</h2>
      <button class="modal-close-btn" onclick="closeContactPopup();" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="contact-list">
      <div class="contact-item contact-item-static">
        <span class="contact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <div>
          <p class="contact-label" data-ar="المكتب الرئيسي">Head Office</p>
          <p class="contact-value contact-address" data-ar-html="برج الخليج، الطابق السادس، رقم 603<br>غلا، مسقط، سلطنة عُمان">Khaleej Tower, 6th floor, No 603<br>Ghala, Muscat, Sultanate of Oman</p>
        </div>
      </div>
      <a href="tel:+96824062411" class="contact-item">
        <span class="contact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <div>
          <p class="contact-label" data-ar="اتصل بنا">Call Us</p>
          <p class="contact-value" dir="ltr">+968 24062411 Ext: 101</p>
        </div>
      </a>
      <a href="tel:+96890966562" class="contact-item">
        <span class="contact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <div>
          <p class="contact-label" data-ar="هاتف عُمان">Oman</p>
          <p class="contact-value" dir="ltr">+968 90966562</p>
        </div>
      </a>
      <a href="mailto:ctc@cahitcontracting.com" class="contact-item">
        <span class="contact-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </span>
        <div>
          <p class="contact-label" data-ar="راسلنا">Email Us</p>
          <p class="contact-value">ctc@cahitcontracting.com</p>
        </div>
      </a>
    </div>
  </div>
</div>

<div class="modal-overlay" id="quote-modal" style="display:none;" onclick="if(event.target===this)closeQuoteModal();">
  <div class="modal-content modal-lg">
    <div class="quote-modal-header">
      <div>
        <h2 class="quote-modal-title">Request a Quote</h2>
        <p class="quote-modal-subtitle">Tell us about your project and we'll prepare a tailored proposal</p>
      </div>
      <button class="modal-close-btn modal-close-btn-light" onclick="closeQuoteModal();" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div id="quote-success" style="display:none;" class="quote-success-content">
      <div class="success-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>
      <h3 class="success-title">Quote Request Submitted!</h3>
      <p class="success-text">Thank you for your interest. Our team will review your project details and get back to you within 24 hours.</p>
      <button class="btn btn-primary" onclick="closeQuoteModal();">Close</button>
    </div>

    <div id="quote-form-content" class="quote-form-scroll">
      <div class="quote-section">
        <h3 class="quote-section-label">Project Details</h3>

        <div class="form-group">
          <label class="form-label">1. What is your budget range for this project?</label>
          <select id="quote-budget" class="form-select">
            <option value="">Select an option</option>
            <option value="Under $500K">Under $500K</option>
            <option value="$500K - $2M">$500K - $2M</option>
            <option value="$2M - $10M">$2M - $10M</option>
            <option value="$10M+">$10M+</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">2. Is your funding already secured and ready to go?</label>
          <div class="pill-group" id="funding-group">
            <button class="pill-btn" onclick="selectPill('funding-group', this, 'Yes')">Yes</button>
            <button class="pill-btn" onclick="selectPill('funding-group', this, 'Not yet')">Not yet</button>
            <button class="pill-btn" onclick="selectPill('funding-group', this, 'Partially')">Partially</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">3. What are your non-negotiables? And what's flexible?</label>
          <textarea id="quote-non-negotiables" class="form-textarea" placeholder="E.g., specific materials, timeline constraints, quality standards..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">4. Do you have planning permission, or do we need to factor that in?</label>
          <div class="pill-group" id="planning-group">
            <button class="pill-btn" onclick="selectPill('planning-group', this, 'Yes, I have it')">Yes, I have it</button>
            <button class="pill-btn" onclick="selectPill('planning-group', this, 'Need to obtain')">Need to obtain</button>
            <button class="pill-btn" onclick="selectPill('planning-group', this, 'Not sure')">Not sure</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">5. Are there any site-specific challenges or restrictions we should know about?</label>
          <textarea id="quote-site-challenges" class="form-textarea" placeholder="E.g., access limitations, environmental concerns, soil conditions..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">6. When would you like the work to start and finish?</label>
          <input type="text" id="quote-timeline" class="form-input" placeholder="E.g., Start in Q2 2026, complete by end of 2026">
        </div>

        <div class="form-group">
          <label class="form-label">7. Are there any important deadlines we should work around?</label>
          <input type="text" id="quote-deadlines" class="form-input" placeholder="E.g., regulatory deadlines, event dates, seasonal constraints...">
        </div>

        <div class="form-group">
          <label class="form-label">8. Who is the main point of contact or decision-maker?</label>
          <input type="text" id="quote-decision-maker" class="form-input" placeholder="Name and role of the decision-maker">
        </div>

        <div class="form-group">
          <label class="form-label">9. How would you prefer to receive updates?</label>
          <div class="pill-group pill-group-multi" id="updates-group">
            <button class="pill-btn" onclick="togglePill(this)">Email</button>
            <button class="pill-btn" onclick="togglePill(this)">WhatsApp</button>
            <button class="pill-btn" onclick="togglePill(this)">Weekly Meetings</button>
            <button class="pill-btn" onclick="togglePill(this)">Phone Calls</button>
          </div>
        </div>
      </div>

      <div class="quote-section quote-section-border">
        <h3 class="quote-section-label">Your Contact Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" id="quote-fullname" class="form-input" placeholder="Enter your full name">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" id="quote-email" class="form-input" placeholder="Enter your email">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" id="quote-phone" class="form-input" placeholder="+968 XXXX XXXX">
        </div>
      </div>

      <button class="btn btn-primary btn-full" id="quote-submit-btn" onclick="submitQuoteForm();">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Submit Quote Request
      </button>
    </div>
  </div>
</div>
