<?php get_header(); ?>

<section class="hero-banner" data-testid="section-search-hero">
  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="<?php esc_attr_e('Search Results', 'cahit-theme'); ?>" class="hero-banner-bg" />
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title hero-banner-title-lg" data-testid="text-search-heading">
        <?php printf(esc_html__('Search Results for: %s', 'cahit-theme'), '<span>' . get_search_query() . '</span>'); ?>
      </h1>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-search-results">
  <div class="container">
    <?php if (have_posts()) : ?>
      <div class="grid grid-3 gap-8">
        <?php while (have_posts()) : the_post(); ?>
          <div class="blog-card" data-testid="card-search-<?php the_ID(); ?>">
            <?php if (has_post_thumbnail()) : ?>
              <div class="blog-card-image">
                <?php the_post_thumbnail('medium_large'); ?>
              </div>
            <?php endif; ?>
            <div class="blog-card-content">
              <span class="blog-card-date"><?php echo esc_html(get_the_date()); ?></span>
              <h3 class="blog-card-title"><?php the_title(); ?></h3>
              <p class="blog-card-excerpt"><?php echo esc_html(get_the_excerpt()); ?></p>
              <a href="<?php the_permalink(); ?>" class="service-card-link">
                <?php esc_html_e('Read More', 'cahit-theme'); ?>
                <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        <?php endwhile; ?>
      </div>

      <div class="pagination-wrapper mt-12">
        <?php
        the_posts_pagination(array(
          'mid_size' => 2,
          'prev_text' => __('&laquo; Previous', 'cahit-theme'),
          'next_text' => __('Next &raquo;', 'cahit-theme'),
        ));
        ?>
      </div>
    <?php else : ?>
      <div class="text-center">
        <p class="text-slate-600 mb-8"><?php esc_html_e('No results found. Please try a different search term.', 'cahit-theme'); ?></p>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary" data-testid="button-go-home">
          <?php esc_html_e('Back to Homepage', 'cahit-theme'); ?>
        </a>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php get_footer(); ?>
