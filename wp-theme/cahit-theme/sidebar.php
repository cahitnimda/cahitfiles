<?php if (!defined('ABSPATH')) exit; ?>

<?php if (is_active_sidebar('footer-widget')) : ?>
  <aside class="sidebar" role="complementary">
    <?php dynamic_sidebar('footer-widget'); ?>
  </aside>
<?php endif; ?>
