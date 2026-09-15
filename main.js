/* ══════════════════════════════════════════════════════
  CERRAJERÍA SBJ — main.js
  Módulos: header scroll · nav toggle · active links · scroll reveal
   ══════════════════════════════════════════════════════ */

'use strict';

/* ── Header: agrega clase al hacer scroll ───────────── */
const header = document.getElementById('header');

function handleHeaderScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll(); // estado inicial


/* ── Nav: menú hamburguesa en móvil ─────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});

// Cierra el menú al hacer clic en un enlace
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});


/* ── Nav: resalta el enlace de la sección activa ────── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(sec => sectionObserver.observe(sec));


/* ── Scroll reveal: anima elementos al entrar ────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .contact-item, .social-link, .section-header'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger: pequeño retraso por posición en el DOM
      const delay = Array.from(revealEls).indexOf(entry.target) % 4 * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ── Smooth scroll: anclas con offset del header ─────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Galería de imágenes con drag / swipe ─────────────────────── */
document.querySelectorAll('.service-card--gallery').forEach(card => {
  const track   = card.querySelector('.gallery-track');
  const images  = card.querySelectorAll('.gallery-img');
  const dots    = card.querySelectorAll('.gallery-dots .dot');
  let current   = 0;
  let interval  = null;
  let isDragging = false;
  let startX     = 0;
  let currentX   = 0;

  function showSlide(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    images.forEach((img, i) => img.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    current = index;
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function prevSlide() {
    showSlide(current - 1);
  }

  // ===== Dots =====
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      showSlide(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  // ===== Autoplay =====
  function startAutoplay() {
    stopAutoplay();
    interval = setInterval(nextSlide, 2000);
  }

  function stopAutoplay() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  // ===== Drag / Swipe =====
  function onStart(e) {
    isDragging = true;
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    currentX = startX;
    stopAutoplay();
    track.style.cursor = 'grabbing';
  }

  function onMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';

    const diff = startX - currentX;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();   // arrastrar hacia la izquierda → siguiente
    } else if (diff < -threshold) {
      prevSlide();   // arrastrar hacia la derecha → anterior
    }

    startAutoplay();
  }

  // Mouse
  track.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  // Dedo (móvil)
  track.addEventListener('touchstart', onStart, { passive: true });
  track.addEventListener('touchmove', onMove, { passive: false });
  track.addEventListener('touchend', onEnd);

  // Pausar autoplay al pasar el mouse
  card.addEventListener('mouseenter', stopAutoplay);
  card.addEventListener('mouseleave', startAutoplay);

  track.style.cursor = 'grab';
  track.style.userSelect = 'none';

  startAutoplay();
});