/* ============================================================
   BARBER FEB — script.js (ONYX BARBERS MULTI-ANGLE CAROUSEL v4.3)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------
     1. COOKIE BANNER (GDPR)
     ------------------------------------------------------------ */
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieReject = document.getElementById('cookie-reject');

  if (cookieBanner) {
    if (!localStorage.getItem('barber_feb_cookie_consent')) {
      cookieBanner.classList.remove('hidden');
    } else {
      cookieBanner.classList.add('hidden');
    }

    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        localStorage.setItem('barber_feb_cookie_consent', 'accepted');
        cookieBanner.classList.add('hidden');
      });
    }

    if (cookieReject) {
      cookieReject.addEventListener('click', () => {
        localStorage.setItem('barber_feb_cookie_consent', 'rejected');
        cookieBanner.classList.add('hidden');
      });
    }
  }

  /* ------------------------------------------------------------
     2. GALLERY CATEGORY FILTERING
     ------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ------------------------------------------------------------
     3. INTERACTIVE MULTI-ANGLE CARD SLIDERS
     ------------------------------------------------------------ */
  galleryCards.forEach(card => {
    const track = card.querySelector('.card-slider-track');
    const slides = card.querySelectorAll('.slider-slide');
    const dots = card.querySelectorAll('.slider-dots .dot');
    const prevBtn = card.querySelector('.prev-arrow');
    const nextBtn = card.querySelector('.next-arrow');
    const badge = card.querySelector('.angle-label-badge');

    let labels = [];
    try {
      labels = JSON.parse(card.getAttribute('data-labels')) || ["Frontale", "Laterale", "Posteriore"];
    } catch (e) {
      labels = ["Frontale", "Laterale", "Posteriore"];
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCardSlider(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      card.setAttribute('data-current-index', currentIndex);

      if (track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      if (badge && labels[currentIndex]) {
        badge.textContent = `ANGOLAZIONE: ${labels[currentIndex].toUpperCase()} (${currentIndex + 1}/${totalSlides})`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents opening modal when clicking arrow
        updateCardSlider(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents opening modal when clicking arrow
        updateCardSlider(currentIndex + 1);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCardSlider(idx);
      });
    });

    // Click on card body opens Modal at current angle
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('slider-arrow') || e.target.classList.contains('dot')) return;
      openLightboxModal(card, currentIndex);
    });
  });

  /* ------------------------------------------------------------
     4. LIGHTBOX MODAL WITH SLIDER NAV
     ------------------------------------------------------------ */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxAngleTabs = document.getElementById('lightbox-angle-tabs');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');

  let activeCardAngles = [];
  let activeCardLabels = [];
  let modalActiveIndex = 0;

  function openLightboxModal(card, startIndex = 0) {
    const title = card.getAttribute('data-title') || 'Taglio Barber Feb';
    try {
      activeCardAngles = JSON.parse(card.getAttribute('data-angles')) || [];
      activeCardLabels = JSON.parse(card.getAttribute('data-labels')) || ["Frontale", "Laterale", "Posteriore"];
    } catch (e) {
      activeCardAngles = [];
      activeCardLabels = ["Frontale"];
    }

    if (lightboxTitle) lightboxTitle.textContent = title;

    // Render Tabs
    if (lightboxAngleTabs) {
      lightboxAngleTabs.innerHTML = '';
      activeCardLabels.forEach((label, idx) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = `angle-btn ${idx === startIndex ? 'active' : ''}`;
        tabBtn.textContent = label;
        tabBtn.addEventListener('click', () => {
          setModalAngle(idx);
        });
        lightboxAngleTabs.appendChild(tabBtn);
      });
    }

    setModalAngle(startIndex);

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
    }
  }

  function setModalAngle(index) {
    if (!activeCardAngles.length) return;
    modalActiveIndex = (index + activeCardAngles.length) % activeCardAngles.length;

    if (lightboxImg) {
      lightboxImg.src = activeCardAngles[modalActiveIndex];
    }

    if (lightboxAngleTabs) {
      const tabBtns = lightboxAngleTabs.querySelectorAll('.angle-btn');
      tabBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === modalActiveIndex);
      });
    }
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => setModalAngle(modalActiveIndex - 1));
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => setModalAngle(modalActiveIndex + 1));
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') setModalAngle(modalActiveIndex - 1);
    if (e.key === 'ArrowRight') setModalAngle(modalActiveIndex + 1);
  });

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  }

  /* ------------------------------------------------------------
     5. LIVE SHOP STATUS INDICATOR
     ------------------------------------------------------------ */
  function updateShopStatus() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentMins = hours * 60 + mins;

    let isOpen = false;

    if (day === 1) {
      if (currentMins >= 810 && currentMins < 1200) isOpen = true;
    } else if (day === 2) {
      if ((currentMins >= 540 && currentMins < 750) || (currentMins >= 780 && currentMins < 1200)) isOpen = true;
    } else if (day >= 3 && day <= 5) {
      if (currentMins >= 540 && currentMins < 1260) isOpen = true;
    } else if (day === 6) {
      if (currentMins >= 480 && currentMins < 810) isOpen = true;
    } else {
      isOpen = false;
    }

    const liveStatus = document.getElementById('live-status');
    const statusText = document.getElementById('status-text');

    if (liveStatus && statusText) {
      if (isOpen) {
        liveStatus.className = 'status-badge status-open';
        statusText.textContent = 'APERTO ORA';
      } else {
        liveStatus.className = 'status-badge status-closed';
        statusText.textContent = 'CHIUSO ORA';
        liveStatus.style.borderColor = '#ef4444';
        liveStatus.style.color = '#ef4444';
        const dot = liveStatus.querySelector('.status-dot');
        if (dot) {
          dot.style.backgroundColor = '#ef4444';
          dot.style.boxShadow = '0 0 8px #ef4444';
        }
      }
    }
  }

  updateShopStatus();

});
