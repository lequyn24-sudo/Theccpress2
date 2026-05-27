/* TheCCPress — Main JS */

// ── Theme Toggle ──
const themeToggle  = document.getElementById('themeToggle');
const iconDark     = themeToggle.querySelector('.theme-icon--dark');
const iconLight    = themeToggle.querySelector('.theme-icon--light');
const html         = document.documentElement;

const savedTheme = localStorage.getItem('ccp-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('ccp-theme', next);
});

function applyTheme(theme) {
  html.dataset.theme = theme;
  if (theme === 'light') {
    iconDark.style.display  = 'none';
    iconLight.style.display = '';
    themeToggle.title = 'Switch to dark mode';
  } else {
    iconDark.style.display  = '';
    iconLight.style.display = 'none';
    themeToggle.title = 'Switch to light mode';
  }
}

// ── Search Overlay (homepage) ──
const _searchOverlay = document.getElementById('searchOverlay');
const _searchToggle  = document.getElementById('searchToggle');
const _searchClose   = document.getElementById('searchClose');
const _searchInput   = document.getElementById('searchInput');

function openSearch() {
  if (!_searchOverlay) return;
  _searchOverlay.classList.add('is-open');
  _searchOverlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => _searchInput && _searchInput.focus(), 50);
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  if (!_searchOverlay) return;
  _searchOverlay.classList.remove('is-open');
  _searchOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (_searchToggle) _searchToggle.addEventListener('click', openSearch);
if (_searchClose)  _searchClose.addEventListener('click', closeSearch);
if (_searchOverlay) _searchOverlay.addEventListener('click', (e) => { if (e.target === _searchOverlay) closeSearch(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });
document.querySelectorAll('.trending-tag').forEach((tag) => {
  tag.addEventListener('click', () => { if (_searchInput) { _searchInput.value = tag.textContent; _searchInput.focus(); } });
});

// ── Power Map Modal (homepage) ──
const _powerMapModal = document.getElementById('powerMapModal');
const _fullPowerMapBtn = document.getElementById('fullPowerMapBtn');
const _powerMapClose = document.getElementById('powerMapClose');
function openModal(m) { if (!m) return; m.classList.add('is-open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal(m) { if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
if (_fullPowerMapBtn) _fullPowerMapBtn.addEventListener('click', () => openModal(_powerMapModal));
if (_powerMapClose)   _powerMapClose.addEventListener('click',   () => closeModal(_powerMapModal));
if (_powerMapModal)   _powerMapModal.addEventListener('click', (e) => { if (e.target === _powerMapModal) closeModal(_powerMapModal); });

// ── Nav Dropdown (homepage) ──
(function () {
  const navData = [
    { label: 'Stories', subs: [
        { label: 'Market Drama',        path: 'stories/market-drama' },
        { label: 'Company Sagas',       path: 'stories/company-sagas' },
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
        { label: 'Fraud',       path: 'investigations/fraud' },
        { label: 'Collapse',    path: 'investigations/collapse' },
        { label: 'Controversy', path: 'investigations/controversy' },
    ]},
    { label: 'Sponsored', subs: [
        { label: 'CMC', path: 'cmc' },
    ]},
  ];

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
      a.href      = sub.path + '.html';
      a.className = 'dropdown-link';
      a.textContent = sub.label;
      li2.appendChild(a);
      ul.appendChild(li2);
    });
    li.appendChild(ul);
  });
}());

// ── Nav Active State on Scroll ──
const sections = document.querySelectorAll('.editorial-section[id]');
const navLinks  = document.querySelectorAll('.nav-link[data-section]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -50% 0px' }
);

sections.forEach((s) => observer.observe(s));

// ── Section Filters ──
document.querySelectorAll('.section-filters').forEach((group) => {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    group.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const section = group.closest('.editorial-section');
    if (!section) return;

    section.querySelectorAll('.editorial-card').forEach((card) => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ── Live Feed Timestamps ──
function updateTimestamps() {
  document.querySelectorAll('.news-time').forEach((el, i) => {
    const mins = [18, 60, 120, 240, 300][i] || 18;
    const now  = Date.now();
    const diff = Math.floor((now - (now - mins * 60 * 1000)) / 60000);
    el.textContent = diff >= 60
      ? `${Math.floor(diff / 60)}h ago`
      : `${diff}m ago`;
  });
}

updateTimestamps();

// ── Power Bars Animate on Scroll ──
const powerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.power-bar').forEach((bar) => {
          const pct = bar.style.getPropertyValue('--pct');
          bar.style.setProperty('--pct', '0%');
          requestAnimationFrame(() => {
            setTimeout(() => bar.style.setProperty('--pct', pct), 50);
          });
        });
        powerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.widget-power-map').forEach((el) => powerObserver.observe(el));

// ── Cards Fade In ──
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  }
);

// Card click navigation: use explicit onclick if set, else generate slug from title
document.querySelectorAll('.editorial-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.getAttribute('onclick')) return; // inline onclick already handles navigation
    const titleEl = card.querySelector('.card-title');
    if (!titleEl) return;
    const title = titleEl.textContent.trim();
    const slug = title.toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');
    location.href = `articles/${slug}.html`;
  });
});

document.querySelectorAll('.editorial-card, .investigation-banner').forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  cardObserver.observe(card);
});

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
    btn.textContent = '✓ Subscribed';
    btn.style.background = 'var(--green)';
    input.value = '';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 3000);
  });
});

// ── Action Buttons Toggle ──
document.querySelectorAll('.action-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('action-btn--active');
    if (btn.classList.contains('action-btn--active')) {
      btn.style.background = 'var(--gold-dim)';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--gold-light)';
    } else {
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }
  });
});

// ── Hero vg-nodes hover pulse ──
document.querySelectorAll('.vg-node').forEach((node) => {
  node.addEventListener('mouseenter', () => {
    node.style.borderColor = 'rgba(200,165,52,0.3)';
    node.style.color = 'rgba(200,165,52,0.8)';
    node.style.background = 'rgba(200,165,52,0.07)';
  });
  node.addEventListener('mouseleave', () => {
    node.style.borderColor = '';
    node.style.color = '';
    node.style.background = '';
  });
});
