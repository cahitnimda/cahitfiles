<?php get_header(); ?>

<section class="hero-banner" data-testid="section-404">
  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="<?php esc_attr_e('Page Not Found', 'cahit-theme'); ?>" class="hero-banner-bg" />
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title hero-banner-title-lg" data-testid="text-404-heading"><?php esc_html_e('404 — Page Not Found', 'cahit-theme'); ?></h1>
      <p class="hero-banner-subtitle hero-banner-subtitle-lg"><?php esc_html_e('The page you are looking for does not exist or has been moved.', 'cahit-theme'); ?></p>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-404-content">
  <div class="container text-center">
    <p class="text-slate-600 mb-8"><?php esc_html_e('You can return to the homepage or use the navigation above to find what you are looking for.', 'cahit-theme'); ?></p>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary" data-testid="button-go-home">
      <?php esc_html_e('Back to Homepage', 'cahit-theme'); ?>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </a>
  </div>
</section>

<?php get_footer(); ?>
