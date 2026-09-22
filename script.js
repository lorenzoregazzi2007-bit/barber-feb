/* ============================================================
   BARBER FEB — script.js (ONYX BARBERS LUXURY INTERACTION v4.0)
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
     3. MULTI-ANGLE LIGHTBOX MODAL
     ------------------------------------------------------------ */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxAngleTabs = document.getElementById('lightbox-angle-tabs');

  let currentAngles = [];
  let currentLabels = [];

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title') || 'Taglio Barber Feb';
      try {
        currentAngles = JSON.parse(card.getAttribute('data-angles')) || [];
        currentLabels = JSON.parse(card.getAttribute('data-labels')) || ["Frontale", "Laterale", "Posteriore"];
      } catch (e) {
        currentAngles = [card.querySelector('img').src];
        currentLabels = ["Frontale"];
      }

      if (lightboxTitle) lightboxTitle.textContent = title;

      // Build angle tabs
      if (lightboxAngleTabs) {
        lightboxAngleTabs.innerHTML = '';
        currentLabels.forEach((label, idx) => {
          const tabBtn = document.createElement('button');
          tabBtn.className = `angle-btn ${idx === 0 ? 'active' : ''}`;
          tabBtn.textContent = label;
          tabBtn.setAttribute('data-index', idx);
          tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.angle-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            if (lightboxImg && currentAngles[idx]) {
              lightboxImg.src = currentAngles[idx];
            }
          });
          lightboxAngleTabs.appendChild(tabBtn);
        });
      }

      // Show first angle
      if (lightboxImg && currentAngles[0]) {
        lightboxImg.src = currentAngles[0];
      }

      if (lightboxModal) {
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  }

  /* ------------------------------------------------------------
     4. TIME SLOTS INTERACTION SIMULATOR
     ------------------------------------------------------------ */
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
    });
  });

  /* ------------------------------------------------------------
     5. LIVE SHOP OPEN / CLOSED STATUS INDICATOR
     Barber Feb Hours:
     Lun: 13:30 - 20:00
     Mar: 09:00-12:30 | 13:00-20:00
     Mer, Gio, Ven: 09:00-12:30 | 12:30-21:00
     Sab: 08:00 - 13:30
     Dom: CHIUSO
     ------------------------------------------------------------ */
  function updateShopStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Dom, 1 = Lun, 2 = Mar...
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentMins = hours * 60 + mins;

    let isOpen = false;

    if (day === 1) {
      // Lun: 13:30 - 20:00 (810 - 1200 mins)
      if (currentMins >= 810 && currentMins < 1200) isOpen = true;
    } else if (day === 2) {
      // Mar: 09:00-12:30 (540-750) & 13:00-20:00 (780-1200)
      if ((currentMins >= 540 && currentMins < 750) || (currentMins >= 780 && currentMins < 1200)) isOpen = true;
    } else if (day >= 3 && day <= 5) {
      // Mer, Gio, Ven: 09:00 - 21:00 (540 - 1260 mins)
      if (currentMins >= 540 && currentMins < 1260) isOpen = true;
    } else if (day === 6) {
      // Sab: 08:00 - 13:30 (480 - 810 mins)
      if (currentMins >= 480 && currentMins < 810) isOpen = true;
    } else {
      // Dom: Chiuso
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
