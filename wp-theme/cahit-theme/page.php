<?php get_header(); ?>

<section class="hero-banner" data-testid="section-page-hero">
  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="<?php the_title_attribute(); ?>" class="hero-banner-bg" />
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title hero-banner-title-lg" data-testid="text-page-heading"><?php the_title(); ?></h1>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-page-content">
  <div class="container">
    <?php while (have_posts()) : the_post(); ?>
      <div class="page-content prose">
        <?php the_content(); ?>
      </div>
    <?php endwhile; ?>
  </div>
</section>

<?php get_footer(); ?>
