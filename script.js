/**
 * BARBER FEB — script.js  v2.0
 * Nav · Scroll Reveal · Cookie Consent · Work Modal (multi-angolazione) · WhatsApp
 */

'use strict';

/* ============================================================
   NAV — sticky scroll
   ============================================================ */
const nav = document.getElementById('nav');

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ============================================================
   MOBILE MENU
   ============================================================ */
const hamburger       = document.getElementById('nav-hamburger');
const mobileMenu      = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileLinks     = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

function openMobile() {
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  mobileMenuClose && mobileMenuClose.focus();
}
function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  hamburger.focus();
}

hamburger && hamburger.addEventListener('click', () =>
  mobileMenu.classList.contains('open') ? closeMobile() : openMobile()
);
mobileMenuClose && mobileMenuClose.addEventListener('click', closeMobile);
mobileLinks.forEach(l => l.addEventListener('click', closeMobile));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mobileMenu && mobileMenu.classList.contains('open')) closeMobile();
    if (document.getElementById('work-modal') &&
        document.getElementById('work-modal').classList.contains('open')) closeModal();
  }
});

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
const revealObs = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el, _i) => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const idx = Array.from(siblings).indexOf(el);
  el.style.setProperty('--reveal-delay', `${idx * 80}ms`);
  revealObs.observe(el);
});

/* ============================================================
   SMOOTH SCROLL per anchor link
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav ? nav.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   ANNO FOOTER
   ============================================================ */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   COOKIE CONSENT — GDPR / D.Lgs. 196/2003
   Salva la scelta in localStorage per 6 mesi.
   ============================================================ */
const COOKIE_KEY      = 'barberfeb_cookie_consent';
const COOKIE_EXPIRY   = 180; // giorni
const banner          = document.getElementById('cookie-banner');
const btnAccept       = document.getElementById('cookie-accept');
const btnReject       = document.getElementById('cookie-reject');

function cookieConsentStored() {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    const days = (Date.now() - ts) / 86400000;
    return days < COOKIE_EXPIRY;
  } catch { return false; }
}

function storeCookieConsent(value) {
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {}
}

function hideBanner() {
  if (!banner) return;
  banner.classList.remove('visible');
  banner.setAttribute('aria-hidden', 'true');
}

function showBanner() {
  if (!banner) return;
  // Mostra dopo breve delay per UX
  setTimeout(() => {
    banner.classList.add('visible');
    banner.removeAttribute('aria-hidden');
  }, 1200);
}

if (!cookieConsentStored()) {
  showBanner();
} else {
  if (banner) banner.style.display = 'none';
}

btnAccept && btnAccept.addEventListener('click', () => {
  storeCookieConsent('accepted');
  hideBanner();
  // Qui si possono attivare analytics opzionali se presenti
});

btnReject && btnReject.addEventListener('click', () => {
  storeCookieConsent('rejected');
  hideBanner();
});

/* ============================================================
   WORK MODAL — lightbox multi-angolazione
   ============================================================ */
const modal         = document.getElementById('work-modal');
const modalInner    = modal ? modal.querySelector('.work-modal-inner') : null;
const modalClose    = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalMainImg  = document.getElementById('modal-main-img');
const modalPrev     = document.getElementById('modal-prev');
const modalNext     = document.getElementById('modal-next');
const modalAngle    = document.getElementById('modal-angle-label');
const modalCategory = document.getElementById('modal-category');
const modalTitle    = document.getElementById('modal-title');
const modalThumbs   = document.getElementById('modal-thumbs');

let currentAngles  = [];
let currentLabels  = [];
let currentAngleIdx = 0;
let lastFocusEl    = null;

