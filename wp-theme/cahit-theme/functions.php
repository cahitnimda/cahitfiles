<?php
if (!defined('ABSPATH')) exit;

define('CAHIT_VERSION', '1.0.0');
define('CAHIT_DIR', get_template_directory());
define('CAHIT_URI', get_template_directory_uri());

function cahit_setup() {
    load_theme_textdomain('cahit-theme', CAHIT_DIR . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('custom-logo', array(
        'height' => 56,
        'width' => 200,
        'flex-width' => true,
        'flex-height' => true,
    ));
    add_theme_support('custom-background', array(
        'default-color' => 'ffffff',
    ));
    add_theme_support('editor-styles');
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');

    add_image_size('cahit-card', 600, 400, true);
    add_image_size('cahit-hero', 1920, 800, true);

    register_nav_menus(array(
        'primary' => __('Primary Menu', 'cahit-theme'),
        'footer' => __('Footer Menu', 'cahit-theme'),
        'services' => __('Services Menu', 'cahit-theme'),
    ));

    add_theme_support('customize-selective-refresh-widgets');
}
add_action('after_setup_theme', 'cahit_setup');

function cahit_content_width() {
    $GLOBALS['content_width'] = apply_filters('cahit_content_width', 1280);
}
add_action('after_setup_theme', 'cahit_content_width', 0);

function cahit_enqueue_scripts() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap', array(), null);
    wp_enqueue_style('lucide-icons', 'https://unpkg.com/lucide-static@latest/font/lucide.css', array(), null);
    wp_enqueue_style('cahit-theme', CAHIT_URI . '/assets/css/theme.css', array(), CAHIT_VERSION);
    wp_enqueue_style('cahit-style', get_stylesheet_uri(), array(), CAHIT_VERSION);

    wp_enqueue_script('cahit-theme', CAHIT_URI . '/assets/js/theme.js', array(), CAHIT_VERSION, true);
    wp_enqueue_script('cahit-chatbot', CAHIT_URI . '/assets/js/chatbot.js', array(), CAHIT_VERSION, true);

    wp_localize_script('cahit-theme', 'cahitData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'themeUrl' => CAHIT_URI,
        'nonce' => wp_create_nonce('cahit_nonce'),
        'homeUrl' => home_url('/'),
    ));

    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'cahit_enqueue_scripts');

function cahit_register_post_types() {
    register_post_type('project', array(
        'labels' => array(
            'name' => __('Projects', 'cahit-theme'),
            'singular_name' => __('Project', 'cahit-theme'),
            'add_new_item' => __('Add New Project', 'cahit-theme'),
            'edit_item' => __('Edit Project', 'cahit-theme'),
            'view_item' => __('View Project', 'cahit-theme'),
            'all_items' => __('All Projects', 'cahit-theme'),
            'search_items' => __('Search Projects', 'cahit-theme'),
            'not_found' => __('No projects found.', 'cahit-theme'),
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-building',
        'rewrite' => array('slug' => 'projects'),
        'show_in_rest' => true,
    ));

    register_post_type('service', array(
        'labels' => array(
            'name' => __('Services', 'cahit-theme'),
            'singular_name' => __('Service', 'cahit-theme'),
            'add_new_item' => __('Add New Service', 'cahit-theme'),
            'edit_item' => __('Edit Service', 'cahit-theme'),
            'view_item' => __('View Service', 'cahit-theme'),
            'all_items' => __('All Services', 'cahit-theme'),
            'search_items' => __('Search Services', 'cahit-theme'),
            'not_found' => __('No services found.', 'cahit-theme'),
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'menu_icon' => 'dashicons-hammer',
        'rewrite' => array('slug' => 'services'),
        'show_in_rest' => true,
    ));

    register_post_type('lead', array(
        'labels' => array(
            'name' => __('Leads', 'cahit-theme'),
            'singular_name' => __('Lead', 'cahit-theme'),
            'add_new_item' => __('Add New Lead', 'cahit-theme'),
            'edit_item' => __('Edit Lead', 'cahit-theme'),
            'all_items' => __('All Leads', 'cahit-theme'),
            'search_items' => __('Search Leads', 'cahit-theme'),
            'not_found' => __('No leads found.', 'cahit-theme'),
        ),
        'public' => false,
        'show_ui' => true,
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-groups',
        'show_in_rest' => true,
    ));

    register_taxonomy('project_category', 'project', array(
        'labels' => array(
            'name' => __('Project Categories', 'cahit-theme'),
            'singular_name' => __('Project Category', 'cahit-theme'),
        ),
        'public' => true,
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'project-category'),
    ));

    register_taxonomy('service_category', 'service', array(
        'labels' => array(
            'name' => __('Service Categories', 'cahit-theme'),
            'singular_name' => __('Service Category', 'cahit-theme'),
        ),
        'public' => true,
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'service-category'),
    ));
}
add_action('init', 'cahit_register_post_types');

