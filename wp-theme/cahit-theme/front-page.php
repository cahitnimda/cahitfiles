<?php get_header(); ?>
<?php $base_url = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663029149863/'; ?>

<!-- 1. Hero Section -->
<section class="hero-section" id="hero-section" data-testid="section-hero" data-funnel-section="hero">
  <video class="hero-video-bg" autoplay muted loop playsinline data-video-key="hero" data-keep-playing="true">
    <source src="<?php echo $base_url; ?>FtuVECRYiIRERWQB.mp4" type="video/mp4" />
  </video>
  <div class="hero-gradient-overlay"></div>
  <div class="hero-content">
    <div class="container">
      <div class="hero-text-block">
        <h1 class="hero-title" data-testid="text-hero-title">
          <span class="hero-title-line">Delivering Infrastructure</span>
          <br />
          <span class="text-cyan-200 hero-title-line">Excellence</span>
        </h1>
        <p class="hero-subtitle" data-testid="text-hero-subtitle">
          Marine &amp; Coastal Construction Experts
        </p>
        <div class="hero-buttons">
          <button class="btn btn-white" data-testid="button-hero-consultation" onclick="if(typeof openConsultation==='function'){openConsultation();}">
            Schedule Consultation
            <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <a href="<?php echo home_url('/projects'); ?>">
            <button class="btn btn-outline-white" data-testid="button-hero-portfolio">
              View Portfolio
            </button>
          </a>
        </div>
        <div class="hero-counters">
          <div class="hero-counter-item">
            <div class="hero-counter-value" data-counter="25" data-suffix="+" data-testid="text-counter-years">0+</div>
            <div class="hero-counter-label">Years of Industry-Leading Experience</div>
          </div>
          <div class="hero-counter-item">
            <div class="hero-counter-value" data-counter="50" data-suffix="+" data-testid="text-counter-projects">0+</div>
            <div class="hero-counter-label">Major Infrastructure Projects Completed</div>
          </div>
          <div class="hero-counter-item">
            <div class="hero-counter-value" data-counter="100" data-suffix="%" data-testid="text-counter-operations">0%</div>
            <div class="hero-counter-label">Operations Across Oman</div>
          </div>
          <div class="hero-counter-item">
            <div class="hero-counter-value" data-testid="text-counter-specialist">#1</div>
            <div class="hero-counter-label">Marine & Infrastructure Specialists</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</section>

<!-- 2. Logo Marquee Section -->
<section class="logos-section" data-testid="section-logos">
  <div class="container">
    <h2 class="section-title text-center" data-testid="text-logos-title">Trusted by Leading Organizations</h2>
    <p class="section-subtitle text-center">
      Cahit Trading &amp; Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.
    </p>
    <div class="marquee-wrapper">
      <div class="marquee-fade-left"></div>
      <div class="marquee-fade-right"></div>
      <div class="marquee-track">
        <?php
        $logos = array(
          array('name' => 'Doosan Heavy Industries & Construction', 'file' => 'cxoRXpdmBqwcLedo.png'),
          array('name' => 'Al Jazeera International Group', 'file' => 'qFCAQxxNiSjFqwyq.png'),
          array('name' => 'Al-Hashemi & Al-Rawas Trading & Contracting', 'file' => 'KXeFROoDmbydRpuQ.png'),
          array('name' => 'Fisia Italimpianti', 'file' => 'NhkgkgOdoRAutEDK.png'),
          array('name' => 'GPS In The New Millennium', 'file' => 'ssANHVRFYXALYoKI.png'),
          array('name' => 'Makyol', 'file' => 'IqZMAjrvgmDdBJaW.png'),
          array('name' => 'Omran', 'file' => 'cCzhlyOLGOdtqfjD.jpg'),
          array('name' => 'Salalah Sanitary Drainage Services', 'file' => 'eGXMGushzTuSHdCj.png'),
          array('name' => 'SNC-Lavalin', 'file' => 'dIjoxYdtJmpPvEZG.png'),
          array('name' => 'STFA', 'file' => 'MrphYkzHpiuuKwNm.png'),
          array('name' => 'TAV Construction', 'file' => 'fOxkXRAGOOnYlnkI.png'),
        );
        for ($repeat = 0; $repeat < 2; $repeat++) :
          foreach ($logos as $idx => $logo) :
        ?>
        <div class="marquee-logo-card" data-testid="img-logo-<?php echo ($repeat * count($logos)) + $idx; ?>">
          <img src="<?php echo $base_url . $logo['file']; ?>" alt="<?php echo esc_attr($logo['name']); ?>" class="marquee-logo-img" />
        </div>
        <?php
          endforeach;
        endfor;
        ?>
      </div>
    </div>
  </div>