function openModal(card) {
  if (!modal || !card) return;

  // Leggi dati dalla card
  try {
    currentAngles = JSON.parse(card.dataset.angles || '[]');
    currentLabels = JSON.parse(card.dataset.labels || '[]');
  } catch {
    currentAngles = [];
    currentLabels = [];
  }

  const category = card.dataset.category || '';
  const index    = card.dataset.index || '0';

  if (modalCategory) modalCategory.textContent = category;
  if (modalTitle)    modalTitle.textContent     = `Lavoro ${String(parseInt(index) + 1).padStart(2, '0')}`;

  // Popola thumbnails
  if (modalThumbs) {
    modalThumbs.innerHTML = '';
    currentAngles.forEach((src, i) => {
      const thumb = document.createElement('button');
      thumb.className = 'modal-thumb' + (i === 0 ? ' active' : '');
      thumb.setAttribute('role', 'listitem');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', currentLabels[i] || `Angolazione ${i + 1}`);
      thumb.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');

      const img = document.createElement('img');
      img.src     = src;
      img.alt     = currentLabels[i] || `Angolazione ${i + 1}`;
      img.loading = 'lazy';

      const label = document.createElement('span');
      label.className = 'modal-thumb-label';
      label.textContent = currentLabels[i] || `${i + 1}`;

      thumb.appendChild(img);
      thumb.appendChild(label);
      thumb.addEventListener('click', () => setAngle(i));
      modalThumbs.appendChild(thumb);
    });
  }

  currentAngleIdx = 0;
  setAngle(0, false); // senza transizione alla prima apertura

  // Mostra modal
  lastFocusEl = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose && modalClose.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  lastFocusEl && lastFocusEl.focus();
}

function setAngle(idx, animated = true) {
  if (!currentAngles.length) return;
  const total = currentAngles.length;
  currentAngleIdx = ((idx % total) + total) % total;

  if (modalMainImg) {
    if (animated) {
      modalMainImg.style.opacity = '0';
      setTimeout(() => {
        modalMainImg.src = currentAngles[currentAngleIdx];
        modalMainImg.alt = currentLabels[currentAngleIdx] || `Angolazione ${currentAngleIdx + 1}`;
        modalMainImg.style.opacity = '1';
      }, 180);
    } else {
      modalMainImg.src = currentAngles[currentAngleIdx];
      modalMainImg.alt = currentLabels[currentAngleIdx] || `Angolazione ${currentAngleIdx + 1}`;
      modalMainImg.style.opacity = '1';
    }
  }

  if (modalAngle) {
    modalAngle.textContent = currentLabels[currentAngleIdx] || `${currentAngleIdx + 1} / ${total}`;
  }

  // Aggiorna thumbnails
  if (modalThumbs) {
    const thumbs = modalThumbs.querySelectorAll('.modal-thumb');
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentAngleIdx);
      t.setAttribute('aria-pressed', i === currentAngleIdx ? 'true' : 'false');
    });
    // Scroll thumbnail in view
    const activeThumb = thumbs[currentAngleIdx];
    if (activeThumb) activeThumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
}

// Transizione opacity main img
if (modalMainImg) {
  modalMainImg.style.transition = 'opacity 180ms ease';
}

// Apri modal da click su card
document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('click', () => openModal(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card);
    }
  });
});

// Frecce navigazione angolazione
modalPrev     && modalPrev.addEventListener('click', () => setAngle(currentAngleIdx - 1));
modalNext     && modalNext.addEventListener('click', () => setAngle(currentAngleIdx + 1));
modalClose    && modalClose.addEventListener('click', closeModal);
modalBackdrop && modalBackdrop.addEventListener('click', closeModal);

// Tasti freccia nel modal
document.addEventListener('keydown', e => {
  if (!modal || !modal.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  setAngle(currentAngleIdx - 1);
  if (e.key === 'ArrowRight') setAngle(currentAngleIdx + 1);
});

// Swipe su touch
let touchStartX = 0;
modal && modal.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
modal && modal.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) > 50) {
    setAngle(delta < 0 ? currentAngleIdx + 1 : currentAngleIdx - 1);
  }
}, { passive: true });