function cahit_handle_lead_submission() {
    check_ajax_referer('cahit_nonce', 'nonce');

    $data = array(
        'post_title' => sanitize_text_field($_POST['name'] ?? __('Lead', 'cahit-theme')),
        'post_content' => sanitize_textarea_field($_POST['details'] ?? ''),
        'post_type' => 'lead',
        'post_status' => 'publish',
    );

    $post_id = wp_insert_post($data);

    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_lead_email', sanitize_email($_POST['email'] ?? ''));
        update_post_meta($post_id, '_lead_phone', sanitize_text_field($_POST['phone'] ?? ''));
        update_post_meta($post_id, '_lead_service', sanitize_text_field($_POST['service_type'] ?? ''));
        update_post_meta($post_id, '_lead_source', sanitize_text_field($_POST['source'] ?? 'website'));
        update_post_meta($post_id, '_lead_status', 'new');

        do_action('cahit_new_lead', $post_id, $_POST);

        wp_send_json_success(array('id' => $post_id));
    } else {
        wp_send_json_error(__('Failed to save lead', 'cahit-theme'));
    }
}
add_action('wp_ajax_cahit_submit_lead', 'cahit_handle_lead_submission');
add_action('wp_ajax_nopriv_cahit_submit_lead', 'cahit_handle_lead_submission');

function cahit_handle_quote_submission() {
    check_ajax_referer('cahit_nonce', 'nonce');

    $data = array(
        'post_title' => sanitize_text_field($_POST['fullName'] ?? __('Quote Request', 'cahit-theme')),
        'post_content' => sanitize_textarea_field(wp_json_encode($_POST)),
        'post_type' => 'lead',
        'post_status' => 'publish',
    );

    $post_id = wp_insert_post($data);

    if ($post_id && !is_wp_error($post_id)) {
        update_post_meta($post_id, '_lead_email', sanitize_email($_POST['email'] ?? ''));
        update_post_meta($post_id, '_lead_phone', sanitize_text_field($_POST['phone'] ?? ''));
        update_post_meta($post_id, '_lead_service', 'Quote Request');
        update_post_meta($post_id, '_lead_budget', sanitize_text_field($_POST['budget'] ?? ''));
        update_post_meta($post_id, '_lead_status', 'new');
        update_post_meta($post_id, '_lead_source', 'quote_form');

        do_action('cahit_new_lead', $post_id, $_POST);

        wp_send_json_success(array('id' => $post_id));
    } else {
        wp_send_json_error(__('Failed to save quote request', 'cahit-theme'));
    }
}
add_action('wp_ajax_cahit_submit_quote', 'cahit_handle_quote_submission');
add_action('wp_ajax_nopriv_cahit_submit_quote', 'cahit_handle_quote_submission');

function cahit_handle_chat() {
    check_ajax_referer('cahit_nonce', 'nonce');
    $message = sanitize_text_field($_POST['message'] ?? '');
    $session_id = sanitize_text_field($_POST['sessionId'] ?? '');

    $reply = __('Thank you for your message. Our team will get back to you soon. You can also reach us at ctc@cahitcontracting.com or call +968 2411 2406.', 'cahit-theme');
    $reply = apply_filters('cahit_chat_reply', $reply, $message, $session_id);

    wp_send_json_success(array('reply' => $reply));
}
add_action('wp_ajax_cahit_chat', 'cahit_handle_chat');
add_action('wp_ajax_nopriv_cahit_chat', 'cahit_handle_chat');