</section>

<!-- 3. About Preview Section -->
<section class="about-section" id="about-section" data-testid="section-about" data-funnel-section="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-media">
        <video class="about-video" autoplay loop muted playsinline preload="auto" data-video-key="about">
          <source src="<?php echo $base_url; ?>AtcBFtPQatxcgPuw.mp4" type="video/mp4" />
        </video>
        <div class="rolling-images" data-testid="about-rolling-images">
          <?php
          $rolling_images = array(
            array('src' => 'gvWLawWCNocSINuR.jpeg', 'alt' => 'Road construction with heavy rollers'),
            array('src' => 'GjfldJYeoGyqGIMR.jpeg', 'alt' => 'Asphalt paving with Vogele machine'),
            array('src' => 'mejIiORMfOESXWxO.jpeg', 'alt' => 'Road line marking operations'),
            array('src' => 'jdGZtMFCClzefYrV.png', 'alt' => 'Underground pipe installation'),
          );
          foreach ($rolling_images as $idx => $img) :
          ?>
          <div class="rolling-image-item <?php echo $idx === 0 ? 'active' : ''; ?>" data-rolling-index="<?php echo $idx; ?>">
            <img src="<?php echo $base_url . $img['src']; ?>" alt="<?php echo esc_attr($img['alt']); ?>" />
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <div class="about-text">
        <h2 class="section-title" data-testid="text-about-title">Engineering the Foundations of Tomorrow</h2>
        <p class="text-slate-600">
          Cahit Trading &amp; Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.
        </p>
        <p class="text-slate-600">
          Founded by Tahir &#350;enyurt, the company has developed into a trusted contractor delivering complex projects across marine construction, infrastructure development, earthworks, and industrial services.
        </p>
        <p class="text-slate-600 mb-8">
          Through a combination of engineering expertise, operational excellence, and strong client partnerships, Cahit contributes to the development of critical infrastructure across Oman.
        </p>
        <a href="<?php echo home_url('/about'); ?>">
          <button class="btn btn-sky" data-testid="button-discover-company">
            Discover Our Company
            <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </a>
      </div>
    </div>
  </div>

</section>

