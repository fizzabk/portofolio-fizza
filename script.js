const siteNav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const revealItems = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('section[id], article[id]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollTicking = false;

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${(index % 4) * 85}ms`);
});

function toggleScrolledState() {
  if (!siteNav) {
    return;
  }

  siteNav.classList.toggle('is-scrolled', window.scrollY > 24);
}

if (siteNav) {
  toggleScrolledState();
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) {
        return;
      }

      scrollTicking = true;

      window.requestAnimationFrame(() => {
        toggleScrolledState();
        scrollTicking = false;
      });
    },
    { passive: true }
  );
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
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
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });

    if (siteNav && siteNav.classList.contains('is-open')) {
      siteNav.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (!siteNav) {
      return;
    }

    siteNav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
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
      threshold: 0.18,
      rootMargin: '0px 0px -48px 0px'
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visibleEntry.target.id}`);
      });
    },
    {
      threshold: [0.15, 0.35, 0.55],
      rootMargin: '-36% 0px -44% 0px'
    }
  );

  sections.forEach((section) => activeObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
