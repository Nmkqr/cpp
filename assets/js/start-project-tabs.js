document.addEventListener("DOMContentLoaded", function() {
  
  // ============================================
  // 1. إدارة تبويبات المشاريع (Tabs Management)
  // ============================================
  const buttons = document.querySelectorAll(".type-btn");
  const wrapper = document.getElementById("startProjectFormWrapper");
  const panels = document.querySelectorAll("#startProjectFormWrapper .project-panel");

  if (buttons.length && wrapper && panels.length) {
    // Hide everything on load
    wrapper.classList.remove("is-visible");
    panels.forEach(p => p.classList.remove("is-visible"));

    function showPanel(targetSelector) {
      panels.forEach(p => p.classList.remove("is-visible"));
      const el = document.querySelector(targetSelector);
      if (el) el.classList.add("is-visible");
    }

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        // Active button
        buttons.forEach(b => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        // Show wrapper + selected panel
        wrapper.classList.add("is-visible");
        const target = btn.getAttribute("data-target");
        if (target) showPanel(target);
      });
    });
  }

  // ============================================
  // 2. إدارة مساحة الجناح (Booth Space Management)
  // ============================================
  const spaceRadios = document.querySelectorAll('input[name="space_secured"]');
  const boothSize = document.getElementById("boothSize");
  const widthInput = document.querySelector('[name="width"]');
  const lengthInput = document.querySelector('[name="length"]');
  const heightSelect = document.querySelector('[name="height_limit"]');

  function setSizeVisibility(isYes) {
    // show/hide wrapper
    if (boothSize) boothSize.classList.toggle("is-visible", isYes);

    // disable/enable fields
    [widthInput, lengthInput, heightSelect].forEach(field => {
      if (!field) return;
      field.disabled = !isYes;
      field.classList.toggle("opacity-50", !isYes);
      if (!isYes) field.value = "";
    });
  }

  if (spaceRadios && spaceRadios.length) {
    const checked = document.querySelector('input[name="space_secured"]:checked');
    setSizeVisibility(checked ? checked.value === "yes" : false);

    spaceRadios.forEach(r => {
      r.addEventListener("change", () => {
        setSizeVisibility(r.value === "yes");
      });
    });
  }

  // ============================================
  // 3. عناصر الاختيار المخصصة (Custom Dropdowns)
  // ============================================
  const proSelects = document.querySelectorAll(".pro-select");

  function closeAllProSelects(except) {
    proSelects.forEach(s => {
      if (s !== except) s.classList.remove("is-open");
    });
  }

  if (proSelects.length) {
    proSelects.forEach((wrap) => {
      const btn = wrap.querySelector(".pro-select__btn");
      const text = wrap.querySelector(".pro-select__text");
      const hidden = wrap.querySelector('input[type="hidden"]');
      const menu = wrap.querySelector(".pro-select__menu");
      const opts = wrap.querySelectorAll(".pro-select__opt");

      if (!btn || !text || !hidden || !menu || !opts.length) return;

      // فتح/إغلاق
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrap.classList.contains("is-open");
        closeAllProSelects(wrap);
        wrap.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", (!isOpen).toString());
      });

      // اختيار
      opts.forEach((opt) => {
        opt.addEventListener("click", () => {
          opts.forEach(o => o.classList.remove("is-active"));
          opt.classList.add("is-active");

          text.textContent = opt.textContent;
          hidden.value = opt.dataset.value || "";

          wrap.classList.add("has-value");
          wrap.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
        });
      });
    });

    // إغلاق عند الضغط خارج
    document.addEventListener("click", () => closeAllProSelects());

    // إغلاق عند ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllProSelects();
    });
  }

  // ============================================
  // 4. إرسال النماذج إلى n8n (Form Submission to n8n)
  // ============================================
  const WEBHOOK_URL = "https://n8n.nmkqr.org/webhook/5d0e1ee1-eee5-440d-8c27-f222a04e9a4e";

  function showToast(msg, ok = true) {
    let el = document.getElementById("cp-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "cp-toast";
      el.style.cssText = `
        position:fixed;left:16px;bottom:16px;z-index:999999;
        max-width:420px;padding:14px 16px;border-radius:12px;
        color:#fff;font-weight:700;line-height:1.6;
        box-shadow:0 10px 30px rgba(0,0,0,.2);
        opacity:0;transform:translateY(8px);
        transition:.2s ease; direction:rtl;
      `;
      document.body.appendChild(el);
    }
    el.style.background = ok ? "#0f9d58" : "#cb0b0d";
    el.textContent = msg;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
    }, 3200);
  }

  function formDataToObject(form) {
    const fd = new FormData(form);
    const obj = {};
    const services = [];

    for (const [k, v] of fd.entries()) {
      if (k === "services") { 
        services.push(v); 
        continue; 
      }
      if (obj[k] !== undefined) {
        if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
        obj[k].push(v);
      } else {
        obj[k] = v;
      }
    }
    if (services.length) obj.services = services;
    return obj;
  }

  async function submitToN8N(form, formType) {
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn ? btn.textContent : "";
    if (btn) { 
      btn.disabled = true; 
      btn.textContent = "جاري الإرسال..."; 
      btn.style.opacity = "0.8"; 
    }

    try {
      const payload = formDataToObject(form);
      payload.form_type = formType;
      payload.page_url = location.href;
      payload.submitted_at = new Date().toISOString();

      if (payload.space_secured !== "yes") {
        delete payload.length;
        delete payload.width;
      }

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "فشل الإرسال");
      }

      showToast("تم إرسال طلبك بنجاح ✅", true);
      form.reset();
      
      // إعادة تعيين عناصر الاختيار المخصصة
      proSelects.forEach(wrap => {
        const text = wrap.querySelector(".pro-select__text");
        const hidden = wrap.querySelector('input[type="hidden"]');
        const opts = wrap.querySelectorAll(".pro-select__opt");
        
        if (text) text.textContent = text.dataset.placeholder || "";
        if (hidden) hidden.value = "";
        opts.forEach(o => o.classList.remove("is-active"));
        wrap.classList.remove("has-value");
      });
      
      // إعادة إخفاء حقل القياس
      if (boothSize) {
        boothSize.classList.remove("is-visible");
        setSizeVisibility(false);
      }
      
    } catch (e) {
      console.error(e);
      showToast("صار خطأ أثناء الإرسال ❌", false);
    } finally {
      if (btn) { 
        btn.disabled = false; 
        btn.textContent = oldText || "إرسال الطلب"; 
        btn.style.opacity = "1"; 
      }
    }
  }

  function bindForm(id, type) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      submitToN8N(form, type);
    });
  }

  bindForm("exhibitForm", "exhibit");
  bindForm("installForm", "install");
  bindForm("eventForm", "event");
  bindForm("otherForm", "other");

  // ============================================
  // 5. وظائف القالب الرئيسية (Template Functions)
  // ============================================
  (function() {
    "use strict";

    /**
     * Apply .scrolled class to the body as the page is scrolled down
     */
    function toggleScrolled() {
      const selectBody = document.querySelector('body');
      const selectHeader = document.querySelector('#header');
      if (!selectHeader.classList.contains('scroll-up-sticky') && 
          !selectHeader.classList.contains('sticky-top') && 
          !selectHeader.classList.contains('fixed-top')) return;
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
      if (mobileNavToggleBtn) {
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
      }
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
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 600,
          easing: 'ease-in-out',
          once: true,
          mirror: false
        });
      }
    }
    window.addEventListener('load', aosInit);

    /**
     * Initiate Pure Counter
     */
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }

    /**
     * Initiate glightbox
     */
    if (typeof GLightbox !== 'undefined') {
      const glightbox = GLightbox({
        selector: '.glightbox'
      });
    }

    /**
     * Init swiper sliders (BootstrapMade default)
     */
    function initSwiper() {
      if (typeof Swiper === 'undefined') return;
      
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
     * Team Slider Swiper (Custom)
     */
    function initTeamSwiper() {
      if (typeof Swiper === 'undefined') return;
      
      const el = document.querySelector('.team-slider.swiper') || document.querySelector('.team-slider');
      if (!el) return;

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
          0:    { slidesPerView: 1, spaceBetween: 14 },
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

    /**
     * Project Cards: Slideshow + Video + Tap-Zoom (Mobile)
     */
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
    })();
  })();

});