<!-- 4. Our Services Section -->
<section class="services-section" id="services-section" data-testid="section-expertise">
  <video class="section-video-bg" autoplay muted loop playsinline data-video-key="services" data-keep-playing="true">
    <source src="<?php echo $base_url; ?>FtuVECRYiIRERWQB.mp4" type="video/mp4" />
  </video>
  <div class="services-overlay"></div>
  <div class="container relative-z10">
    <div class="text-center mb-14">
      <h2 class="section-title text-white" data-testid="text-expertise-title">Our Services</h2>
      <p class="section-subtitle text-slate-300">
        Our diverse expertise allows us to support complex infrastructure projects across multiple sectors.
      </p>
    </div>
    <div class="services-grid">
      <?php
      $services = array(
        array('id' => 'marine', 'name' => 'Marine & Coastal Construction', 'image' => 'EGRSgZmJXJSrWKJY.png', 'desc' => 'Design and construction of marine infrastructure including breakwaters, quay walls, revetments, dredging, and coastal protection systems.'),
        array('id' => 'infrastructure', 'name' => 'Infrastructure Development', 'image' => 'gvWLawWCNocSINuR.jpeg', 'desc' => 'Civil infrastructure development including utilities, industrial facilities, and integrated project delivery solutions.'),
        array('id' => 'earthworks', 'name' => 'Earthworks', 'image' => 'hMZPCXiHvRhErvHk.gif', 'desc' => 'Bulk excavation, grading, compaction, and large-scale site preparation using modern heavy equipment.'),
        array('id' => 'dewatering', 'name' => 'Dewatering & Shoring', 'image' => 'NHQbvhqluSlDGrrN.png', 'desc' => 'Advanced groundwater control systems and structural support solutions ensuring safe and stable construction environments.'),
        array('id' => 'mep', 'name' => 'MEP Works', 'image' => 'qZRtUjMizSFySgTf.png', 'desc' => 'Mechanical, electrical and plumbing systems supporting industrial facilities, infrastructure and utility projects.'),
        array('id' => 'general', 'name' => 'General Construction', 'image' => '/assets/images/general-construction.jpg', 'local' => true, 'desc' => 'Comprehensive residential, commercial, and industrial building solutions. Skilled workforce with modern equipment and proven expertise. Commitment to safety, quality, and on-time delivery. Renovation, remodeling, and project management services.'),
      );
      foreach ($services as $service) :
      ?>
      <div class="service-card" data-testid="card-service-<?php echo $service['id']; ?>">
        <div class="service-card-image">
          <img src="<?php echo isset($service['local']) && $service['local'] ? $service['image'] : $base_url . $service['image']; ?>" alt="<?php echo esc_attr($service['name']); ?>" />
        </div>
        <div class="service-card-body">
          <h3 class="service-card-title"><?php echo esc_html($service['name']); ?></h3>
          <p class="service-card-desc"><?php echo esc_html($service['desc']); ?></p>
          <a href="<?php echo home_url('/services'); ?>" class="service-card-link">
            Learn More
            <svg class="icon-arrow-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <div class="text-center mt-10">
      <a href="<?php echo home_url('/services'); ?>">
        <button class="btn btn-white-sky" data-testid="button-view-all-services" data-ar-html="عرض جميع الخدمات <svg class='icon-arrow' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14'/><path d='m12 5 7 7-7 7'/></svg>">
          View All Services
          <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </a>
    </div>
  </div>
</section>

<!-- 5. Marine Specialists Section -->
<section class="marine-section" data-testid="section-marine">
  <video class="section-video-bg" autoplay muted loop playsinline data-video-key="marine" data-keep-playing="true">
    <source src="<?php echo $base_url; ?>FtuVECRYiIRERWQB.mp4" type="video/mp4" />
  </video>
  <div class="marine-overlay"></div>
  <div class="container relative-z10">
    <div class="marine-header">
      <h2 class="marine-title">Specialists in Marine &amp; Coastal Infrastructure</h2>
      <p class="marine-subtitle">
        Cahit Trading &amp; Contracting LLC is recognized for its expertise in the construction of marine and coastal infrastructure.
      </p>
    </div>
    <div class="marine-pills-grid">
      <?php
      $capabilities = array(
        'Sea Harbors', 'Breakwaters and Groynes', 'Coastal Protection Systems', 'Rock Armour Installation',
        'Geotextile Protection', 'Beach Reclamation', 'Dredging', 'Underwater Excavation',
        'Boat Ramps and Pontoons', 'Quay Wall Construction',
      );
      foreach ($capabilities as $cap) :
      ?>
      <div class="marine-pill">
        <svg class="marine-pill-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
        <p class="marine-pill-text"><?php echo esc_html($cap); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
    <p class="marine-footer-text">
      Through advanced engineering practices and experienced teams, we deliver durable infrastructure designed for challenging marine environments.
    </p>
  </div>
</section>

