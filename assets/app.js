(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const sidebar = $('#sidebar');
  const shade = $('#shade');
  const menuButton = $('#menuBtn');

  const closeMobileMenu = () => {
    sidebar?.classList.remove('show');
    shade?.classList.remove('show');
  };

  menuButton?.addEventListener('click', () => {
    sidebar?.classList.toggle('show');
    shade?.classList.toggle('show');
  });
  shade?.addEventListener('click', closeMobileMenu);
  $$('.menu a').forEach((link) => link.addEventListener('click', closeMobileMenu));

  $$('.menu-group-title').forEach((button) => {
    button.setAttribute('aria-expanded', button.parentElement?.classList.contains('open') ? 'true' : 'false');
    button.addEventListener('click', () => {
      const group = button.closest('.menu-group');
      if (!group) return;
      const willOpen = !group.classList.contains('open');
      group.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const activeMenuItem = $('.menu-item.active');
  if (activeMenuItem) {
    activeMenuItem.closest('.menu-group')?.classList.add('open');
    requestAnimationFrame(() => activeMenuItem.scrollIntoView({ block: 'nearest' }));
  }

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  };

  $$('.copy').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.parentElement?.querySelector('code');
      if (!code) return;
      const original = button.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code.textContent || '');
        } else if (!fallbackCopy(code.textContent || '')) {
          throw new Error('Cópia não suportada');
        }
        button.textContent = 'Copiado';
      } catch (error) {
        button.textContent = 'Selecione e copie';
      }
      window.setTimeout(() => { button.textContent = original || 'Copiar'; }, 1600);
    });
  });

  $$('[data-complete]').forEach((checkbox) => {
    const key = `aso:${checkbox.dataset.complete}`;
    try { checkbox.checked = localStorage.getItem(key) === '1'; } catch (_) {}
    checkbox.addEventListener('change', () => {
      try { localStorage.setItem(key, checkbox.checked ? '1' : '0'); } catch (_) {}
    });
  });

  const themeButton = $('#themeBtn');
  try {
    if (localStorage.getItem('aso-theme') === 'dark') document.body.classList.add('dark');
  } catch (_) {}
  themeButton?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    try { localStorage.setItem('aso-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch (_) {}
  });

  const dialog = $('#searchDialog');
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  let searchIndex = [];

  fetch(`${window.ASO_BASE || '/'}search-index.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => { searchIndex = Array.isArray(data) ? data : []; })
    .catch(() => { searchIndex = []; });

  const openSearch = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    window.setTimeout(() => searchInput?.focus(), 50);
  };
  const closeSearch = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  $$('[data-open-search]').forEach((button) => button.addEventListener('click', openSearch));
  $('#closeSearch')?.addEventListener('click', closeSearch);
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeSearch();
  });

  searchInput?.addEventListener('input', () => {
    if (!searchResults) return;
    const value = searchInput.value.toLocaleLowerCase('pt-BR').trim();
    if (value.length < 2) {
      searchResults.innerHTML = '<p>Digite pelo menos dois caracteres.</p>';
      return;
    }
    const matches = searchIndex.filter((item) => `${item.title} ${item.text}`.toLocaleLowerCase('pt-BR').includes(value)).slice(0, 20);
    searchResults.innerHTML = matches.length
      ? matches.map((item) => `<a class="result" href="${item.url}"><b>${item.title}</b><br><small>${item.text}</small></a>`).join('')
      : '<p>Nenhum resultado encontrado.</p>';
  });

  let slides = [];
  let currentSlide = 0;
  const count = $('#presentCount');

  const refreshSlides = () => { slides = $$('.present-slide'); };
  const showSlide = (index) => {
    refreshSlides();
    if (!slides.length) return;
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, position) => slide.classList.toggle('active-slide', position === currentSlide));
    if (count) count.textContent = `${currentSlide + 1} / ${slides.length}`;
  };

  const enterPresentation = async () => {
    document.body.classList.add('presentation');
    showSlide(0);
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) {
      // O modo apresentação continua funcionando mesmo sem tela cheia.
    }
  };

  const exitPresentation = async () => {
    document.body.classList.remove('presentation');
    slides.forEach((slide) => slide.classList.remove('active-slide'));
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch (_) {}
  };

  $('#presentBtn')?.addEventListener('click', enterPresentation);
  $('#presentExit')?.addEventListener('click', exitPresentation);
  $('#presentPrev')?.addEventListener('click', () => showSlide(currentSlide - 1));
  $('#presentNext')?.addEventListener('click', () => showSlide(currentSlide + 1));

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('presentation')) exitPresentation();
  });

  document.addEventListener('keydown', (event) => {
    if (!document.body.classList.contains('presentation')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      showSlide(currentSlide + 1);
    } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      showSlide(currentSlide - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      refreshSlides();
      showSlide(slides.length - 1);
    } else if (event.key === 'Escape') {
      exitPresentation();
    }
  });
})();
