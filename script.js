/**
 * BARBER FEB — script.js
 * ============================================================
 * CONFIGURAZIONE RAPIDA — modifica solo questa sezione
 * ============================================================
 */
const BOOKING_URL = 'https://panel.takecareproject.it/go/s/cmqspx6b5000o0wmcbdl5d5um';
const INSTAGRAM_URL = 'https://instagram.com/barber_feb';

/* ============================================================
   NAVIGATION — sticky + mobile menu
   ============================================================ */
const nav = document.getElementById('nav');
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');

// Nav: diventa opaca dopo 50px di scroll
function updateNav() {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav(); // check on load

// Hamburger toggle
function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  // Focus primo link
  const firstLink = mobileMenu.querySelector('a');
  if (firstLink) firstLink.focus();
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  hamburger.focus();
}

hamburger.addEventListener('click', () => {
  if (mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// Chiudi mobile menu quando si clicca un link
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Chiudi con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    if (document.getElementById('lightbox').classList.contains('open')) closeLightbox();
  }
});

/* ============================================================
   SCROLL REVEAL — IntersectionObserver per .reveal e .sig-line
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

const sigLineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        sigLineObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.8 }
);

// Aggiunge delay progressivo agli elementi .reveal dentro lo stesso parent
document.querySelectorAll('.reveal').forEach((el, i) => {
  // Calcola delay relativo al gruppo (resetta per ogni sezione)
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const indexInGroup = Array.from(siblings).indexOf(el);
  el.style.setProperty('--reveal-delay', `${indexInGroup * 80}ms`);
  revealObserver.observe(el);
});

// Signature lines (eccetto quella nell'hero, che è animata via CSS)
document.querySelectorAll('.sig-line:not(.hero .sig-line)').forEach(line => {
  sigLineObserver.observe(line);
});

/* ============================================================
   BOOKING LINKS — inietta BOOKING_URL in tutti i link prenotazione
   ============================================================ */
document.querySelectorAll('[data-booking]').forEach(el => {
  el.href = BOOKING_URL;
});

document.querySelectorAll('[data-instagram]').forEach(el => {
  el.href = INSTAGRAM_URL;
});

/* ============================================================
   ANNO CORRENTE nel footer
   ============================================================ */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   LIGHTBOX — galleria fotografica
   ============================================================ */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxCounter = document.getElementById('lightbox-counter');

// Raccoglie tutte le immagini della galleria
const galleryItems = Array.from(document.querySelectorAll('.gallery-item img'));
let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = index;
  const img = galleryItems[index];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || `Lavoro ${index + 1}`;
  updateLightboxCounter();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  // Restituisce focus all'elemento che ha aperto il lightbox
  const currentFigure = document.querySelectorAll('.gallery-item')[currentLightboxIndex];
  if (currentFigure) currentFigure.focus();
}

function showLightboxImage(index) {
  const total = galleryItems.length;
  currentLightboxIndex = (index + total) % total;
  const img = galleryItems[currentLightboxIndex];
  
  // Fade out, cambia src, fade in
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || `Lavoro ${currentLightboxIndex + 1}`;
    lightboxImg.style.opacity = '1';
  }, 150);
  
  updateLightboxCounter();
}

function updateLightboxCounter() {
  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;
  }
}

// Transizione opacity per lightbox img
if (lightboxImg) {
  lightboxImg.style.transition = 'opacity 150ms ease';
}

// Aggiungi click listener a ogni item della galleria
document.querySelectorAll('.gallery-item').forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
  // Accessibilità: apertura con tastiera
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Apri foto ${index + 1} in ingrandimento`);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showLightboxImage(currentLightboxIndex - 1));
lightboxNext.addEventListener('click', () => showLightboxImage(currentLightboxIndex + 1));

// Click fuori dall'immagine chiude il lightbox
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Swipe su mobile
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) > 50) {
    if (delta < 0) showLightboxImage(currentLightboxIndex + 1); // swipe sx
    else showLightboxImage(currentLightboxIndex - 1); // swipe dx
  }
}, { passive: true });

// Navigazione con frecce tastiera nel lightbox
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') showLightboxImage(currentLightboxIndex - 1);
  if (e.key === 'ArrowRight') showLightboxImage(currentLightboxIndex + 1);
});

/* ============================================================
   SMOOTH SCROLL per link anchor
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  });
});