<!-- 6. Stats Section -->
<section class="stats-section" id="stats-section" data-testid="section-stats">
  <div class="container">
    <h2 class="section-title text-center">Delivering Infrastructure Excellence</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value" data-counter="15" data-suffix="+">0+</div>
        <p class="stat-label">Years Industry Leadership Experience</p>
      </div>
      <div class="stat-item">
        <div class="stat-value" data-counter="50" data-suffix="+">0+</div>
        <p class="stat-label">Major Infrastructure Projects Delivered</p>
      </div>
      <div class="stat-item">
        <div class="stat-value" data-counter="100" data-suffix="%">0%</div>
        <p class="stat-label">Operations Across Oman</p>
      </div>
      <div class="stat-item">
        <div class="stat-value-static">#1</div>
        <p class="stat-label">Marine &amp; Infrastructure Specialists</p>
      </div>
    </div>
  </div>
</section>

<!-- 7. Selected Projects Section -->
<section class="projects-section" id="projects-section" data-testid="section-projects" data-funnel-section="projects">
  <div class="container">
    <div class="text-center mb-16">
      <h2 class="section-title" data-testid="text-projects-title">Selected Projects</h2>
    </div>
    <div class="projects-grid">
      <div class="project-card" data-testid="card-project-seaport">
        <div class="project-card-image">
          <img src="<?php echo $base_url; ?>ScxGkCDjPFNOhvON.png" alt="Seaport Infrastructure" />
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">Seaport Infrastructure</h3>
          <p class="project-card-location">Muscat, Oman</p>
          <p class="project-card-desc">Quay wall construction and breakwater installation</p>
        </div>
      </div>
      <div class="project-card" data-testid="card-project-coastal">
        <div class="project-card-image">
          <img src="<?php echo $base_url; ?>zrgzKMxwmxJkeDsu.jpg" alt="Coastal Protection" />
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">Coastal Protection Systems</h3>
          <p class="project-card-location">Salalah, Oman</p>
          <p class="project-card-desc">Rock armour installation and coastal defense</p>
        </div>
      </div>
    </div>
    <div class="text-center mt-10">
      <a href="<?php echo home_url('/projects'); ?>">
        <button class="btn btn-sky" data-testid="button-explore-projects">
          Explore All Projects
          <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </a>
    </div>
  </div>

</section>

<!-- 8. Leadership Section -->
<section class="leadership-section" data-testid="section-leadership">
  <div class="container">
    <div class="text-center mb-14">
      <h2 class="section-title" data-testid="text-leadership-title">Leadership</h2>
      <p class="section-subtitle">Meet the professionals behind Cahit Trading &amp; Contracting.</p>
    </div>
    <div class="leadership-grid">
      <div class="leader-card" data-testid="card-testimonial-tahir">
        <div class="leader-video-container" data-video-key="tahir">
          <video class="leader-video" loop muted data-video-key="tahir">
            <source src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/videos/tahir.mp4" type="video/mp4" />
          </video>
          <div class="leader-video-overlay">
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            <span class="hover-label">Hover to Watch</span>
          </div>
        </div>
        <div class="leader-info">
          <h3 class="leader-name">Tahir &#350;enyurt</h3>
          <p class="leader-role">Managing Director</p>
          <p class="leader-bio">Tahir &#350;enyurt is a Civil Engineer with over 25 years of experience in the construction and contracting industry. He has successfully led numerous projects including marine infrastructure, road construction, industrial facilities and residential developments across Turkey and the GCC.</p>
          <p class="leader-bio">As Managing Director of Cahit Trading &amp; Contracting LLC, he leads the company's operations and strategic growth in the Omani construction sector.</p>
          <div class="leader-details">
            <div class="leader-detail-item">
              <p class="leader-detail-label">Education</p>
              <p class="leader-detail-value">Bachelor of Civil Engineering</p>
              <p class="leader-detail-value leader-detail-university">Middle East Technical University</p>
            </div>
            <div class="leader-detail-item">
              <p class="leader-detail-label">License</p>
              <p class="leader-detail-value">Registered Civil Engineer</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- 9. Commitment Section -->