function cahit_widgets_init() {
    register_sidebar(array(
        'name' => __('Footer Widget Area', 'cahit-theme'),
        'id' => 'footer-widget',
        'description' => __('Widgets displayed in the footer area.', 'cahit-theme'),
        'before_widget' => '<div class="footer-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="footer-widget-title">',
        'after_title' => '</h4>',
    ));

    register_sidebar(array(
        'name' => __('Blog Sidebar', 'cahit-theme'),
        'id' => 'blog-sidebar',
        'description' => __('Widgets displayed on blog pages.', 'cahit-theme'),
        'before_widget' => '<div class="sidebar-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="sidebar-widget-title">',
        'after_title' => '</h4>',
    ));
}
add_action('widgets_init', 'cahit_widgets_init');

function cahit_customize_register($wp_customize) {
    $wp_customize->add_section('cahit_company_info', array(
        'title' => __('Company Information', 'cahit-theme'),
        'priority' => 30,
    ));

    $wp_customize->add_setting('cahit_company_name', array(
        'default' => 'Cahit Trading & Contracting LLC',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'refresh',
    ));
    $wp_customize->add_control('cahit_company_name', array(
        'label' => __('Company Name', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'text',
    ));

    $wp_customize->add_setting('cahit_tagline', array(
        'default' => 'A Solid Ground For Your Project',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('cahit_tagline', array(
        'label' => __('Company Tagline', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'text',
    ));

    $wp_customize->add_setting('cahit_phone', array(
        'default' => '+968 2411 2406 Ext 101',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('cahit_phone', array(
        'label' => __('Phone Number', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'text',
    ));

    $wp_customize->add_setting('cahit_mobile', array(
        'default' => '+968 9096 6562',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('cahit_mobile', array(
        'label' => __('Mobile Number', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'text',
    ));

    $wp_customize->add_setting('cahit_email', array(
        'default' => 'ctc@cahitcontracting.com',
        'sanitize_callback' => 'sanitize_email',
    ));
    $wp_customize->add_control('cahit_email', array(
        'label' => __('Email Address', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'email',
    ));

    $wp_customize->add_setting('cahit_whatsapp', array(
        'default' => '+96890966562',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    $wp_customize->add_control('cahit_whatsapp', array(
        'label' => __('WhatsApp Number (no spaces)', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'text',
    ));

    $wp_customize->add_setting('cahit_address', array(
        'default' => "Khaleej Tower\n6th Floor, No. 603\nGhala, Muscat\nSultanate of Oman",
        'sanitize_callback' => 'sanitize_textarea_field',
    ));
    $wp_customize->add_control('cahit_address', array(
        'label' => __('Office Address', 'cahit-theme'),
        'section' => 'cahit_company_info',
        'type' => 'textarea',
    ));

    $wp_customize->add_section('cahit_social', array(
        'title' => __('Social Media', 'cahit-theme'),
        'priority' => 35,
    ));

    $social_platforms = array(
        'linkedin' => __('LinkedIn URL', 'cahit-theme'),
        'twitter' => __('Twitter URL', 'cahit-theme'),
        'facebook' => __('Facebook URL', 'cahit-theme'),
        'instagram' => __('Instagram URL', 'cahit-theme'),
    );

    foreach ($social_platforms as $platform => $label) {
        $wp_customize->add_setting("cahit_social_{$platform}", array(
            'default' => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        $wp_customize->add_control("cahit_social_{$platform}", array(
            'label' => $label,
            'section' => 'cahit_social',
            'type' => 'url',
        ));
    }

    $wp_customize->add_section('cahit_footer', array(
        'title' => __('Footer Settings', 'cahit-theme'),
        'priority' => 40,
    ));

    $wp_customize->add_setting('cahit_footer_description', array(
        'default' => 'Cahit Trading & Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.',
        'sanitize_callback' => 'sanitize_textarea_field',
    ));
    $wp_customize->add_control('cahit_footer_description', array(
        'label' => __('Footer Description', 'cahit-theme'),
        'section' => 'cahit_footer',
        'type' => 'textarea',
    ));
}
add_action('customize_register', 'cahit_customize_register');

function cahit_register_admin_page() {
    add_menu_page(
        __('Cahit CRM', 'cahit-theme'),
        __('Cahit CRM', 'cahit-theme'),
        'manage_options',
        'cahit-admin',
        'cahit_admin_page_render',
        'dashicons-building',
        3
    );

    add_submenu_page(
        'cahit-admin',
        __('Dashboard', 'cahit-theme'),
        __('Dashboard', 'cahit-theme'),
        'manage_options',
        'cahit-admin',
        'cahit_admin_page_render'
    );

    add_submenu_page(
        'cahit-admin',
        __('Leads', 'cahit-theme'),
        __('Leads', 'cahit-theme'),
        'manage_options',
        'edit.php?post_type=lead'
    );
}
add_action('admin_menu', 'cahit_register_admin_page');

function cahit_admin_page_render() {
    echo '<div class="wrap"><h1>' . esc_html__('Cahit CRM Dashboard', 'cahit-theme') . '</h1>';
    echo '<p>' . esc_html__('Use the front-end admin panel at /admin for the full CRM experience, or manage content through the WordPress dashboard.', 'cahit-theme') . '</p>';

    $lead_count = wp_count_posts('lead');
    $project_count = wp_count_posts('project');
    $service_count = wp_count_posts('service');

    echo '<div style="display:flex;gap:20px;margin-top:20px;">';
    echo '<div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;flex:1;"><h2 style="margin:0;font-size:36px;color:#0ea5e9;">' . intval($lead_count->publish) . '</h2><p>' . esc_html__('Active Leads', 'cahit-theme') . '</p></div>';
    echo '<div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;flex:1;"><h2 style="margin:0;font-size:36px;color:#0ea5e9;">' . intval($project_count->publish) . '</h2><p>' . esc_html__('Projects', 'cahit-theme') . '</p></div>';
    echo '<div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;flex:1;"><h2 style="margin:0;font-size:36px;color:#0ea5e9;">' . intval($service_count->publish) . '</h2><p>' . esc_html__('Services', 'cahit-theme') . '</p></div>';
    echo '</div>';

    echo '<p style="margin-top:20px;"><a href="' . esc_url(home_url('/admin')) . '" class="button button-primary" target="_blank">' . esc_html__('Open Cahit Admin Panel', 'cahit-theme') . '</a></p>';
    echo '</div>';
}

function cahit_add_lead_meta_boxes() {
    add_meta_box(
        'cahit_lead_details',
        __('Lead Details', 'cahit-theme'),
        'cahit_lead_meta_box_render',
        'lead',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'cahit_add_lead_meta_boxes');

function cahit_lead_meta_box_render($post) {
    wp_nonce_field('cahit_lead_meta', 'cahit_lead_meta_nonce');
    $email = get_post_meta($post->ID, '_lead_email', true);
    $phone = get_post_meta($post->ID, '_lead_phone', true);
    $service = get_post_meta($post->ID, '_lead_service', true);
    $status = get_post_meta($post->ID, '_lead_status', true) ?: 'new';
    $source = get_post_meta($post->ID, '_lead_source', true) ?: 'website';
    $budget = get_post_meta($post->ID, '_lead_budget', true);

    echo '<p><label><strong>' . esc_html__('Email:', 'cahit-theme') . '</strong></label><br>';
    echo '<input type="email" name="lead_email" value="' . esc_attr($email) . '" style="width:100%"></p>';

    echo '<p><label><strong>' . esc_html__('Phone:', 'cahit-theme') . '</strong></label><br>';
    echo '<input type="text" name="lead_phone" value="' . esc_attr($phone) . '" style="width:100%"></p>';

    echo '<p><label><strong>' . esc_html__('Service:', 'cahit-theme') . '</strong></label><br>';
    echo '<input type="text" name="lead_service" value="' . esc_attr($service) . '" style="width:100%"></p>';

    echo '<p><label><strong>' . esc_html__('Status:', 'cahit-theme') . '</strong></label><br>';
    echo '<select name="lead_status" style="width:100%">';
    $statuses = array('new' => __('New', 'cahit-theme'), 'contacted' => __('Contacted', 'cahit-theme'), 'qualified' => __('Qualified', 'cahit-theme'), 'converted' => __('Converted', 'cahit-theme'), 'closed' => __('Closed', 'cahit-theme'));
    foreach ($statuses as $key => $label) {
        echo '<option value="' . esc_attr($key) . '"' . selected($status, $key, false) . '>' . esc_html($label) . '</option>';
    }
    echo '</select></p>';

    echo '<p><label><strong>' . esc_html__('Source:', 'cahit-theme') . '</strong></label><br>';
    echo '<input type="text" name="lead_source" value="' . esc_attr($source) . '" style="width:100%" readonly></p>';

    if ($budget) {
        echo '<p><label><strong>' . esc_html__('Budget:', 'cahit-theme') . '</strong></label><br>';
        echo '<input type="text" name="lead_budget" value="' . esc_attr($budget) . '" style="width:100%"></p>';
    }
}

function cahit_save_lead_meta($post_id) {
    if (!isset($_POST['cahit_lead_meta_nonce']) || !wp_verify_nonce($_POST['cahit_lead_meta_nonce'], 'cahit_lead_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['lead_email'])) update_post_meta($post_id, '_lead_email', sanitize_email($_POST['lead_email']));
    if (isset($_POST['lead_phone'])) update_post_meta($post_id, '_lead_phone', sanitize_text_field($_POST['lead_phone']));
    if (isset($_POST['lead_service'])) update_post_meta($post_id, '_lead_service', sanitize_text_field($_POST['lead_service']));
    if (isset($_POST['lead_status'])) update_post_meta($post_id, '_lead_status', sanitize_text_field($_POST['lead_status']));
    if (isset($_POST['lead_budget'])) update_post_meta($post_id, '_lead_budget', sanitize_text_field($_POST['lead_budget']));
}
add_action('save_post_lead', 'cahit_save_lead_meta');

function cahit_lead_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['lead_email'] = __('Email', 'cahit-theme');
    $new_columns['lead_phone'] = __('Phone', 'cahit-theme');
    $new_columns['lead_service'] = __('Service', 'cahit-theme');
    $new_columns['lead_status'] = __('Status', 'cahit-theme');
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_lead_posts_columns', 'cahit_lead_columns');

function cahit_lead_column_content($column, $post_id) {
    switch ($column) {
        case 'lead_email':
            echo esc_html(get_post_meta($post_id, '_lead_email', true));
            break;
        case 'lead_phone':
            echo esc_html(get_post_meta($post_id, '_lead_phone', true));
            break;
        case 'lead_service':
            echo esc_html(get_post_meta($post_id, '_lead_service', true));
            break;
        case 'lead_status':
            $status = get_post_meta($post_id, '_lead_status', true) ?: 'new';
            $colors = array('new' => '#0ea5e9', 'contacted' => '#f59e0b', 'qualified' => '#8b5cf6', 'converted' => '#22c55e', 'closed' => '#94a3b8');
            $color = isset($colors[$status]) ? $colors[$status] : '#94a3b8';
            echo '<span style="background:' . esc_attr($color) . ';color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">' . esc_html(ucfirst($status)) . '</span>';
            break;
    }
}
add_action('manage_lead_posts_custom_column', 'cahit_lead_column_content', 10, 2);

function cahit_excerpt_length($length) {
    return 25;
}
add_filter('excerpt_length', 'cahit_excerpt_length');

function cahit_excerpt_more($more) {
    return '&hellip;';
}
add_filter('excerpt_more', 'cahit_excerpt_more');

function cahit_pingback_header() {
    if (is_singular() && pings_open()) {
        printf('<link rel="pingback" href="%s">', esc_url(get_bloginfo('pingback_url')));
    }
}
add_action('wp_head', 'cahit_pingback_header');

function cahit_body_classes($classes) {
    if (!is_singular()) {
        $classes[] = 'hfeed';
    }
    if (!is_active_sidebar('blog-sidebar')) {
        $classes[] = 'no-sidebar';
    }
    return $classes;
}
add_filter('body_class', 'cahit_body_classes');
