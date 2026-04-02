(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initVideoHover();
    initAnimatedCounters();
    initRollingImages();
    initPillButtons();
    initQuoteFormSubmit();
    initSmoothScroll();
    initLeadFunnel();
  });

  function initMobileMenu() {
    var toggle = document.getElementById("mobile-menu-toggle");
    var menu = document.getElementById("mobile-menu");
    var openIcon = document.getElementById("menu-icon-open");
    var closeIcon = document.getElementById("menu-icon-close");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.contains("open");
      if (isOpen) {
        menu.classList.remove("open");
        if (openIcon) openIcon.style.display = "";
        if (closeIcon) closeIcon.style.display = "none";
      } else {
        menu.classList.add("open");
        if (openIcon) openIcon.style.display = "none";
        if (closeIcon) closeIcon.style.display = "";
      }
    });

    var links = menu.querySelectorAll("a, button");
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        if (openIcon) openIcon.style.display = "";
        if (closeIcon) closeIcon.style.display = "none";
      });
    });
  }

  function initVideoHover() {
    var containers = document.querySelectorAll(".leader-video-container");
    containers.forEach(function (container) {
      var video = container.querySelector("video");
      if (!video) return;

      container.addEventListener("mouseenter", function () {
        video.muted = false;
        video.play().catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
        var overlay = container.querySelector(".leader-video-overlay");
        if (overlay) overlay.style.opacity = "0";
      });

      container.addEventListener("mouseleave", function () {
        video.muted = true;
        video.pause();
        video.currentTime = 0;
        var overlay = container.querySelector(".leader-video-overlay");
        if (overlay) overlay.style.opacity = "1";
      });
    });

    var aboutVideo = document.querySelector(".about-video");
    if (aboutVideo) {
      aboutVideo.addEventListener("mouseenter", function () {
        aboutVideo.muted = false;
        aboutVideo.play().catch(function () {
          aboutVideo.muted = true;
          aboutVideo.play().catch(function () {});
        });
      });
      aboutVideo.addEventListener("mouseleave", function () {
        aboutVideo.muted = true;
        aboutVideo.pause();
        aboutVideo.currentTime = 0;
      });
    }

    var overviewVideo = document.querySelector(".overview-video");
    if (overviewVideo) {
      overviewVideo.addEventListener("mouseenter", function () {
        overviewVideo.muted = false;
        overviewVideo.play().catch(function () {
          overviewVideo.muted = true;
          overviewVideo.play().catch(function () {});
        });
      });
      overviewVideo.addEventListener("mouseleave", function () {
        overviewVideo.muted = true;
        overviewVideo.pause();
        overviewVideo.currentTime = 0;
      });
    }

    var bgVideos = document.querySelectorAll("[data-keep-playing]");
    bgVideos.forEach(function (video) {
      video.muted = true;
      video.play().catch(function () {});
    });
  }

  function initAnimatedCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(element) {
    var target = parseInt(element.getAttribute("data-counter"), 10);
    var suffix = element.getAttribute("data-suffix") || "";
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(target * eased);
      element.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initRollingImages() {
    var containers = document.querySelectorAll(".rolling-images, .rolling-images-container");
    containers.forEach(function (container) {
      var items = container.querySelectorAll(".rolling-image-item, .rolling-image");
      if (items.length < 2) return;

      var currentIndex = 0;
      setInterval(function () {
        items[currentIndex].classList.remove("active");
        items[currentIndex].style.opacity = "0";
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add("active");
        items[currentIndex].style.opacity = "1";
      }, 3000);
    });
  }

  function initPillButtons() {
    var pillBtns = document.querySelectorAll(".pill-btn");
    pillBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (this.closest(".pill-group-multi")) return;
      });
    });
  }

  function initQuoteFormSubmit() {
    var submitBtn = document.getElementById("quote-submit-btn");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", function () {
      submitQuoteForm();
    });
  }

  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });
  }

  window.toggleMobileMenu = function () {
    var menu = document.getElementById("mobile-menu");
    var openIcon = document.getElementById("menu-icon-open");
    var closeIcon = document.getElementById("menu-icon-close");
    if (!menu) return;
    var isOpen = menu.classList.contains("open");
    if (isOpen) {
      menu.classList.remove("open");
      if (openIcon) openIcon.style.display = "";
      if (closeIcon) closeIcon.style.display = "none";
    } else {
      menu.classList.add("open");
      if (openIcon) openIcon.style.display = "none";
      if (closeIcon) closeIcon.style.display = "";
    }
  };

  window.openContactPopup = function () {
    var popup = document.getElementById("contact-popup");
    if (popup) popup.style.display = "flex";
  };

  window.closeContactPopup = function () {
    var popup = document.getElementById("contact-popup");
    if (popup) popup.style.display = "none";
  };

  window.openQuoteModal = function () {
    var modal = document.getElementById("quote-modal");
    if (modal) modal.style.display = "flex";
  };

  window.closeQuoteModal = function () {
    var modal = document.getElementById("quote-modal");
    if (modal) modal.style.display = "none";
    var formContent = document.getElementById("quote-form-content");
    var successContent = document.getElementById("quote-success");
    if (formContent) formContent.style.display = "";
    if (successContent) successContent.style.display = "none";
  };

  window.selectPill = function (groupId, btn, value) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var buttons = group.querySelectorAll(".pill-btn");
    buttons.forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    btn.setAttribute("data-value", value);
  };

  window.togglePill = function (btn) {
    btn.classList.toggle("selected");
  };

  window.submitQuoteForm = function () {
    var fullname = document.getElementById("quote-fullname");
    var email = document.getElementById("quote-email");

    if (!fullname || !fullname.value.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!email || !email.value.trim()) {
      alert("Please enter your email address.");
      return;
    }

    var submitBtn = document.getElementById("quote-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    var formData = new FormData();
    formData.append("action", "cahit_submit_quote");
    if (typeof cahitData !== "undefined" && cahitData.nonce) {
      formData.append("nonce", cahitData.nonce);
    }
    formData.append("budget", document.getElementById("quote-budget") ? document.getElementById("quote-budget").value : "");
    formData.append("nonNegotiables", document.getElementById("quote-non-negotiables") ? document.getElementById("quote-non-negotiables").value : "");
    formData.append("siteChallenges", document.getElementById("quote-site-challenges") ? document.getElementById("quote-site-challenges").value : "");
    formData.append("timeline", document.getElementById("quote-timeline") ? document.getElementById("quote-timeline").value : "");
    formData.append("deadlines", document.getElementById("quote-deadlines") ? document.getElementById("quote-deadlines").value : "");
    formData.append("decisionMaker", document.getElementById("quote-decision-maker") ? document.getElementById("quote-decision-maker").value : "");
    formData.append("fullName", fullname.value);
    formData.append("email", email.value);
    formData.append("phone", document.getElementById("quote-phone") ? document.getElementById("quote-phone").value : "");

    var ajaxUrl = (typeof cahitData !== "undefined" && cahitData.ajaxUrl) ? cahitData.ajaxUrl : "/api/ajax";

    fetch(ajaxUrl, {
      method: "POST",
      body: formData
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.success) {
          var formContent = document.getElementById("quote-form-content");
          var successContent = document.getElementById("quote-success");
          if (formContent) formContent.style.display = "none";
          if (successContent) successContent.style.display = "flex";
        } else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch(function () {
        alert("Network error. Please try again.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Submit Quote Request';
        }
      });
  };

  var arTranslations = {
    "Home": "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
    "About Us": "\u0645\u0646 \u0646\u062D\u0646",
    "Services": "\u0627\u0644\u062E\u062F\u0645\u0627\u062A",
    "Projects": "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639",
    "Clients": "\u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    "Blog": "\u0627\u0644\u0645\u062F\u0648\u0646\u0629",
    "Careers": "\u0627\u0644\u0648\u0638\u0627\u0626\u0641",
    "Contact": "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
    "Get Quote": "\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631",
    "Delivering Infrastructure": "\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062A\u0645\u064A\u0632 \u0641\u064A",
    "Excellence": "\u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629",
    "Marine & Coastal Construction Experts": "\u062E\u0628\u0631\u0627\u0621 \u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0633\u0627\u062D\u0644\u064A",
    "Schedule Consultation": "\u062D\u062C\u0632 \u0627\u0633\u062A\u0634\u0627\u0631\u0629",
    "View Portfolio": "\u0639\u0631\u0636 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639",
    "Delivering Infrastructure Excellence": "تقديم التميز في البنية التحتية",
    "Years of Industry-Leading Experience": "سنوات خبرة قيادية في الصناعة",
    "Major Infrastructure Projects Completed": "مشاريع بنية تحتية كبرى منجزة",
    "Operations Across Oman": "عمليات في جميع أنحاء عُمان",
    "Marine & Infrastructure Specialists": "متخصصون في البحرية والبنية التحتية",
    "Years Experience": "\u0633\u0646\u0648\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629",
    "Projects Completed": "\u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u0643\u062A\u0645\u0644\u0629",
    "Client Satisfaction": "\u0631\u0636\u0627 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    "Trusted by Leading Organizations": "\u0645\u0648\u062B\u0648\u0642 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u0631\u0627\u0626\u062F\u0629",
    "Cahit Trading & Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.": "\u062A\u062A\u0639\u0627\u0648\u0646 \u0634\u0631\u0643\u0629 \u0643\u0627\u0647\u064A\u062A \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u0627\u062A \u0630.\u0645.\u0645 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0648\u0627\u0644\u0645\u0637\u0648\u0631\u064A\u0646 \u0648\u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0648\u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0645\u0639\u0642\u062F\u0629 \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0639\u064F\u0645\u0627\u0646.",
    "Engineering the Foundations of Tomorrow": "\u0647\u0646\u062F\u0633\u0629 \u0623\u0633\u0633 \u0627\u0644\u063A\u062F",
    "Cahit Trading & Contracting LLC is a construction and infrastructure company operating in the Sultanate of Oman since 2009.": "\u0634\u0631\u0643\u0629 \u0643\u0627\u0647\u064A\u062A \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u0627\u062A \u0630.\u0645.\u0645 \u0647\u064A \u0634\u0631\u0643\u0629 \u0628\u0646\u0627\u0621 \u0648\u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u062A\u0639\u0645\u0644 \u0641\u064A \u0633\u0644\u0637\u0646\u0629 \u0639\u064F\u0645\u0627\u0646 \u0645\u0646\u0630 \u0639\u0627\u0645 2009.",
    "Founded by Tahir \u015Eenyurt, the company has developed into a trusted contractor delivering complex projects across marine construction, infrastructure development, earthworks, and industrial services.": "\u0623\u0633\u0633\u0647\u0627 \u0637\u0627\u0647\u0631 \u0634\u0646\u064A\u0648\u0631\u062A\u060C \u0648\u0642\u062F \u062A\u0637\u0648\u0631\u062A \u0627\u0644\u0634\u0631\u0643\u0629 \u0644\u062A\u0635\u0628\u062D \u0645\u0642\u0627\u0648\u0644\u0627\u064B \u0645\u0648\u062B\u0648\u0642\u0627\u064B \u064A\u0646\u0641\u0630 \u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u0639\u0642\u062F\u0629 \u0641\u064A \u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0648\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u062D\u0641\u0631 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629.",
    "Through a combination of engineering expertise, operational excellence, and strong client partnerships, Cahit contributes to the development of critical infrastructure across Oman.": "\u0645\u0646 \u062E\u0644\u0627\u0644 \u0627\u0644\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A \u0648\u0627\u0644\u0634\u0631\u0627\u0643\u0627\u062A \u0627\u0644\u0642\u0648\u064A\u0629 \u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060C \u062A\u0633\u0627\u0647\u0645 \u0643\u0627\u0647\u064A\u062A \u0641\u064A \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0641\u064A \u0639\u064F\u0645\u0627\u0646.",
    "Discover Our Company": "\u0627\u0643\u062A\u0634\u0641 \u0634\u0631\u0643\u062A\u0646\u0627",
    "Our Services": "خدماتنا",
    "Our diverse expertise allows us to support complex infrastructure projects across multiple sectors.": "تتيح لنا خبرتنا المتنوعة دعم مشاريع البنية التحتية المعقدة عبر قطاعات متعددة",
    "Earthworks": "أعمال الحفر والردم",
    "Bulk excavation, grading, compaction, and large-scale site preparation using modern heavy equipment.": "الحفر بالجملة والتسوية والدك وإعداد المواقع على نطاق واسع باستخدام المعدات الثقيلة الحديثة",
    "Infrastructure Development": "تطوير البنية التحتية",
    "Civil infrastructure development including utilities, industrial facilities, and integrated project delivery solutions.": "تطوير البنية التحتية المدنية بما في ذلك المرافق والمنشآت الصناعية وحلول تسليم المشاريع المتكاملة.",
    "Infrastructure projects today require innovative engineering solutions and advanced construction techniques. Cahit delivers infrastructure solutions including utilities, roads and industrial facilities.": "تتطلب مشاريع البنية التحتية اليوم حلولاً هندسية مبتكرة وتقنيات بناء متقدمة. تقدم كاهيت حلول البنية التحتية بما في ذلك المرافق والطرق والمنشآت الصناعية",
    "Marine & Coastal Construction": "البناء البحري والساحلي",
    "Design and construction of marine infrastructure including breakwaters, quay walls, revetments, dredging, and coastal protection systems.": "تصميم وبناء البنية التحتية البحرية بما في ذلك حواجز الأمواج وجدران الأرصفة والسدود والتجريف وأنظمة حماية السواحل.",
    "Cahit Trading & Contracting LLC provides specialized marine construction services including:": "تقدم شركة كاهيت للتجارة والمقاولات ذ.م.م خدمات بناء بحري متخصصة تشمل:",
    "Sea Harbors": "الموانئ البحرية",
    "Breakwaters": "حواجز الأمواج",
    "Groynes": "الحواجز الصخرية",
    "Revetments": "السدود",
    "MEP Works": "أعمال الكهرباء والميكانيكا",
    "Mechanical, electrical and plumbing systems supporting industrial facilities, infrastructure and utility projects.": "أنظمة ميكانيكية وكهربائية وسباكة تدعم المنشآت الصناعية ومشاريع البنية التحتية والمرافق.",
    "General Construction": "البناء العام",
    "Comprehensive residential, commercial, and industrial building solutions. Skilled workforce with modern equipment and proven expertise. Commitment to safety, quality, and on-time delivery. Renovation, remodeling, and project management services.": "حلول بناء شاملة للمشاريع السكنية والتجارية والصناعية. قوى عاملة ماهرة بمعدات حديثة وخبرة مثبتة. التزام بالسلامة والجودة والتسليم في الوقت المحدد. خدمات التجديد وإعادة التصميم وإدارة المشاريع.",
    "Dewatering & Shoring": "نزح المياه والتدعيم",
    "Advanced groundwater control systems and structural support solutions ensuring safe and stable construction environments.": "أنظمة متقدمة للتحكم في المياه الجوفية وحلول الدعم الهيكلي لضمان بيئات بناء آمنة ومستقرة.",
    "Learn More": "اعرف المزيد",
    "Specialists in Marine & Coastal Infrastructure": "\u0645\u062A\u062E\u0635\u0635\u0648\u0646 \u0641\u064A \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0648\u0627\u0644\u0633\u0627\u062D\u0644\u064A\u0629",
    "Cahit Trading & Contracting LLC is recognized for its expertise in the construction of marine and coastal infrastructure.": "\u062A\u064F\u0639\u0631\u0641 \u0634\u0631\u0643\u0629 \u0643\u0627\u0647\u064A\u062A \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u0627\u062A \u0630.\u0645.\u0645 \u0628\u062E\u0628\u0631\u062A\u0647\u0627 \u0641\u064A \u0628\u0646\u0627\u0621 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0648\u0627\u0644\u0633\u0627\u062D\u0644\u064A\u0629.",
    "Sea Harbors": "\u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0628\u062D\u0631\u064A\u0629",
    "Breakwaters and Groynes": "\u062D\u0648\u0627\u062C\u0632 \u0627\u0644\u0623\u0645\u0648\u0627\u062C \u0648\u0627\u0644\u062D\u0648\u0627\u062C\u0632 \u0627\u0644\u0635\u062E\u0631\u064A\u0629",
    "Coastal Protection Systems": "\u0623\u0646\u0638\u0645\u0629 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u0648\u0627\u062D\u0644",
    "Rock Armour Installation": "\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0635\u062E\u0648\u0631 \u0627\u0644\u062F\u0641\u0627\u0639\u064A\u0629",
    "Geotextile Protection": "\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062C\u064A\u0648\u062A\u0643\u0633\u062A\u0627\u064A\u0644",
    "Beach Reclamation": "\u0627\u0633\u062A\u0635\u0644\u0627\u062D \u0627\u0644\u0634\u0648\u0627\u0637\u0626",
    "Dredging": "\u0627\u0644\u062A\u062C\u0631\u064A\u0641",
    "Underwater Excavation": "\u0627\u0644\u062D\u0641\u0631 \u062A\u062D\u062A \u0627\u0644\u0645\u0627\u0621",
    "Boat Ramps and Pontoons": "\u0645\u0646\u062D\u062F\u0631\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0631\u0628 \u0648\u0627\u0644\u0639\u0648\u0627\u0645\u0627\u062A",
    "Quay Wall Construction": "\u0628\u0646\u0627\u0621 \u062C\u062F\u0631\u0627\u0646 \u0627\u0644\u0623\u0631\u0635\u0641\u0629",
    "Through advanced engineering practices and experienced teams, we deliver durable infrastructure designed for challenging marine environments.": "\u0645\u0646 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629 \u0648\u0627\u0644\u0641\u0631\u0642 \u0630\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629\u060C \u0646\u0642\u062F\u0645 \u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u0645\u062A\u064A\u0646\u0629 \u0645\u0635\u0645\u0645\u0629 \u0644\u0644\u0628\u064A\u0626\u0627\u062A \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0627\u0644\u0635\u0639\u0628\u0629.",
    "Our Projects": "\u0645\u0634\u0627\u0631\u064A\u0639\u0646\u0627",
    "Selected Projects": "مشاريع مختارة",
    "Seaport Infrastructure": "البنية التحتية للميناء البحري",
    "Marine Port Infrastructure": "البنية التحتية للميناء البحري",
    "Muscat, Oman": "مسقط، عُمان",
    "Quay wall construction and breakwater installation": "بناء الأرصفة البحرية وحواجز الأمواج",
    "Coastal Protection Systems": "أنظمة الحماية الساحلية",
    "Salalah, Oman": "صلالة، عُمان",
    "Rock armour installation and coastal defense": "تركيب الصخور الدفاعية وحماية السواحل",
    "Leadership": "القيادة",
    "Meet the professionals behind Cahit Trading & Contracting.": "تعرف على المحترفين وراء شركة كاهيت للتجارة والمقاولات.",
    "Our Commitment": "التزامنا",
    "Best Quality": "أفضل جودة",
    "We maintain the highest engineering and construction standards in every project.": "نحافظ على أعلى معايير الهندسة والبناء في كل مشروع.",
    "On-Time Delivery": "التسليم في الوقت المحدد",
    "We respect project timelines and deliver reliable execution without compromising quality.": "نحترم الجداول الزمنية للمشاريع ونقدم تنفيذاً موثوقاً دون المساس بالجودة.",
    "Experience": "الخبرة",
    "Our experienced professionals ensure efficient project delivery and operational excellence.": "يضمن محترفونا ذوو الخبرة تسليم المشاريع بكفاءة وتميز تشغيلي.",
    "Let's Build Your Next Project": "لنبنِ مشروعك القادم",
    "Whether planning marine infrastructure, coastal protection, or large-scale civil works,": "سواء كنت تخطط للبنية التحتية البحرية أو حماية السواحل أو الأعمال المدنية الكبيرة،",
    "our team is ready to support your project with reliable expertise and professional execution.": "فريقنا مستعد لدعم مشروعك بخبرة موثوقة وتنفيذ احترافي.",
    "Contact Our Team": "تواصل مع فريقنا",
    "Ready to Start Your Next Project?": "هل أنت مستعد لبدء مشروعك القادم؟",
    "Company Overview": "\u0646\u0628\u0630\u0629 \u0639\u0646 \u0627\u0644\u0634\u0631\u0643\u0629",
    "View Our Services": "\u0639\u0631\u0636 \u062E\u062F\u0645\u0627\u062A\u0646\u0627",
    "Our Mission": "\u0645\u0647\u0645\u062A\u0646\u0627",
    "Our Vision": "\u0631\u0624\u064A\u062A\u0646\u0627",
    "About Cahit Trading & Contracting": "عن شركة كاهيت للتجارة والمقاولات",
    "Contact Us": "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
    "Call Us": "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
    "Email Us": "\u0631\u0627\u0633\u0644\u0646\u0627",
    "WhatsApp": "\u0648\u0627\u062A\u0633\u0627\u0628",
    "Address": "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
    "Request a Quote": "\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631",
    "Submit Quote Request": "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631",
    "Company": "\u0627\u0644\u0634\u0631\u0643\u0629",
    "Marine & Coastal Construction": "البناء البحري والساحلي",
    "Infrastructure Development": "تطوير البنية التحتية",
    "Earthworks": "\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u062D\u0641\u0631 \u0648\u0627\u0644\u0631\u062F\u0645",
    "Dewatering & Shoring": "\u0646\u0632\u062D \u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u062A\u062F\u0639\u064A\u0645",
    "MEP Works": "\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u064A\u0643\u0627\u0646\u064A\u0643\u0627",
    "General Construction": "البناء العام",
    "Step 1 of 3": "الخطوة 1 من 3",
    "Step 2 of 3": "الخطوة 2 من 3",
    "Step 3 of 3": "الخطوة 3 من 3",
    "What type of project are you planning?": "ما نوع المشروع الذي تخطط له؟",
    "What is the primary goal of your project?": "ما هو الهدف الرئيسي لمشروعك؟",
    "Marine Construction": "بناء بحري",
    "Coastal Protection": "حماية ساحلية",
    "This helps us direct you to the right service.": "هذا يساعدنا في توجيهك إلى الخدمة المناسبة.",
    "Strengthen coastal protection": "تعزيز حماية السواحل",
    "Expand port capacity": "توسيع سعة الميناء",
    "Infrastructure development": "تطوير البنية التحتية",
    "Other": "أخرى",
    "Continue": "متابعة",
    "Cahit Assistant": "\u0645\u0633\u0627\u0639\u062F \u062C\u0627\u0647\u062A",
    "Ask us anything": "\u0627\u0633\u0623\u0644\u0646\u0627 \u0623\u064A \u0634\u064A\u0621",
    "Managing Director": "المدير العام",
    "Tahir \u015Eenyurt": "طاهر شنيورت",
    "Tahir \u015Eenyurt is a Civil Engineer with over 25 years of experience in the construction and contracting industry. He has successfully led numerous projects including marine infrastructure, road construction, industrial facilities and residential developments across Turkey and the GCC.": "طاهر شنيورت مهندس مدني يتمتع بخبرة تزيد عن 25 عاماً في صناعة البناء والمقاولات. قاد بنجاح العديد من المشاريع بما في ذلك البنية التحتية البحرية وبناء الطرق والمنشآت الصناعية والتطويرات السكنية في تركيا ودول مجلس التعاون الخليجي.",
    "As Managing Director of Cahit Trading & Contracting LLC, he leads the company's operations and strategic growth in the Omani construction sector.": "بصفته المدير العام لشركة كاهيت للتجارة والمقاولات ذ.م.م، يقود عمليات الشركة ونموها الاستراتيجي في قطاع البناء العُماني.",
    "As Managing Director of Cahit Trading & Contracting LLC, he leads the company's operations and strategic growth within Oman's construction sector.": "بصفته المدير العام لشركة كاهيت للتجارة والمقاولات ذ.م.م، يقود عمليات الشركة ونموها الاستراتيجي في قطاع البناء العُماني.",
    "Education": "التعليم",
    "License": "الترخيص",
    "Bachelor of Civil Engineering": "بكالوريوس الهندسة المدنية",
    "Bachelor of Civil Engineering \u2014 University of Middle East Technical": "بكالوريوس الهندسة المدنية \u2014 جامعة الشرق الأوسط التقنية",
    "Middle East Technical University": "جامعة الشرق الأوسط التقنية",
    "Registered Civil Engineer": "مهندس مدني مسجل",
    "Meet the professionals behind Cahit Trading & Contracting.": "تعرف على المحترفين وراء شركة كاهيت للتجارة والمقاولات.",
    "Hover to Watch": "مرر للمشاهدة",
    "Explore All Projects": "استكشاف جميع المشاريع",
    "Marine": "بحري",
    "Coastal": "بنية تحتية",
    "Infrastructure": "بنية تحتية",
    "Road Infrastructure Development": "تطوير البنية التحتية للطرق",
    "Road construction and infrastructure development": "بناء الطرق وتطوير البنية التحتية",
    "Asphalt Paving Works": "أعمال رصف الأسفلت",
    "Asphalt paving with modern equipment": "رصف الأسفلت بمعدات حديثة",
    "Underground Pipe Installation": "تركيب الأنابيب تحت الأرض",
    "Water and sewage pipe installation": "تركيب أنابيب المياه والصرف الصحي",
    "Concrete Formwork": "أعمال القوالب الخرسانية",
    "Concrete formwork and reinforcement works": "أعمال القوالب الخرسانية والتسليح",
    "Quay wall construction and breakwater installation": "بناء الأرصفة البحرية وحواجز الأمواج",
    "Rock armour installation and coastal defense": "تركيب الصخور الدفاعية وحماية السواحل",
    "Salalah, Oman": "صلالة، عُمان",
    "Oman": "عُمان",
    "Our Projects": "مشاريعنا",
    "Our Clients": "عملاؤنا",
    "Trusted by leading organizations across the Sultanate of Oman and the wider Gulf region.": "تتعاون شركة كاهيت للتجارة والمقاولات ذ.م.م مع الجهات الحكومية والمطورين والمؤسسات الصناعية لتنفيذ مشاريع البنية التحتية والبناء البحري المعقدة في جميع أنحاء عُمان.",
    "Trusted by Leading Organizations": "موثوق من قبل المؤسسات الرائدة",
    "We are proud to work with some of the most respected organizations in the region.": "تتعاون شركة كاهيت للتجارة والمقاولات ذ.م.م مع الجهات الحكومية والمطورين والمؤسسات الصناعية لتنفيذ مشاريع البنية التحتية والبناء البحري المعقدة في جميع أنحاء عُمان.",
    "Sectors We Serve": "القطاعات التي نخدمها",
    "Marine & Ports": "البحري والموانئ",
    "Infrastructure & Transport": "البنية التحتية والنقل",
    "Government & Public Sector": "الحكومة والقطاع العام",
    "Energy & Utilities": "الطاقة والمرافق",
    "Commercial & Residential": "التجاري والسكني",
    "Healthcare": "الرعاية الصحية",
    "Careers": "انضم إلى فريقنا",
    "Join our team and help build the future of Oman's infrastructure.": "ابنِ مسيرتك المهنية مع واحدة من الشركات الرائدة في مجال البناء والبنية التحتية في عُمان",
    "Work With Us": "لماذا العمل في كاهيت؟",
    "Cahit Trading & Contracting LLC offers exciting career opportunities in marine construction, infrastructure development, and engineering.": "في شركة كاهيت للتجارة والمقاولات ذ.م.م، نؤمن بأن موظفينا هم أعظم أصولنا. نوفر بيئة عمل ديناميكية حيث يلتقي التميز الهندسي بفرص النمو المهني.",
    "Team Culture": "ثقافة الفريق",
    "We foster a collaborative environment where every team member's contribution is valued and recognized.": "نعزز بيئة تعاونية حيث تُقدّر مساهمة كل عضو في الفريق.",
    "Professional Growth": "النمو المهني",
    "We invest in continuous training and development to help our employees grow their skills and advance their careers.": "نستثمر في التدريب والتطوير المستمر لمساعدة موظفينا على تنمية مهاراتهم والتقدم في حياتهم المهنية.",
    "Safety First": "السلامة أولاً",
    "We maintain the highest safety standards across all our operations, ensuring a safe workplace for everyone.": "نحافظ على أعلى معايير السلامة في جميع عملياتنا، لضمان بيئة عمل آمنة للجميع.",
    "Interested in Joining Our Team?": "هل ترغب في الانضمام إلى فريقنا؟",
    "Send your CV to our email and our HR team will review your application.": "أرسل سيرتك الذاتية إلى بريدنا الإلكتروني وسيقوم فريق الموارد البشرية بمراجعة طلبك.",
    "Send Your CV": "أرسل سيرتك الذاتية",
    "Contact Us": "اتصل بنا",
    "Call Us": "اتصل بنا",
    "Email Us": "راسلنا",
    "WhatsApp": "واتساب",
    "Head Office": "المكتب الرئيسي",
    "Address": "المكتب الرئيسي",
    "Delivering excellence across marine, infrastructure, and industrial projects throughout Oman.": "تقديم التميز عبر المشاريع البحرية والبنية التحتية والصناعية في جميع أنحاء عُمان.",
    "About Cahit Trading & Contracting": "عن شركة كاهيت للتجارة والمقاولات",
    "Cahit Trading & Contracting LLC partners with government authorities, developers, and industrial organizations to deliver complex infrastructure and marine construction projects across Oman.": "تتعاون شركة كاهيت للتجارة والمقاولات ذ.م.م مع الجهات الحكومية والمطورين والمؤسسات الصناعية لتنفيذ مشاريع البنية التحتية والبناء البحري المعقدة في جميع أنحاء عُمان.",
    "Company Overview": "نظرة عامة على الشركة",
    "Building critical infrastructure across Oman since 2009": "بناء البنية التحتية الحيوية في جميع أنحاء عُمان منذ عام 2009",
    "Cahit Trading & Contracting LLC has been operating in Oman since 2009, delivering a wide range of construction and infrastructure services.": "تعمل شركة كاهيت للتجارة والمقاولات ذ.م.م في عُمان منذ عام 2009، وتقدم مجموعة واسعة من خدمات البناء والبنية التحتية.",
    "The company has successfully participated in major projects across marine construction, infrastructure development and industrial services.": "شاركت الشركة بنجاح في مشاريع كبرى عبر البناء البحري وتطوير البنية التحتية والخدمات الصناعية.",
    "Through experienced leadership and skilled engineering teams, Cahit continues to contribute to the development of critical infrastructure throughout the region.": "من خلال القيادة ذات الخبرة والفرق الهندسية الماهرة، تواصل كاهيت المساهمة في تطوير البنية التحتية الحيوية في جميع أنحاء المنطقة.",
    "To apply our knowledge and experience in the construction industry to deliver high-quality infrastructure projects while contributing to the development of Oman.": "تطبيق معرفتنا وخبرتنا في صناعة البناء لتقديم مشاريع بنية تحتية عالية الجودة مع المساهمة في تنمية عُمان.",
    "To become a leading regional contractor recognized for excellence in marine construction, infrastructure development and industrial services.": "أن نصبح مقاولاً إقليمياً رائداً معترفاً به للتميز في البناء البحري وتطوير البنية التحتية والخدمات الصناعية.",
    "Cahit Trading & Contracting LLC is a construction and infrastructure company delivering marine, coastal, and civil engineering solutions across Oman. With experienced leadership and skilled engineering teams, we execute complex projects with reliability, precision, and the highest standards of quality and safety.": "شركة كاهيت للتجارة والمقاولات ذ.م.م هي شركة بناء وبنية تحتية تقدم حلول الهندسة البحرية والساحلية والمدنية في جميع أنحاء عُمان. مع قيادة ذات خبرة وفرق هندسية ماهرة، ننفذ مشاريع معقدة بموثوقية ودقة وأعلى معايير الجودة والسلامة.",
    "Our Services": "خدماتنا",
    "Home": "الرئيسية",
    "About Us": "من نحن",
    "P.O. Box 63, Postal Code 101": "ص.ب. 63، الرمز البريدي 101",
    "South Al Mawaleh, Muscat": "جنوب الموالح، مسقط",
    "Sultanate of Oman": "سلطنة عُمان",
    "Cahit Trading & Contracting LLC": "شركة كاهيت للتجارة والمقاولات ذ.م.م",
    "All Rights Reserved.": "جميع الحقوق محفوظة.",
    "A Solid Ground For Your Project": "أرض صلبة لمشروعك",
    "Admin": "الإدارة",
    "Admin Login": "دخول المسؤول"
  };

  var enOriginals = {};

  window.switchLang = function (lang) {
    var enBtn = document.getElementById("lang-en");
    var arBtn = document.getElementById("lang-ar");
    if (!enBtn || !arBtn) return;

    if (lang === "ar") {
      document.documentElement.classList.add("is-rtl");
      document.documentElement.removeAttribute("dir");
      document.documentElement.setAttribute("lang", "ar");
      enBtn.classList.remove("lang-btn-active");
      arBtn.classList.add("lang-btn-active");
      translateToArabic();
      swapNavbarForRtl(true);
    } else {
      document.documentElement.classList.remove("is-rtl");
      document.documentElement.removeAttribute("dir");
      document.documentElement.setAttribute("lang", "en");
      arBtn.classList.remove("lang-btn-active");
      enBtn.classList.add("lang-btn-active");
      restoreEnglish();
      swapNavbarForRtl(false);
    }
    localStorage.setItem("cahit-lang", lang);
  };

  window.swapNavbarForRtl = function(isRtl) {
    var navbarInner = document.querySelector(".navbar-inner");
    if (!navbarInner) return;
    var logo = navbarInner.querySelector(".navbar-logo");
    var navLinks = navbarInner.querySelector(".nav-links");
    var actions = navbarInner.querySelector(".navbar-actions");
    if (!logo || !actions || !navLinks) return;
    if (isRtl) {
      navbarInner.insertBefore(actions, navbarInner.firstChild);
      navbarInner.insertBefore(navLinks, logo);
      navbarInner.appendChild(logo);
    } else {
      navbarInner.insertBefore(logo, navbarInner.firstChild);
      navbarInner.insertBefore(navLinks, actions);
      navbarInner.appendChild(actions);
    }
  };

  function translateTextNode(node) {
    if (node.nodeType === 3) {
      var parent = node.parentNode;
      if (parent && parent.nodeType === 1 && parent.getAttribute("data-ar")) {
        node._enOriginal = node.textContent;
        node.textContent = parent.getAttribute("data-ar");
        return;
      }
      var text = node.textContent.trim();
      if (text && arTranslations[text]) {
        node._enOriginal = node.textContent;
        node.textContent = arTranslations[text];
      }
    } else if (node.nodeType === 1) {
      for (var i = 0; i < node.childNodes.length; i++) {
        translateTextNode(node.childNodes[i]);
      }
    }
  }

  function restoreTextNode(node) {
    if (node.nodeType === 3 && node._enOriginal !== undefined) {
      node.textContent = node._enOriginal;
      delete node._enOriginal;
    } else if (node.nodeType === 1) {
      for (var i = 0; i < node.childNodes.length; i++) {
        restoreTextNode(node.childNodes[i]);
      }
    }
  }

  var themeBase = (function() {
    var s = document.querySelector('script[src*="theme.js"]');
    if (s) {
      var src = s.getAttribute('src');
      return src.replace(/\/js\/theme\.js.*$/, '/videos/');
    }
    return '/assets/videos/';
  })();
  var arVideoMap = {
    "about": themeBase + "about-ar.mp4",
    "tahir": themeBase + "tahir-ar.mp4"
  };

  function swapLeadershipVideos(toArabic) {
    var videos = document.querySelectorAll("video[data-video-key]");
    videos.forEach(function (video) {
      var key = video.getAttribute("data-video-key");
      if (!key || !arVideoMap[key]) return;
      var source = video.querySelector("source");
      if (!source) return;
      if (toArabic) {
        if (!video._enOriginalSrc) {
          video._enOriginalSrc = source.getAttribute("src");
        }
        source.setAttribute("src", arVideoMap[key]);
        video.removeAttribute("src");
        video.load();
        video.oncanplay = function () {
          video.play().catch(function () {});
        };
      } else if (video._enOriginalSrc) {
        source.setAttribute("src", video._enOriginalSrc);
        video.removeAttribute("src");
        delete video._enOriginalSrc;
        video.load();
        video.oncanplay = function () {
          video.play().catch(function () {});
        };
      }
    });
  }

  function translateToArabic() {
    var els = document.querySelectorAll(
      ".nav-link, .mobile-nav-link, .hero-title, .hero-subtitle, .hero-counter-label, " +
      ".section-title, .section-subtitle, .section-label, .stat-label, " +
      ".service-card-title, .service-card-desc, .service-card-link, .marine-pill-text, .marine-title, .marine-subtitle, .marine-footer-text, " +
      ".leader-name, .leader-role, .leader-bio, .leader-detail-label, .leader-detail-value, .hover-label, " +
      ".commitment-card-title, .commitment-card-desc, .commitment-title, .commitment-desc, " +
      ".cta-title, .cta-subtitle, .hero-banner-title, .hero-banner-subtitle, " +
      ".footer-heading, .footer-links a, .footer-links button, .footer-tagline, .footer-copyright, .footer-desc, .footer-admin-text, .footer-contact-item p, .footer-contact-item a, " +
      ".btn, .card-title, .modal-title, .quote-modal-title, .contact-label, " +
      ".chatbot-header-title, .chatbot-header-subtitle, " +
      ".detail-label, .quote-section-label, .hero-banner-title-lg, " +
      ".funnel-title, .funnel-label, .funnel-option, .funnel-helper, .funnel-step-badge, .funnel-submit, " +
      ".project-category-badge, .project-card-title, .project-card-location, .project-card-desc, " +
      ".sector-name, .client-logo-name, .contact-label, .footer-cta-title, .footer-cta-desc, .footer-cta-btn, " +
      "h1, h2, h3, p, label, li, span[data-ar], option[data-ar]"
    );
    els.forEach(function (el) {
      el.setAttribute("data-translated", "true");
      translateTextNode(el);
    });
    ["funnel-step-1", "funnel-step-3", "funnel-step-4"].forEach(function (id) {
      var panel = document.getElementById(id);
      if (panel) panel.setAttribute("dir", "rtl");
    });
    document.querySelectorAll("[data-placeholder-ar]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-placeholder-ar");
    });
    document.querySelectorAll("[data-ar-html]").forEach(function (el) {
      if (!el.getAttribute("data-en-html")) {
        el.setAttribute("data-en-html", el.innerHTML);
      }
      el.innerHTML = el.getAttribute("data-ar-html");
      el.setAttribute("data-translated", "true");
    });
    swapLeadershipVideos(true);
  }

  function restoreEnglish() {
    var translated = document.querySelectorAll("[data-translated]");
    translated.forEach(function (el) {
      if (el.getAttribute("data-en-html")) {
        el.innerHTML = el.getAttribute("data-en-html");
        el.removeAttribute("data-en-html");
      } else {
        restoreTextNode(el);
      }
      el.removeAttribute("data-translated");
    });
    ["funnel-step-1", "funnel-step-3", "funnel-step-4"].forEach(function (id) {
      var panel = document.getElementById(id);
      if (panel) panel.removeAttribute("dir");
    });
    document.querySelectorAll("[data-placeholder-en]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-placeholder-en");
    });
    swapLeadershipVideos(false);
  }

  var funnelData = {};
  var funnelCompleted = (function() {
    var ts = localStorage.getItem('cahit-funnel-completed-ts');
    if (ts && (Date.now() - parseInt(ts, 10)) < 3600000) return true;
    localStorage.removeItem('cahit-funnel-completed-ts');
    return false;
  })();
  var funnelGlobalStep = funnelCompleted ? 99 : 0;
  var funnelInactivityTimer = null;
  var heroFunnelShown = funnelGlobalStep >= 99;

  function initLeadFunnel() {
    if (window.location.search.indexOf("disable_funnel=1") !== -1) return;
    var heroSection = document.getElementById("hero-section");
    if (!heroSection) return;

    function showHeroFunnel() {
      if (heroFunnelShown || funnelGlobalStep >= 2) return;
      heroFunnelShown = true;
      showFunnelStep(1);
      resetFunnelInactivity(1);
    }

    heroSection.addEventListener("mousemove", showHeroFunnel);
    heroSection.addEventListener("touchstart", showHeroFunnel, { passive: true });
  }

  window.showFunnelStep = showFunnelStep;
  function showFunnelStep(step) {
    for (var i = 1; i <= 4; i++) {
      var panel = document.getElementById("funnel-step-" + i);
      if (panel) panel.style.display = i === step ? "block" : "none";
    }
  }

  function resetFunnelInactivity(step) {
    clearTimeout(funnelInactivityTimer);
    var panel = document.getElementById("funnel-step-" + step);
    if (!panel) return;
    var focused = panel.querySelector("input:focus");
    if (focused) return;
    funnelInactivityTimer = setTimeout(function () {
      panel.style.display = "none";
    }, 30000);
  }

  window.selectHeroOption = function (groupId, btn) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var buttons = group.querySelectorAll(".funnel-option");
    buttons.forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    funnelData[groupId] = btn.getAttribute("data-en") || btn.textContent.trim();
    clearTimeout(funnelInactivityTimer);

    resetFunnelInactivity(1);
  };

  window.selectFunnelOption = function (groupId, btn) {
    var group = document.getElementById(groupId);
    if (!group) return;
    var buttons = group.querySelectorAll(".funnel-option");
    buttons.forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    funnelData[groupId] = btn.textContent.trim();
    clearTimeout(funnelInactivityTimer);
  };

  window.submitHeroFunnel = function () {
    var msg = document.getElementById("funnel-message");
    funnelData["message"] = msg ? msg.value.trim() : "";
    funnelGlobalStep = 2;
    showFunnelStep(0);
    var servicesSection = document.getElementById("services-section");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(function () {
      showFunnelStep(3);
    }, 800);
  };

  window.closeFunnel = function (step) {
    var panel = document.getElementById("funnel-step-" + step);
    if (panel) panel.style.display = "none";
    clearTimeout(funnelInactivityTimer);
  };

  window.submitFunnelStep = function (step) {
    if (step === 3) {
      var name = document.getElementById("funnel-name");
      var email = document.getElementById("funnel-email");
      var phone = document.getElementById("funnel-phone");
      if (!name || !name.value.trim() || !email || !email.value.trim()) {
        alert("Please fill in your name and email.");
        return;
      }
      funnelData["name"] = name.value.trim();
      funnelData["email"] = email.value.trim();
      funnelData["phone"] = phone ? phone.value.trim() : "";
      funnelData["role"] = funnelData["funnel-role"] || "";
      funnelData["decision"] = funnelData["funnel-decision"] || "";
      funnelData["time"] = funnelData["funnel-time"] || "";

      var scope = [
        "Type: " + (funnelData["funnel-project-type"] || ""),
        "Goal: " + (funnelData["funnel-primary-goal"] || ""),
        "Role: " + funnelData["role"],
        "Decision Maker: " + funnelData["decision"],
        "Preferred Time: " + funnelData["time"]
      ].join("; ");

      var formData = new FormData();
      formData.append("action", "cahit_submit_lead");
      formData.append("nonce", (typeof cahitData !== "undefined" && cahitData.nonce) || "");
      formData.append("service_type", funnelData["funnel-project-type"] || "");
      formData.append("details", scope);
      formData.append("name", funnelData["name"]);
      formData.append("email", funnelData["email"]);
      formData.append("phone", funnelData["phone"]);

      var ajaxUrl = (typeof cahitData !== "undefined" && cahitData.ajaxUrl) || "/api/ajax";
      var submitBtn = document.querySelector('[data-testid="funnel-submit-3"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submitting..."; }

      fetch(ajaxUrl, { method: "POST", body: formData })
        .then(function (res) {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then(function (data) {
          if (data.success === false) throw new Error(data.data || "Submission failed");
          funnelGlobalStep = 4;
          localStorage.setItem('cahit-funnel-completed-ts', Date.now().toString());
          showFunnelStep(0);
          var projectsSection = document.getElementById("projects-section");
          if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: "smooth" });
          }
          setTimeout(function () {
            showFunnelStep(4);
          }, 800);
        })
        .catch(function (err) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Request"; }
          alert("Something went wrong. Please try again or contact us directly at ctc@cahitcontracting.com");
        });
    }
  };

  (function initLang() {
    var saved = localStorage.getItem("cahit-lang");
    if (saved === "ar") {
      document.addEventListener("DOMContentLoaded", function () {
        window.switchLang("ar");
      });
    }
  })();
})();
