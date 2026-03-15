const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const revealItems = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('section[id]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isTicking = false;

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
});

function updateHeaderState() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle('is-scrolled', window.scrollY > 18);
}

updateHeaderState();

window.addEventListener(
  'scroll',
  () => {
    if (isTicking) {
      return;
    }

    isTicking = true;

    window.requestAnimationFrame(() => {
      updateHeaderState();
      isTicking = false;
    });
  },
  { passive: true }
);

if (navToggle && siteHeader) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');

    if (!targetId || targetId === '#') {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });

    if (siteHeader?.classList.contains('is-open')) {
      siteHeader.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -48px 0px'
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleSection) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visibleSection.target.id}`);
      });
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: '-35% 0px -45% 0px'
    }
  );

  sections.forEach((section) => activeObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