<section class="commitment-section" data-testid="section-commitment">
  <div class="container">
    <h2 class="section-title text-center">Our Commitment</h2>
    <div class="commitment-grid">
      <div class="commitment-card">
        <div class="commitment-icon-wrapper">
          <svg class="commitment-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
        </div>
        <h3 class="commitment-card-title">Best Quality</h3>
        <p class="commitment-card-desc">We maintain the highest engineering and construction standards in every project.</p>
      </div>
      <div class="commitment-card">
        <div class="commitment-icon-wrapper">
          <svg class="commitment-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <h3 class="commitment-card-title">On-Time Delivery</h3>
        <p class="commitment-card-desc">We respect project timelines and deliver reliable execution without compromising quality.</p>
      </div>
      <div class="commitment-card">
        <div class="commitment-icon-wrapper">
          <svg class="commitment-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>
        </div>
        <h3 class="commitment-card-title">Experience</h3>
        <p class="commitment-card-desc">Our experienced professionals ensure efficient project delivery and operational excellence.</p>
      </div>
    </div>
  </div>
</section>


<!-- Lead Qualification Funnel (fixed position overlays) -->
<div class="funnel-panel funnel-hero-panel" id="funnel-step-1" data-testid="funnel-step-1" style="display:none;">
  <div class="funnel-panel-header">
    <button class="funnel-close" onclick="closeFunnel(1)" aria-label="Close">&times;</button>
  </div>
  <div class="funnel-question-block" id="funnel-q1-block">
    <h3 class="funnel-title" data-testid="funnel-q1-title" data-ar="ما نوع المشروع الذي تخطط له؟"><span class="funnel-qnum">1.</span> What type of project are you planning?</h3>
    <div class="funnel-options" id="funnel-project-type">
      <button class="funnel-option" onclick="selectHeroOption('funnel-project-type', this)" data-testid="funnel-opt-marine" data-en="Marine Construction" data-ar="بناء بحري">Marine Construction</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-project-type', this)" data-testid="funnel-opt-coastal" data-en="Coastal Protection" data-ar="حماية ساحلية">Coastal Protection</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-project-type', this)" data-testid="funnel-opt-seaport" data-en="Seaport Infrastructure" data-ar="بنية تحتية للميناء">Seaport Infrastructure</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-project-type', this)" data-testid="funnel-opt-earthworks" data-en="Earthworks" data-ar="أعمال حفر">Earthworks</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-project-type', this)" data-testid="funnel-opt-mep" data-en="MEP Works" data-ar="أعمال ميكانيكا وكهرباء وسباكة">MEP Works</button>
    </div>
    <p class="funnel-helper" data-ar="هذا يساعدنا في توجيهك إلى الخدمة المناسبة">This helps us direct you to the right service</p>
  </div>
  <div class="funnel-question-block" id="funnel-q2-block">
    <h3 class="funnel-title" data-testid="funnel-q2-title" data-ar="ما هو الهدف الرئيسي لمشروعك؟"><span class="funnel-qnum">2.</span> What is your project's primary goal?</h3>
    <div class="funnel-options" id="funnel-primary-goal">
      <button class="funnel-option" onclick="selectHeroOption('funnel-primary-goal', this)" data-testid="funnel-goal-coastal" data-en="Strengthen coastal protection" data-ar="تعزيز حماية السواحل">Strengthen coastal protection</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-primary-goal', this)" data-testid="funnel-goal-port" data-en="Expand port capacity" data-ar="توسيع سعة الميناء">Expand port capacity</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-primary-goal', this)" data-testid="funnel-goal-infra" data-en="Infrastructure development" data-ar="تطوير البنية التحتية">Infrastructure development</button>
      <button class="funnel-option" onclick="selectHeroOption('funnel-primary-goal', this)" data-testid="funnel-goal-other" data-en="Other" data-ar="أخرى">Other</button>
    </div>
  </div>
  <div class="funnel-comm-box">
    <textarea class="funnel-comm-input" id="funnel-message" placeholder="Tell us more about your project..." data-placeholder-ar="أخبرنا المزيد عن مشروعك..." data-placeholder-en="Tell us more about your project..." data-testid="funnel-message" rows="3"></textarea>
    <button class="funnel-comm-send" onclick="submitHeroFunnel()" data-testid="funnel-hero-submit" data-ar="إرسال">Send</button>
  </div>
