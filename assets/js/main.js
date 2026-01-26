/**
* Template Name: iConstruction
* Template URL: https://bootstrapmade.com/iconstruction-bootstrap-construction-template/
* Updated: Jul 27 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders (BootstrapMade default)
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }
  window.addEventListener("load", initSwiper);

  /**
   * ✅ Team Slider Swiper (Custom)
   * - Destroy previous instance
   * - Autoplay + pause on hover
   * - Breakpoints: mobile 1 slide without side peek
   */
  function initTeamSwiper() {
    const el = document.querySelector('.team-slider.swiper') || document.querySelector('.team-slider');
    if (!el || typeof Swiper === 'undefined') return;

    if (el.swiper) el.swiper.destroy(true, true);

    new Swiper(el, {
      loop: true,
      speed: 700,
      spaceBetween: 24,

      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },

      navigation: {
        nextEl: '.team-next',
        prevEl: '.team-prev'
      },

      pagination: {
        el: '.team-pagination',
        clickable: true
      },

      breakpoints: {
        0:    { slidesPerView: 1, spaceBetween: 14 },  // ✅ الجوال بدون طرف ظاهر
        768:  { slidesPerView: 2, spaceBetween: 18 },
        1200: { slidesPerView: 3, spaceBetween: 24 }
      }
    });
  }
  window.addEventListener('load', initTeamSwiper);

  /**
   * FAQ / Process Accordion (one open at a time)
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const container = item.closest('.faq-container');

      const isOpen = item.classList.contains('faq-active');
      if (isOpen) {
        item.classList.remove('faq-active');
        return;
      }

      container.querySelectorAll('.faq-item.faq-active').forEach((openItem) => {
        openItem.classList.remove('faq-active');
      });

      item.classList.add('faq-active');
    });
  });

  /* ==============================
     Project Cards: Slideshow + Video + Tap-Zoom (Mobile)
  ============================== */
  (function () {

    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    const preloadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve();
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

    const stateMap = new WeakMap();

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const st = stateMap.get(card);
        if (!st) return;

        if (entry.isIntersecting) {
          if (!st.isPlayingVideo) st.start();
        } else {
          st.stop();
        }
      });
    }, { threshold: 0.25 });

    cards.forEach((card) => {
      const wrapper = card.querySelector('.video-wrapper');
      if (!wrapper) return;

      const video = wrapper.querySelector('video');
      const playBtn = wrapper.querySelector('.video-play-btn');

      const slideshow = card.querySelector('.project-slideshow');
      const listWrap = card.querySelector('.project-slides');

      let sources = [];
      let slotA, slotB;
      let idx = 0;
      let showingA = true;
      let timer = null;
      let isPlayingVideo = false;

      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
      }

      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      const start = () => {
        if (!slideshow || sources.length <= 1) return;
        if (timer) return;
        const interval = Number(slideshow.getAttribute('data-interval') || 4500);
        timer = setInterval(next, interval);
      };

      const next = async () => {
        const nextIdx = (idx + 1) % sources.length;
        const nextSrc = sources[nextIdx];

        await preloadImage(nextSrc);

        const show = showingA ? slotB : slotA;
        const hide = showingA ? slotA : slotB;

        show.src = nextSrc;

        requestAnimationFrame(() => {
          show.classList.add('is-visible');
          hide.classList.remove('is-visible');
        });

        idx = nextIdx;
        showingA = !showingA;
      };

      if (slideshow && listWrap) {
        sources = Array.from(listWrap.querySelectorAll('[data-src]'))
          .map(el => el.getAttribute('data-src'))
          .filter(Boolean);

        slotA = slideshow.querySelector('.slot-a');
        slotB = slideshow.querySelector('.slot-b');

        if (sources.length && slotA && slotB) {
          const fadeMs = Number(slideshow.getAttribute('data-fade') || 1800);
          slotA.style.transitionDuration = fadeMs + 'ms';
          slotB.style.transitionDuration = fadeMs + 'ms';

          slotA.src = sources[0];
          slotA.classList.add('is-visible');
          slotB.classList.remove('is-visible');

          if (sources[1]) preloadImage(sources[1]);
        }
      }

      const st = {
        start,
        stop,
        get isPlayingVideo() { return isPlayingVideo; },
        set isPlayingVideo(v) { isPlayingVideo = v; },
      };
      stateMap.set(card, st);
      io.observe(card);

      if (!video || !playBtn) return;

      let seeking = false;
      video.addEventListener('seeking', () => { seeking = true; });
      video.addEventListener('seeked', () => { seeking = false; });

      playBtn.addEventListener('click', () => {
        document.querySelectorAll('.video-wrapper').forEach(w => {
          const v = w.querySelector('video');
          if (!v || v === video) return;
          v.pause();
          v.removeAttribute('controls');
          w.classList.remove('playing');
        });

        st.stop();

        wrapper.classList.add('playing');
        video.muted = true;
        video.defaultMuted = true;

        st.isPlayingVideo = true;
        video.setAttribute('controls', 'controls');
        video.play().catch(() => {});
      });

      const restore = () => {
        wrapper.classList.remove('playing');
        video.removeAttribute('controls');
        st.isPlayingVideo = false;

        const rect = card.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inView) st.start();
      };

      video.addEventListener('ended', restore);

      video.addEventListener('pause', () => {
        if (seeking) return;
        if (video.ended) return;
      });
    });

    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!isTouch) return;

    const clearAll = () => {
      document.querySelectorAll('.project-card.tap-zoom')
        .forEach(c => c.classList.remove('tap-zoom'));
    };

    let scrolling = false;
    window.addEventListener('scroll', () => {
      scrolling = true;
      clearAll();
      clearTimeout(window.__tapZoomScrollT);
      window.__tapZoomScrollT = setTimeout(() => scrolling = false, 120);
    }, { passive: true });

    document.addEventListener('pointerdown', (e) => {
      if (scrolling) return;
      if (e.target.closest('button, a, input, textarea, select, label')) return;

      const card = e.target.closest('.project-card');
      if (!card) {
        clearAll();
        return;
      }

      const wrapper = card.querySelector('.video-wrapper');
      if (wrapper && wrapper.classList.contains('playing')) return;

      document.querySelectorAll('.project-card.tap-zoom').forEach(c => {
        if (c !== card) c.classList.remove('tap-zoom');
      });

      card.classList.toggle('tap-zoom');
    }, { passive: true });

    // ❌ حذفنا/ما نحتاج هنا أي new Swiper للـ team
    // لأننا فعلناه فوق في initTeamSwiper()

  })();

})();
