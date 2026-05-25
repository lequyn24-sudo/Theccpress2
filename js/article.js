/* TheCCPress — Article & Shared Page JS */

// ── Theme (same as main) ──
const _themeToggle = document.getElementById('themeToggle');
if (_themeToggle) {
  const _iconDark  = _themeToggle.querySelector('.theme-icon--dark');
  const _iconLight = _themeToggle.querySelector('.theme-icon--light');
  const _html      = document.documentElement;

  const _saved = localStorage.getItem('ccp-theme') || 'dark';
  _applyTheme(_saved);

  _themeToggle.addEventListener('click', () => {
    const next = _html.dataset.theme === 'light' ? 'dark' : 'light';
    _applyTheme(next);
    localStorage.setItem('ccp-theme', next);
  });

  function _applyTheme(t) {
    _html.dataset.theme = t;
    if (t === 'light') {
      _iconDark.style.display  = 'none';
      _iconLight.style.display = '';
    } else {
      _iconDark.style.display  = '';
      _iconLight.style.display = 'none';
    }
  }
}

// ── Reading Progress Bar ──
const progressBar = document.getElementById('readingProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

// ── Search Overlay ──
const searchOverlay = document.getElementById('searchOverlay');
const searchToggle  = document.getElementById('searchToggle');
const searchClose   = document.getElementById('searchClose');
const searchInput   = document.getElementById('searchInput');

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.add('is-open');
  searchOverlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => searchInput && searchInput.focus(), 50);
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove('is-open');
  searchOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (searchToggle) searchToggle.addEventListener('click', openSearch);
if (searchClose)  searchClose.addEventListener('click', closeSearch);

if (searchOverlay) {
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSearch();
});

// Trending tag → fills search input
document.querySelectorAll('.trending-tag').forEach((tag) => {
  tag.addEventListener('click', () => {
    if (searchInput) searchInput.value = tag.textContent;
    searchInput && searchInput.focus();
  });
});

// ── Power Map Modal ──
const powerMapModal = document.getElementById('powerMapModal');
const fullPowerMapBtn = document.getElementById('fullPowerMapBtn');
const powerMapClose = document.getElementById('powerMapClose');

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (fullPowerMapBtn) fullPowerMapBtn.addEventListener('click', () => openModal(powerMapModal));
if (powerMapClose)   powerMapClose.addEventListener('click',   () => closeModal(powerMapModal));

if (powerMapModal) {
  powerMapModal.addEventListener('click', (e) => {
    if (e.target === powerMapModal) closeModal(powerMapModal);
  });
}

// ── Why Stage Popup ──
const whyStageBtn  = document.getElementById('whyStageBtn');
const whyStagePop  = document.getElementById('whyStagePop');
const whyStageClose = document.getElementById('whyStageClose');

if (whyStageBtn) {
  whyStageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    whyStagePop.classList.toggle('is-open');
  });
}

if (whyStageClose) {
  whyStageClose.addEventListener('click', () => whyStagePop.classList.remove('is-open'));
}

document.addEventListener('click', () => {
  if (whyStagePop) whyStagePop.classList.remove('is-open');
});

// ── TOC Active State ──
const tocLinks = document.querySelectorAll('.toc-link');
const articleHeadings = document.querySelectorAll('.article-h2[id]');

if (tocLinks.length && articleHeadings.length) {
  const tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach((l) => l.classList.toggle('toc-active', l.getAttribute('href') === '#' + id));
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  articleHeadings.forEach((h) => tocObserver.observe(h));
}

// ── Copy Link ──
const copyLinkBtn = document.getElementById('copyLink');
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const orig = copyLinkBtn.innerHTML;
      copyLinkBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      copyLinkBtn.style.background = 'rgba(63,185,80,0.2)';
      setTimeout(() => {
        copyLinkBtn.innerHTML = orig;
        copyLinkBtn.style.background = '';
      }, 2000);
    });
  });
}

// ── Power Bar Animate ──
const powerObs2 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.power-bar').forEach((bar) => {
      const pct = getComputedStyle(bar).getPropertyValue('--pct').trim() || bar.style.getPropertyValue('--pct');
      bar.style.setProperty('--pct', '0%');
      requestAnimationFrame(() => setTimeout(() => bar.style.setProperty('--pct', pct), 60));
    });
    powerObs2.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.widget-power-map').forEach((el) => powerObs2.observe(el));