</div>

<div class="funnel-panel" id="funnel-step-3" data-testid="funnel-step-3" style="display:none;">
  <div class="funnel-panel-header">
    <div class="funnel-step-badge" data-ar="تواصل">Contact</div>
    <button class="funnel-close" onclick="closeFunnel(3)" aria-label="Close">&times;</button>
  </div>
  <h3 class="funnel-title" data-ar="أكمل بياناتك">Complete Your Details</h3>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="دورك">Your Role</label>
    <div class="funnel-options" id="funnel-role">
      <button class="funnel-option" onclick="selectFunnelOption('funnel-role', this)" data-ar="مالك المشروع">Project Owner</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-role', this)" data-ar="مهندس / استشاري">Engineer / Consultant</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-role', this)" data-ar="مدير مشتريات / عقود">Procurement / Contract Manager</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-role', this)" data-ar="أخرى">Other</button>
    </div>
  </div>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="هل أنت صاحب القرار؟">Are you the decision maker?</label>
    <div class="funnel-options funnel-options-row" id="funnel-decision">
      <button class="funnel-option" onclick="selectFunnelOption('funnel-decision', this)" data-ar="نعم">Yes</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-decision', this)" data-ar="لا">No</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-decision', this)" data-ar="جزء من فريق">Part of a team</button>
    </div>
  </div>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="الاسم الكامل">Full Name</label>
    <input type="text" class="funnel-input" id="funnel-name" placeholder="Your full name" data-placeholder-ar="اسمك الكامل" data-placeholder-en="Your full name" data-testid="funnel-input-name" />
  </div>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="البريد الإلكتروني">Email Address</label>
    <input type="email" class="funnel-input" id="funnel-email" placeholder="your@email.com" data-testid="funnel-input-email" />
  </div>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="رقم الهاتف">Phone Number</label>
    <input type="tel" class="funnel-input" id="funnel-phone" placeholder="+968 XXXX XXXX" data-testid="funnel-input-phone" />
  </div>
  <div class="funnel-field">
    <label class="funnel-label" data-ar="وقت الاستشارة المفضل">Preferred Consultation Time</label>
    <div class="funnel-options funnel-options-row" id="funnel-time">
      <button class="funnel-option" onclick="selectFunnelOption('funnel-time', this)" data-ar="صباحاً">Morning</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-time', this)" data-ar="بعد الظهر">Afternoon</button>
      <button class="funnel-option" onclick="selectFunnelOption('funnel-time', this)" data-ar="مساءً">Evening</button>
    </div>
  </div>
  <button class="btn btn-primary btn-full funnel-submit" onclick="submitFunnelStep(3)" data-testid="funnel-submit-3" data-ar="إرسال الطلب">Submit Request</button>
</div>

<div class="funnel-panel funnel-panel-success" id="funnel-step-4" data-testid="funnel-step-4" style="display:none;">
  <div class="funnel-panel-header">
    <button class="funnel-close" onclick="closeFunnel(4)" aria-label="Close">&times;</button>
  </div>
  <div class="funnel-success-content">
    <div class="funnel-success-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    </div>
    <h3 class="funnel-title" data-ar="تم استلام طلبك">Request Received</h3>
    <p class="funnel-success-text" data-ar="لقد استلمنا استفسارك. سيتواصل فريقنا معك قريباً لتحديد موعد استشارتك المجانية.">We've received your inquiry. Our team will contact you shortly to schedule your free consultation.</p>
  </div>
