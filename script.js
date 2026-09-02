'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const header = document.querySelector('body > header');

  /* =========================
     DARK MODE
  ========================= */
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    root.classList.add('dark');
  }

  const themeButton = header
    ? [...header.querySelectorAll('button')].find(button =>
        button.querySelector('svg path[d*="21 12.79"]')
      )
    : null;

  if (themeButton) {
    const icons = themeButton.querySelectorAll('svg');
    const moonIcon = icons[0];
    const sunIcon = icons[1];

    moonIcon?.classList.add('theme-icon-moon');
    sunIcon?.classList.add('theme-icon-sun');

    const updateThemeButton = () => {
      const darkModeActive = root.classList.contains('dark');

      themeButton.setAttribute(
        'aria-label',
        darkModeActive ? 'Switch to light mode' : 'Switch to dark mode'
      );

      themeButton.setAttribute('aria-pressed', String(darkModeActive));
    };

    updateThemeButton();

    themeButton.addEventListener('click', () => {
      root.classList.toggle('dark');

      localStorage.setItem(
        'theme',
        root.classList.contains('dark') ? 'dark' : 'light'
      );

      updateThemeButton();
    });
  }

  /* =========================
     HEADER + SCROLL PROGRESS
  ========================= */
  let progressBar = document.querySelector('.progress-bar');

  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-label', 'Page scroll progress');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-valuenow', '0');
    document.body.appendChild(progressBar);
  }

  const updateScrollEffects = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);

    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      scrollableHeight > 0
        ? Math.min(100, (window.scrollY / scrollableHeight) * 100)
        : 0;

    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
  };

  updateScrollEffects();

  window.addEventListener('scroll', updateScrollEffects, {
    passive: true
  });

  window.addEventListener('resize', updateScrollEffects);

  /* =========================
     MOBILE MENU
  ========================= */
  if (header) {
    const nav = header.querySelector('nav');

    const menuButton = nav
      ? [...nav.querySelectorAll('button')].find(button =>
          button.querySelector('svg path[d*="M4 6h16"]')
        )
      : null;

    const mobileMenu = header.querySelector('nav + div');

    if (mobileMenu) {
      mobileMenu.classList.add('mobile-menu');
    }

    if (menuButton && mobileMenu) {
      const icons = menuButton.querySelectorAll('svg');
      const openIcon = icons[0];
      const closeIcon = icons[1];

      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-controls', 'mobile-navigation');

      mobileMenu.id = 'mobile-navigation';

      if (closeIcon) {
        closeIcon.style.display = 'none';
      }

      const setMenuState = open => {
        mobileMenu.classList.toggle('is-open', open);

        menuButton.setAttribute('aria-expanded', String(open));

        if (openIcon) {
          openIcon.style.display = open ? 'none' : 'block';
        }

        if (closeIcon) {
          closeIcon.style.display = open ? 'block' : 'none';
        }

        document.body.style.overflow = open ? 'hidden' : '';
      };

      menuButton.addEventListener('click', () => {
        setMenuState(!mobileMenu.classList.contains('is-open'));
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          setMenuState(false);
        });
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          setMenuState(false);
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
          setMenuState(false);
        }
      });
    }
  }

  /* =========================
     SCROLL REVEAL ANIMATIONS
  ========================= */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('in', 'visible');
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add('in', 'visible');
    });
  }

  /* =========================
     ACTIVE NAVIGATION LINK
  ========================= */
  const navLinks = document.querySelectorAll('header a[href^="#"]');

  const sections = [...navLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateActiveNavigation = () => {
    let activeSection = sections[0]?.id || 'hero';
    const position = window.scrollY + 150;

    sections.forEach(section => {
      if (position >= section.offsetTop) {
        activeSection = section.id;
      }
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 40
    ) {
      activeSection = 'contact';
    }

    navLinks.forEach(link => {
      const isActive =
        link.getAttribute('href') === `#${activeSection}`;

      link.classList.toggle('on', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  updateActiveNavigation();

  window.addEventListener('scroll', updateActiveNavigation, {
    passive: true
  });

  /* =========================
     SMOOTH INTERNAL LINKS
  ========================= */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
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
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  /* =========================
     CURRENT YEAR
  ========================= */
  document.querySelectorAll('#yr, #year').forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });

  /* =========================
     PROJECT FILTERS
  ========================= */
  const projectFilters =
    document.querySelectorAll('[data-project-filter]');

  const projectItems =
    document.querySelectorAll('.project-item');

  const emptyProjectsMessage =
    document.querySelector('.project-item')?.parentElement
      ?.nextElementSibling;

  const updateProjectResults = () => {
    if (!emptyProjectsMessage) {
      return;
    }

    const visibleProjects = [...projectItems].filter(
      item => !item.classList.contains('is-hidden')
    );

    emptyProjectsMessage.style.display =
      visibleProjects.length === 0 ? 'block' : 'none';
  };

  projectFilters.forEach(button => {
    button.addEventListener('click', () => {
      const selectedCategory = button.dataset.projectFilter;

      projectFilters.forEach(filter => {
        filter.classList.toggle(
          'is-active',
          filter === button
        );
      });

      projectItems.forEach(item => {
        const shouldHide =
          selectedCategory !== 'all' &&
          item.dataset.category !== selectedCategory;

        item.classList.toggle('is-hidden', shouldHide);
      });

      updateProjectResults();
    });
  });

  updateProjectResults();

  /* =========================
     CONTACT FORM
  ========================= */
  const contactForm = document.querySelector('#contact form');

  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      alert('Contact form coming soon.');
    });
  }
});