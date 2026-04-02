<?php get_header(); ?>

<section class="hero-banner" data-testid="section-careers-hero">
  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="Careers" class="hero-banner-bg" />
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title hero-banner-title-lg" data-testid="text-careers-heading">Careers</h1>
      <p class="hero-banner-subtitle hero-banner-subtitle-lg">Join our team and help build the future of Oman's infrastructure.</p>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-careers-intro">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Work With Us</h2>
      <p class="section-subtitle">Cahit Trading &amp; Contracting LLC offers exciting career opportunities in marine construction, infrastructure development, and engineering.</p>
    </div>
    <div class="grid grid-3 gap-8">
      <div class="commitment-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="commitment-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3 class="commitment-title">Team Culture</h3>
        <p class="commitment-desc">We foster a collaborative environment where every team member's contribution is valued and recognized.</p>
      </div>
      <div class="commitment-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="commitment-icon"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <h3 class="commitment-title">Professional Growth</h3>
        <p class="commitment-desc">We invest in continuous training and development to help our employees grow their skills and advance their careers.</p>
      </div>
      <div class="commitment-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="commitment-icon"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <h3 class="commitment-title">Safety First</h3>
        <p class="commitment-desc">We maintain the highest safety standards across all our operations, ensuring a safe workplace for everyone.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-section" data-testid="section-careers-cta">
  <div class="container text-center">
    <h2 class="cta-title">Interested in Joining Our Team?</h2>
    <p class="cta-subtitle">Send your CV to our email and our HR team will review your application.</p>
    <div class="cta-buttons">
      <a href="mailto:ctc@cahitcontracting.com" class="btn btn-white">Send Your CV</a>
      <button class="btn btn-outline-white" onclick="openContactPopup()">Contact Us</button>
    </div>
  </div>
</section>

<?php get_footer(); ?>