// ── Listing Pagination ──
(function() {
  const grid = document.querySelector('.listing-grid');
  const pageBtns = document.querySelectorAll('.page-btn');
  if (!grid || !pageBtns.length) return;

  const cards = Array.from(grid.querySelectorAll('.listing-card'));
  const perPage = 3;
  const totalPages = Math.ceil(cards.length / perPage);
  let currentPage = 1;

  function showPage(page) {
    currentPage = page;
    cards.forEach((card, i) => {
      card.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
    });
    pageBtns.forEach(btn => {
      const num = parseInt(btn.textContent);
      btn.classList.toggle('active', num === page);
    });
  }

  pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      if (text === '→' || text === '>') {
        if (currentPage < totalPages) showPage(currentPage + 1);
      } else if (text === '←' || text === '<') {
        if (currentPage > 1) showPage(currentPage - 1);
      } else {
        const num = parseInt(text);
        if (!isNaN(num) && num >= 1 && num <= totalPages) showPage(num);
      }
    });
  });

  // Initialize
  showPage(1);
}());

// ── Newsletter / Follow Forms ──
document.querySelectorAll('.newsletter-form, .follow-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn   = form.querySelector('button[type="submit"]');
    if (!input || !input.value.includes('@')) {
      input.style.borderColor = 'var(--red)';
      setTimeout(() => (input.style.borderColor = ''), 2000);
      return;
    }
    const original = btn.textContent;
    btn.textContent = '✓ Done';
    btn.style.background = 'var(--green)';
    input.value = '';
    setTimeout(() => { btn.textContent = original; btn.style.background = ''; }, 3000);
  });
});

// ── Nav Dropdown ──
(function () {
  const navData = [
    { label: 'Stories', subs: [
        { label: 'Market Drama',      path: 'stories/market-drama' },
        { label: 'Company Sagas',     path: 'stories/company-sagas' },
        { label: 'Project Rise & Fall', path: 'stories/project-rise-fall' },
    ]},
    { label: 'Conflicts', subs: [
        { label: 'Regulation', path: 'conflicts/regulation' },
        { label: 'Company',    path: 'conflicts/company' },
        { label: 'Ideology',   path: 'conflicts/ideology' },
    ]},
    { label: 'People', subs: [
        { label: 'Founders',     path: 'people/founders' },
        { label: 'Influencers',  path: 'people/influencers' },
        { label: 'Institutions', path: 'people/institutions' },
    ]},
    { label: 'Power', subs: [
        { label: 'Exchanges',  path: 'power/exchanges' },
        { label: 'VCs',        path: 'power/vcs' },
        { label: 'Regulators', path: 'power/regulators' },
    ]},
    { label: 'Investigations', subs: [
        { label: 'Fraud',        path: 'investigations/fraud' },
        { label: 'Collapse',     path: 'investigations/collapse' },
        { label: 'Controversy',  path: 'investigations/controversy' },
    ]},
    { label: 'Sponsored', subs: [
        { label: 'CMC', path: 'cmc' },
    ]},
  ];

  const firstLink = document.querySelector('.nav-list .nav-link');
  const prefix = (firstLink && firstLink.getAttribute('href').startsWith('../')) ? '../' : '';

  document.querySelectorAll('.nav-list > li').forEach((li) => {
    const link = li.querySelector('.nav-link');
    if (!link) return;
    const data = navData.find((d) => d.label === link.textContent.trim());
    if (!data) return;

    li.classList.add('nav-item--has-dropdown');
    link.insertAdjacentHTML('beforeend', '<span class="nav-arrow">▾</span>');

    const ul = document.createElement('ul');
    ul.className = 'nav-dropdown';
    data.subs.forEach((sub) => {
      const li2 = document.createElement('li');
      const a   = document.createElement('a');
      a.href      = prefix + sub.path + '.html';
      a.className = 'dropdown-link';
      a.textContent = sub.label;
      li2.appendChild(a);
      ul.appendChild(li2);
    });
    li.appendChild(ul);
  });
}());
