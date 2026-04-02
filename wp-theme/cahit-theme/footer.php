
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/EILLLBYLeCNrUbzF.png" alt="Cahit Logo" class="footer-logo">
        <p class="footer-desc">Cahit Trading &amp; Contracting LLC is a construction and infrastructure company delivering marine, coastal, and civil engineering solutions across Oman. With experienced leadership and skilled engineering teams, we execute complex projects with reliability, precision, and the highest standards of quality and safety.</p>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Company</h4>
        <ul class="footer-links">
          <li><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
          <li><a href="<?php echo esc_url(home_url('/about')); ?>">About Us</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">Services</a></li>
          <li><a href="<?php echo esc_url(home_url('/projects')); ?>">Projects</a></li>
          <li><a href="<?php echo esc_url(home_url('/clients')); ?>">Clients</a></li>
          <li><a href="<?php echo esc_url(home_url('/blog')); ?>">Blog</a></li>
          <li><a href="<?php echo esc_url(home_url('/careers')); ?>">Careers</a></li>
          <li><button onclick="openContactPopup();" class="footer-link-button">Contact</button></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Our Services</h4>
        <ul class="footer-links">
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">Marine & Coastal Construction</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">Infrastructure Development</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">Earthworks</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">Dewatering & Shoring</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">MEP Works</a></li>
          <li><a href="<?php echo esc_url(home_url('/services')); ?>">General Construction</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4 class="footer-heading">Contact</h4>
        <div class="footer-contact">
          <div class="footer-contact-item">
            <svg class="footer-contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <p data-ar="برج الخليج، الطابق السادس، رقم 603">Khaleej Tower, 6th floor, No 603</p>
              <p data-ar="غلا، مسقط، سلطنة عُمان">Ghala, Muscat, Sultanate of Oman</p>
            </div>
          </div>
          <div class="footer-contact-item">
            <svg class="footer-contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <div>
              <a href="tel:+96824062411" dir="ltr">+968 24062411 Ext: 101</a>
              <br>
              <a href="tel:+96890966562" dir="ltr">+968 90966562 <span data-ar="(عُمان)">(Oman)</span></a>
            </div>
          </div>
          <div class="footer-contact-item">
            <svg class="footer-contact-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <a href="mailto:ctc@cahitcontracting.com">ctc@cahitcontracting.com</a>
          </div>
        </div>
        <a href="<?php echo defined('ABSPATH') ? esc_url(wp_login_url(home_url('/admin'))) : '/admin/login'; ?>" class="footer-admin-link" data-testid="link-admin-login">
          <svg style="display:inline-block;vertical-align:middle;margin-right:6px" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span class="footer-admin-text"><?php echo defined('ABSPATH') ? esc_html__('Admin Login', 'cahit-theme') : 'Admin Login'; ?></span></a>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copyright">&copy; <?php echo date('Y'); ?> <?php echo defined('ABSPATH') ? esc_html(get_theme_mod('cahit_company_name', 'Cahit Trading & Contracting LLC')) : 'Cahit Trading & Contracting LLC'; ?>. <?php echo defined('ABSPATH') ? esc_html__('All Rights Reserved.', 'cahit-theme') : 'All Rights Reserved.'; ?></p>
      <p class="footer-tagline"><?php echo defined('ABSPATH') ? esc_html(get_theme_mod('cahit_tagline', 'A Solid Ground For Your Project')) : 'A Solid Ground For Your Project'; ?></p>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
