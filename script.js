(() => {
  'use strict';

  const sections = [...document.querySelectorAll('.section')];
  const links = [...document.querySelectorAll('[data-section]')];
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const menuToggle = document.querySelector('.menu-toggle');
  const hireModal = document.getElementById('hireModal');
  const hireYes = document.getElementById('hireYes');
  const hireNo = document.getElementById('hireNo');
  const hireActions = document.getElementById('hireActions');

  const visitedSections = new Set();
  let hireModalShown = false;
  let lastFocusedElement = null;

  const VALID_SECTION_IDS = new Set(sections.map(section => section.id));

  function closeMenu() {
    sidebar?.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (!sidebar || !overlay || !menuToggle) return;
    const open = !sidebar.classList.contains('is-open');
    sidebar.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  }

  function showSection(id, { updateHistory = true, focus = false } = {}) {
    const safeId = VALID_SECTION_IDS.has(id) ? id : 'inicio';
    const target = document.getElementById(safeId);
    if (!target) return;

    sections.forEach(section => {
      const isTarget = section === target;
      section.hidden = !isTarget;
      section.classList.toggle('active', isTarget);
    });

    links.forEach(link => {
      const isActive = link.dataset.section === safeId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (updateHistory) {
      history.replaceState(null, '', `#${safeId}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();

    if (focus) {
      const heading = target.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        window.setTimeout(() => heading.focus({ preventScroll: true }), 220);
      }
    }

    if (safeId !== 'inicio') visitedSections.add(safeId);

    if (visitedSections.size >= 3 && !hireModalShown) {
      window.setTimeout(openHireModal, 420);
    }
  }

  function openHireModal() {
    if (!hireModal || hireModalShown) return;
    hireModalShown = true;
    lastFocusedElement = document.activeElement;
    hireModal.classList.add('is-visible');
    hireModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    resetNoButton();
    window.setTimeout(() => hireYes?.focus(), 80);
  }

  function closeHireModal() {
    if (!hireModal) return;
    hireModal.classList.remove('is-visible');
    hireModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus({ preventScroll: true });
  }

  function resetNoButton() {
    if (!hireNo) return;
    hireNo.style.left = '';
    hireNo.style.top = '';
    hireNo.style.transform = '';
  }

  function moveNoButton(event) {
    if (!hireNo || !hireActions) return;
    event?.preventDefault();
    event?.stopPropagation();

    const areaRect = hireActions.getBoundingClientRect();
    const buttonRect = hireNo.getBoundingClientRect();
    const padding = 6;
    const maxX = Math.max(padding, areaRect.width - buttonRect.width - padding);
    const maxY = Math.max(padding, areaRect.height - buttonRect.height - padding);
    const x = padding + Math.random() * Math.max(0, maxX - padding);
    const y = padding + Math.random() * Math.max(0, maxY - padding);

    hireNo.style.left = `${x}px`;
    hireNo.style.top = `${y}px`;
    hireNo.style.transform = 'none';
  }

  function openWhatsApp() {
    const phone = '5492604675751';
    const message = encodeURIComponent('Hola Ramiro, vi tu portafolio y me gustaría conversar con vos sobre una oportunidad laboral.');
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    closeHireModal();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      showSection(link.dataset.section, { focus: window.innerWidth <= 820 });
    });
  });

  menuToggle?.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', closeMenu);

  hireNo?.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') moveNoButton(event);
  });
  hireNo?.addEventListener('pointerdown', moveNoButton);
  hireNo?.addEventListener('click', moveNoButton);
  hireYes?.addEventListener('click', openWhatsApp);

  window.addEventListener('hashchange', () => {
    showSection(location.hash.slice(1), { updateHistory: false });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !hireModal?.classList.contains('is-visible')) {
      closeMenu();
    }

    if (event.key === 'Tab' && hireModal?.classList.contains('is-visible')) {
      const focusable = [...hireModal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  showSection(location.hash.slice(1) || 'inicio', { updateHistory: false });
})();