</div>

<div id="consultation-overlay" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center">
  <div style="background:#fff;border-radius:12px;max-width:480px;width:90%;padding:32px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
    <button onclick="document.getElementById('consultation-overlay').style.display='none'" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:24px;cursor:pointer;color:#64748b" data-testid="button-close-consultation">&times;</button>
    <h3 style="margin:0 0 4px;font-size:22px;color:#0A3D6B" data-testid="text-consultation-title" data-ar="جدولة استشارة">Schedule a Consultation</h3>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px" data-ar="املأ بياناتك وسيتواصل فريقنا معك قريباً.">Fill in your details and our team will contact you shortly.</p>
    <form id="consultationForm" data-testid="form-consultation">
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:4px" data-ar="الاسم الكامل *">Full Name *</label>
        <input type="text" name="name" required style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;box-sizing:border-box" data-testid="input-consult-name" />
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:4px" data-ar="البريد الإلكتروني *">Email *</label>
        <input type="email" name="email" required style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;box-sizing:border-box" data-testid="input-consult-email" />
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:4px" data-ar="الهاتف">Phone</label>
        <input type="tel" name="phone" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;box-sizing:border-box" data-testid="input-consult-phone" />
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:4px" data-ar="الخدمة المطلوبة">Service Interest</label>
        <select name="service_type" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;box-sizing:border-box;background:#fff" data-testid="select-consult-service">
          <option value="" data-ar="اختر خدمة...">Select a service...</option>
          <option value="Marine & Coastal Construction" data-ar="البناء البحري والساحلي">Marine & Coastal Construction</option>
          <option value="Infrastructure Development" data-ar="تطوير البنية التحتية">Infrastructure Development</option>
          <option value="Earthworks" data-ar="أعمال الحفر والردم">Earthworks</option>
          <option value="Dewatering & Shoring" data-ar="نزح المياه والتدعيم">Dewatering & Shoring</option>
          <option value="MEP Works" data-ar="الأعمال الكهروميكانيكية">MEP Works</option>
          <option value="General Construction" data-ar="البناء العام">General Construction</option>
          <option value="Other" data-ar="أخرى">Other</option>
        </select>
      </div>
      <div style="margin-bottom:20px">
        <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:4px" data-ar="الرسالة">Message</label>
        <textarea name="details" rows="3" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;box-sizing:border-box;resize:vertical" data-testid="input-consult-details"></textarea>
      </div>
      <button type="submit" style="width:100%;padding:12px;background:#0A3D6B;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer" data-testid="button-consult-submit" data-ar="إرسال الطلب">Send Request</button>
    </form>
    <div id="consultation-success" style="display:none;text-align:center;padding:20px 0">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <h3 style="margin:12px 0 4px;color:#0A3D6B" data-testid="text-consult-success" data-ar="شكراً لك!">Thank You!</h3>
      <p style="color:#64748b;font-size:14px" data-ar="لقد استلمنا طلبك. سيتواصل فريقنا معك قريباً لتحديد موعد استشارتك.">We've received your request. Our team will contact you shortly to schedule your consultation.</p>
    </div>
  </div>
</div>

<script>
(function() {
  window.openConsultation = function() {
    var overlay = document.getElementById('consultation-overlay');
    if (overlay) { overlay.style.display = 'flex'; }
  };
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('consultationForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      var formData = new FormData(form);
      formData.append('action', 'consultation');
      var ajaxUrl = (typeof cahitData !== 'undefined' && cahitData.ajaxUrl) || '/api/ajax';
      fetch(ajaxUrl, { method: 'POST', body: formData })
        .then(function(r) { return r.json(); })
        .then(function() {
          form.style.display = 'none';
          document.getElementById('consultation-success').style.display = 'block';
        })
        .catch(function() {
          btn.disabled = false;
          btn.textContent = 'Send Request';
          alert('Something went wrong. Please try again.');
        });
    });
  });
})();
</script>

<?php get_footer(); ?>
