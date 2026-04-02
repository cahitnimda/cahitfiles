<?php get_header(); ?>

<section class="hero-banner" data-testid="section-blog-hero">
  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/pdSXKYWQJmOrlgEf.png" alt="<?php esc_attr_e('Blog', 'cahit-theme'); ?>" class="hero-banner-bg" />
  <div class="hero-banner-overlay"></div>
  <div class="hero-banner-content">
    <div class="container">
      <h1 class="hero-banner-title hero-banner-title-lg" data-testid="text-blog-heading" data-ar="المدونة"><?php esc_html_e('Blog', 'cahit-theme'); ?></h1>
      <p class="hero-banner-subtitle hero-banner-subtitle-lg" data-ar="رؤى وأخبار وتحديثات من فريق كاهيت للتجارة والمقاولات."><?php esc_html_e('Insights, news, and updates from the Cahit Trading & Contracting team.', 'cahit-theme'); ?></p>
    </div>
  </div>
</section>

<section class="section bg-white" data-testid="section-blog-posts">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title" data-ar="أحدث المقالات"><?php esc_html_e('Latest Posts', 'cahit-theme'); ?></h2>
      <p class="section-subtitle" data-ar="ابقَ على اطلاع بأحدث مشاريعنا ورؤى الصناعة وأخبار الشركة."><?php esc_html_e('Stay up to date with our latest projects, industry insights, and company news.', 'cahit-theme'); ?></p>
    </div>

    <?php
    $blog_query = new WP_Query(array(
      'post_type' => 'post',
      'posts_per_page' => 9,
      'paged' => get_query_var('paged') ? get_query_var('paged') : 1,
    ));

    if ($blog_query->have_posts()) : ?>
      <div class="grid grid-3 gap-8">
        <?php while ($blog_query->have_posts()) : $blog_query->the_post(); ?>
          <div class="blog-card" data-testid="card-blog-<?php the_ID(); ?>">
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
        echo paginate_links(array(
          'total' => $blog_query->max_num_pages,
          'current' => max(1, get_query_var('paged')),
          'prev_text' => __('&laquo; Previous', 'cahit-theme'),
          'next_text' => __('Next &raquo;', 'cahit-theme'),
        ));
        ?>
      </div>

      <?php wp_reset_postdata(); ?>
    <?php else : ?>
      <div class="grid grid-3 gap-8">
        <div class="blog-card" data-testid="card-blog-1">
          <div class="blog-card-image">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/ScxGkCDjPFNOhvON.png" alt="Marine Construction Update" />
          </div>
          <div class="blog-card-content">
            <span class="blog-card-date"><?php echo esc_html(date_i18n('F Y')); ?></span>
            <h3 class="blog-card-title" data-ar="البنية التحتية البحرية: بناء مستقبل عُمان الساحلي"><?php esc_html_e('Marine Infrastructure: Building Oman\'s Coastal Future', 'cahit-theme'); ?></h3>
            <p class="blog-card-excerpt" data-ar="نظرة عامة على أحدث تطورات البناء البحري ودور كاهيت في تقديم البنية التحتية الساحلية الحيوية في جميع أنحاء عُمان."><?php esc_html_e('An overview of recent marine construction developments and Cahit\'s role in delivering critical coastal infrastructure across Oman.', 'cahit-theme'); ?></p>
            <a href="#" class="service-card-link" data-ar="اقرأ المزيد"><?php esc_html_e('Read More', 'cahit-theme'); ?> <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
          </div>
        </div>
        <div class="blog-card" data-testid="card-blog-2">
          <div class="blog-card-image">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/gvWLawWCNocSINuR.jpeg" alt="Infrastructure Development" />
          </div>
          <div class="blog-card-content">
            <span class="blog-card-date"><?php echo esc_html(date_i18n('F Y', strtotime('-1 month'))); ?></span>
            <h3 class="blog-card-title" data-ar="اتجاهات تطوير البنية التحتية في دول مجلس التعاون الخليجي"><?php esc_html_e('Infrastructure Development Trends in the GCC', 'cahit-theme'); ?></h3>
            <p class="blog-card-excerpt" data-ar="استكشاف أحدث الاتجاهات في تطوير البنية التحتية عبر منطقة مجلس التعاون الخليجي وتأثيرها على الصناعة."><?php esc_html_e('Exploring the latest trends in infrastructure development across the Gulf Cooperation Council region and what they mean for the industry.', 'cahit-theme'); ?></p>
            <a href="#" class="service-card-link" data-ar="اقرأ المزيد"><?php esc_html_e('Read More', 'cahit-theme'); ?> <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
          </div>
        </div>
        <div class="blog-card" data-testid="card-blog-3">
          <div class="blog-card-image">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/zrgzKMxwmxJkeDsu.jpg" alt="Coastal Protection" />
          </div>
          <div class="blog-card-content">
            <span class="blog-card-date"><?php echo esc_html(date_i18n('F Y', strtotime('-2 months'))); ?></span>
            <h3 class="blog-card-title" data-ar="حماية السواحل: صون شواطئ عُمان"><?php esc_html_e('Coastal Protection: Safeguarding Oman\'s Shoreline', 'cahit-theme'); ?></h3>
            <p class="blog-card-excerpt" data-ar="كيف يتم تطبيق تقنيات الهندسة الحديثة لحماية وتعزيز البيئات الساحلية القيّمة في عُمان."><?php esc_html_e('How modern engineering techniques are being applied to protect and enhance Oman\'s valuable coastal environments.', 'cahit-theme'); ?></p>
            <a href="#" class="service-card-link" data-ar="اقرأ المزيد"><?php esc_html_e('Read More', 'cahit-theme'); ?> <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
          </div>
        </div>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php get_footer(); ?>
