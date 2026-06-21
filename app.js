(function () {
  'use strict';

  /* ============================================================
     CONFIG
  ============================================================ */
  const GOOGLE_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbwRs1BqbhD4cL0YjdQ9uzL4M9QAcI704-UK6y3oU4I7zwc1yjB_bO44r6rv3-L6XbHw2Q/exec';

  const SLIDER_IMAGES = [
    '/slider/1.png',
    '/slider/2.png',
    '/slider/3.png',
    '/slider/4.png',
    '/slider/5.png',
    '/slider/6.png',
  ];

  /* ============================================================
     1. FAQ ACCORDION
  ============================================================ */
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const answer = item.querySelector('.faq-answer');
      const chevron = item.querySelector('.faq-chevron');

      if (!trigger || !answer) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-open');

        // Close all
        faqItems.forEach((other) => {
          other.classList.remove('faq-open');
          const otherAnswer = other.querySelector('.faq-answer');
          const otherChevron = other.querySelector('.faq-chevron');
          if (otherAnswer) {
            otherAnswer.style.gridTemplateRows = '0fr';
            otherAnswer.style.opacity = '0';
          }
          if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('faq-open');
          answer.style.gridTemplateRows = '1fr';
          answer.style.opacity = '1';
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  /* ============================================================
     2. PRODUCT IMAGE SLIDER
     Horizontal scrollable, drag-supported, thumbnail-linked
  ============================================================ */
  function initProductSlider() {
    const track = document.getElementById('product-slider-track');
    const thumbsContainer = document.getElementById('thumbnails');

    if (!track || !thumbsContainer) return;

    // Build slides
    track.innerHTML = '';
    SLIDER_IMAGES.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className =
        'relative h-full flex-shrink-0 flex justify-center items-center transition-all duration-500 slider-item';
      slide.style.width = `${100 / SLIDER_IMAGES.length}%`;
      slide.dataset.index = i;

      const img = document.createElement('img');
      img.alt = `Product View ${i + 1}`;
      img.src = src;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.className =
        'object-contain pointer-events-none mix-blend-multiply transition-all duration-300';
      img.style.cssText =
        'position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent';
      img.onerror = () => (img.style.display = 'none');

      slide.appendChild(img);
      track.appendChild(slide);
    });

    // Build thumbnails
    thumbsContainer.innerHTML = '';
    SLIDER_IMAGES.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.className =
        'thumb-btn relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all transform hover:scale-105 snap-center bg-stone-100';
      btn.dataset.index = i;

      const img = document.createElement('img');
      img.alt = `Thumbnail ${i + 1}`;
      img.src = src;
      img.loading = 'lazy';
      img.className = 'object-cover w-full h-full';
      img.onerror = () => (img.style.display = 'none');

      btn.appendChild(img);
      thumbsContainer.appendChild(btn);

      btn.addEventListener('click', () => goToSlide(i));
    });

    // State
    let current = 0;

    function goToSlide(index) {
      if (index < 0 || index >= SLIDER_IMAGES.length) return;
      current = index;

      const slides = track.querySelectorAll('.slider-item');
      const totalSlides = SLIDER_IMAGES.length;
      // Offset so active slide is centered: move track left by (index * slideWidth)
      // Each slide is (100/totalSlides)% of track width, track width = slider width * totalSlides
      const offsetPct = (index * 100) / totalSlides;
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = `translateX(-${offsetPct}%)`;

      slides.forEach((slide, i) => {
        slide.style.transform = i === index ? 'scale(1)' : 'scale(0.92)';
        slide.style.opacity = i === index ? '1' : '0.55';
      });

      // Update thumbnails
      document.querySelectorAll('.thumb-btn').forEach((btn, i) => {
        if (i === index) {
          btn.classList.add(
            'border-[#FC909E]',
            'shadow-sm',
            'scale-110',
            'opacity-100'
          );
          btn.classList.remove('border-transparent', 'opacity-60');
        } else {
          btn.classList.remove(
            'border-[#FC909E]',
            'shadow-sm',
            'scale-110',
            'opacity-100'
          );
          btn.classList.add('border-transparent', 'opacity-60');
        }
      });
    }

    // Initial state
    goToSlide(0);

    // Touch / mouse drag on slider
    const sliderEl = document.getElementById('product-slider');
    let dragStartX = 0;
    let dragging = false;

    function onDragStart(e) {
      dragging = true;
      dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      track.style.transition = 'none';
    }

    function onDragEnd(e) {
      if (!dragging) return;
      dragging = false;
      const endX =
        e.type === 'mouseup'
          ? e.clientX
          : e.changedTouches[0]?.clientX ?? dragStartX;
      const diff = endX - dragStartX;
      if (diff < -40 && current < SLIDER_IMAGES.length - 1) goToSlide(current + 1);
      else if (diff > 40 && current > 0) goToSlide(current - 1);
      else goToSlide(current); // snap back
    }

    sliderEl.addEventListener('touchstart', onDragStart, { passive: true });
    sliderEl.addEventListener('touchend', onDragEnd);
    sliderEl.addEventListener('mousedown', onDragStart);
    window.addEventListener('mouseup', onDragEnd);
  }

  /* ============================================================
     3. VIDEO LIGHTBOX
  ============================================================ */
  function initVideoLightbox() {
    // Create lightbox element once
    const lightbox = document.createElement('div');
    lightbox.id = 'klyne-lightbox';
    lightbox.innerHTML = `
      <div id="klyne-lightbox-backdrop" style="
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;
        transition:opacity 0.3s ease;
        backdrop-filter:blur(8px);
      ">
        <button id="klyne-lightbox-close" style="
          position:absolute;top:18px;right:18px;
          width:44px;height:44px;border-radius:50%;
          background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.3);
          color:#fff;font-size:22px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.2s;z-index:10001;
        " aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div style="
          width:90%;max-width:500px;
          border-radius:20px;overflow:hidden;
          box-shadow:0 30px 60px rgba(0,0,0,0.5);
        ">
          <video id="klyne-lightbox-video"
            style="width:100%;max-height:85vh;display:block;background:#000;"
            controls playsinline>
          </video>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const backdrop = document.getElementById('klyne-lightbox-backdrop');
    const video = document.getElementById('klyne-lightbox-video');
    const closeBtn = document.getElementById('klyne-lightbox-close');

    function openLightbox(src) {
      video.src = src;
      backdrop.style.pointerEvents = 'auto';
      backdrop.style.opacity = '1';
      document.body.style.overflow = 'hidden';
      video.play().catch(() => {});
    }

    function closeLightbox() {
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
      document.body.style.overflow = '';
      video.pause();
      video.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    // Bind all video-item cards
    function bindVideoItems() {
      document.querySelectorAll('.video-item').forEach((item) => {
        const vid = item.querySelector('video');
        if (!vid) return;
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
          e.preventDefault();
          openLightbox(vid.src || vid.currentSrc);
        });

        // Hide the static play overlay since the whole card is clickable
        const overlay = item.querySelector('.video-overlay');
        if (overlay) overlay.style.pointerEvents = 'none';
      });
    }

    bindVideoItems();
  }

  /* ============================================================
     4. COUNTDOWN TIMER
  ============================================================ */
  function initCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    let total = 8 * 3600; // 8 hours in seconds

    setInterval(() => {
      total = total > 0 ? total - 1 : 8 * 3600;
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  /* ============================================================
     5. PACKAGE SELECTOR
  ============================================================ */
  function initPackageSelector() {
    const options = document.querySelectorAll('.package-option');

    options.forEach((opt, idx) => {
      opt.style.cursor = 'pointer';
      opt.addEventListener('click', () => {
        options.forEach((o, i) => {
          const dot = o.querySelector('.pkg-dot');
          if (i === idx) {
            o.classList.add('bg-[#fff7fa]');
            o.classList.remove('bg-white');
            o.style.boxShadow = '0 0 0 2px rgba(255,126,141,0.56)';
            o.style.zIndex = '10';
            if (dot) dot.style.display = 'block';
          } else {
            o.classList.remove('bg-[#fff7fa]');
            o.classList.add('bg-white');
            o.style.boxShadow = 'none';
            o.style.zIndex = '1';
            if (dot) dot.style.display = 'none';
          }
        });
      });
    });
  }

  /* ============================================================
     6. ORDER FORM — save to Google Sheets
  ============================================================ */
  function initOrderForm() {
    const buyBtn = document.querySelector('button.w-full.bg-\\[\\#FF7E8D\\]');
    if (!buyBtn) return;

    // Helper: get input by placeholder
    function getInput(placeholder) {
      return document.querySelector(`input[placeholder="${placeholder}"]`);
    }

    const fields = {
      prenom: getInput('Prénom'),
      address: getInput('Address'),
      ville: getInput('Ville'),
      telephone: getInput('N° de Telephone'),
    };

    function showFieldError(input, msg) {
      clearFieldError(input);
      input.style.borderColor = '#ef4444';
      const err = document.createElement('span');
      err.className = 'klyne-field-error';
      err.style.cssText =
        'color:#ef4444;font-size:12px;margin-top:4px;display:block;font-family:inherit';
      err.textContent = msg;
      input.after(err);
    }

    function clearFieldError(input) {
      input.style.borderColor = '';
      const prev = input.parentElement?.querySelector('.klyne-field-error');
      if (prev) prev.remove();
    }

    Object.values(fields).forEach((inp) => {
      if (inp) inp.addEventListener('input', () => clearFieldError(inp));
    });

    function validate() {
      let valid = true;
      if (!fields.prenom?.value.trim()) {
        showFieldError(fields.prenom, 'Veuillez entrer votre prénom');
        valid = false;
      }
      if (!fields.address?.value.trim()) {
        showFieldError(fields.address, 'Veuillez entrer votre adresse');
        valid = false;
      }
      if (!fields.ville?.value.trim()) {
        showFieldError(fields.ville, 'Veuillez entrer votre ville');
        valid = false;
      }
      const tel = fields.telephone?.value.trim() || '';
      if (!tel) {
        showFieldError(fields.telephone, 'Veuillez entrer votre numéro');
        valid = false;
      } else if (!/^[0-9+\s\-]{8,15}$/.test(tel)) {
        showFieldError(fields.telephone, 'Numéro invalide');
        valid = false;
      }
      return valid;
    }

    function getSelectedPackage() {
      const selected = document.querySelector('.package-option[style*="0 0 0 2px"]');
      const pkg = selected?.dataset?.package || '1';
      const offerMap = {
        1: { name: '1 Rasoir Klyne (Standard)', price: 'MAD349,00' },
        2: { name: '2 Rasoirs — Économisez 100 DH', price: 'MAD539,00' },
        3: { name: '3 Rasoirs — Économisez 200 DH', price: 'MAD759,00' },
      };
      return offerMap[pkg] || offerMap[1];
    }

    async function submitOrder() {
      if (!validate()) {
        document.querySelector('.klyne-field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const pkg = getSelectedPackage();
      const orderData = {
        timestamp: new Date().toLocaleString('fr-FR'),
        prenom: fields.prenom.value.trim(),
        address: fields.address.value.trim(),
        ville: fields.ville.value.trim(),
        telephone: fields.telephone.value.trim(),
        offer: pkg.name,
        price: pkg.price,
        status: 'Nouvelle commande',
      };

      // Show loading
      const originalHTML = buyBtn.innerHTML;
      buyBtn.disabled = true;
      buyBtn.textContent = 'Traitement en cours…';

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        showSuccessModal(orderData.prenom);
        // Reset fields
        Object.values(fields).forEach((inp) => { if (inp) inp.value = ''; });
      } catch {
        showToast('Erreur de connexion. Veuillez réessayer.', '#ef4444');
      } finally {
        buyBtn.disabled = false;
        buyBtn.innerHTML = originalHTML;
      }
    }

    buyBtn.addEventListener('click', submitOrder);

    // Also bind the secondary CTA buttons
    document.querySelectorAll('button').forEach((btn) => {
      if (/ACHETEZ|ACHETER/i.test(btn.textContent) && btn !== buyBtn) {
        btn.addEventListener('click', () => {
          fields.prenom?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
  }

  /* ============================================================
     7. SUCCESS MODAL
  ============================================================ */
  function showSuccessModal(prenom) {
    const existing = document.getElementById('klyne-success-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'klyne-success-modal';
    modal.style.cssText =
      'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;animation:kFadeIn 0.3s ease';
    modal.innerHTML = `
      <style>
        @keyframes kFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes kSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      </style>
      <div style="
        background:#fff;border-radius:24px;padding:40px 28px;max-width:380px;width:100%;
        text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.2);
        animation:kSlideUp 0.4s ease;
      ">
        <div style="width:68px;height:68px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size:22px;font-weight:700;color:#2b2b2b;margin:0 0 10px">Commande reçue !</h3>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 24px">
          Merci <strong>${prenom || ''}</strong> ! Votre commande a été enregistrée.<br/>
          Notre équipe vous contactera bientôt pour confirmer la livraison. 🎉
        </p>
        <button id="klyne-modal-close" style="
          width:100%;background:#FF7E8D;color:#fff;border:none;
          padding:14px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;
        ">Parfait, merci !</button>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('klyne-modal-close').addEventListener('click', () => modal.remove());
    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 9000);
  }

  /* ============================================================
     8. TOAST NOTIFICATION
  ============================================================ */
  function showToast(message, bg = '#22c55e') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:${bg};color:#fff;padding:13px 26px;border-radius:12px;
      font-size:14px;font-weight:500;z-index:10001;
      box-shadow:0 8px 24px rgba(0,0,0,0.2);
      animation:kFadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  /* ============================================================
     INIT ALL
  ============================================================ */
  function init() {
    initFAQ();
    initProductSlider();
    initVideoLightbox();
    initCountdown();
    initPackageSelector();
    initOrderForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();