document.addEventListener("DOMContentLoaded", () => {
  // ===== Tabs (Project Type) =====
  const buttons = document.querySelectorAll(".type-btn");
  const wrapper = document.getElementById("startProjectFormWrapper");
  const panels = document.querySelectorAll("#startProjectFormWrapper .project-panel");

  if (buttons.length && wrapper && panels.length) {
    // Hide everything on load (مثل Condit)
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

        // Scroll
        wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ===== Booth Space: show size only if "yes" =====
  const spaceSelect = document.querySelector('[name="space_secured"]');
  const boothSize = document.getElementById("boothSize");

  // لو عندك radio بدل select:
  const spaceRadios = document.querySelectorAll('input[name="space_secured"]');

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

  // Case A: SELECT
  if (spaceSelect) {
    const isYes = spaceSelect.value === "yes";
    setSizeVisibility(isYes);

    spaceSelect.addEventListener("change", () => {
      setSizeVisibility(spaceSelect.value === "yes");
    });
  }

  // Case B: RADIO
  if (spaceRadios && spaceRadios.length) {
    const checked = document.querySelector('input[name="space_secured"]:checked');
    setSizeVisibility(checked ? checked.value === "yes" : false);

    spaceRadios.forEach(r => {
      r.addEventListener("change", () => {
        setSizeVisibility(r.value === "yes");
      });
    });
  
  }
  // ===== Pro Select (Custom Dropdowns) =====
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



});
