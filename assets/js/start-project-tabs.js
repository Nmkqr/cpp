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
  const WEBHOOK_URL = "https://n8n.nmkqr.org/webhook-tst/5d0e1ee1-eee5-440d-8c27-f222a04e9a4e";

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


});
