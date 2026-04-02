<?php get_header(); ?>

<section class="hero-banner" data-testid="section-single-hero">
  <?php if (has_post_thumbnail()) : ?>
    <img src="<?php echo esc_url(get_the_post_thumbnail_url(null, 'full')); ?>" alt="<?php the_title_attribute(); ?>" class="hero-banner-bg" />
  <?php else : ?>
    <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="<?php the_title_attribute(); ?>" class="hero-banner-bg" />
  <?php endif; ?>
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title" data-testid="text-single-heading"><?php the_title(); ?></h1>
      <p class="hero-banner-subtitle">
        <?php echo esc_html(get_the_date()); ?> &mdash; <?php esc_html_e('by', 'cahit-theme'); ?> <?php the_author(); ?>
      </p>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-single-content">
  <div class="container">
    <?php while (have_posts()) : the_post(); ?>
      <article class="single-post-content prose">
        <?php the_content(); ?>
      </article>

      <div class="post-navigation mt-12">
        <div class="grid grid-2 gap-8">
          <div>
            <?php
            $prev_post = get_previous_post();
            if ($prev_post) :
            ?>
              <a href="<?php echo esc_url(get_permalink($prev_post)); ?>" class="btn btn-outline" data-testid="link-prev-post">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                <?php echo esc_html($prev_post->post_title); ?>
              </a>
            <?php endif; ?>
          </div>
          <div class="text-right">
            <?php
            $next_post = get_next_post();
            if ($next_post) :
            ?>
              <a href="<?php echo esc_url(get_permalink($next_post)); ?>" class="btn btn-outline" data-testid="link-next-post">
                <?php echo esc_html($next_post->post_title); ?>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            <?php endif; ?>
          </div>
        </div>
      </div>

      <?php if (comments_open() || get_comments_number()) : ?>
        <?php comments_template(); ?>
      <?php endif; ?>
    <?php endwhile; ?>
  </div>
</section>

<?php get_footer(); ?>
