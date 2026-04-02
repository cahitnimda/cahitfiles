<?php if (!defined('ABSPATH')) exit; ?>

<?php if (post_password_required()) return; ?>

<div id="comments" class="comments-area mt-12" data-testid="section-comments">
  <?php if (have_comments()) : ?>
    <h3 class="section-title text-left mb-8">
      <?php
      $comment_count = get_comments_number();
      printf(
        esc_html(_n('%d Comment', '%d Comments', $comment_count, 'cahit-theme')),
        $comment_count
      );
      ?>
    </h3>
    <ol class="comment-list">
      <?php
      wp_list_comments(array(
        'style' => 'ol',
        'short_ping' => true,
        'avatar_size' => 48,
      ));
      ?>
    </ol>
    <?php the_comments_navigation(); ?>
  <?php endif; ?>

  <?php
  comment_form(array(
    'title_reply' => __('Leave a Comment', 'cahit-theme'),
    'class_submit' => 'btn btn-primary',
    'comment_field' => '<div class="form-group"><label class="form-label" for="comment">' . esc_html__('Comment', 'cahit-theme') . '</label><textarea id="comment" name="comment" class="form-textarea" rows="5" required></textarea></div>',
  ));
  ?>
</div>
