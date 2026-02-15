(function () {
  'use strict';

  // ========== AVATAR EDITOR TWEAKS ==========
  const avatarpage = '/My/Avatar';

  let panel = null;
  let limitedBtn = null;
  let limitedDot = null;
  let allBtn = null;
  let allDot = null;
  let limitedOnly = false;
  let showAll = false;
  let searchText = '';
  let loading = false;

  function primaryColor() {
    const c = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim();
    return c || '#000000';
  }

  const offColor = primaryColor();
  const onColor = '#22c55e';

  function onAvatar() {
    return location.pathname === avatarpage;
  }

  function makeSwitch(text, click) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    const box = document.createElement('div');
    box.style.width = '42px';
    box.style.height = '22px';
    box.style.borderRadius = '999px';
    box.style.cursor = 'pointer';
    box.style.position = 'relative';
    box.style.transition = 'background 0.2s ease';

    const dot = document.createElement('div');
    dot.style.width = '18px';
    dot.style.height = '18px';
    dot.style.borderRadius = '50%';
    dot.style.background = '#fff';
    dot.style.position = 'absolute';
    dot.style.top = '2px';
    dot.style.left = '2px';
    dot.style.transition = 'left 0.2s ease';

    box.appendChild(dot);

    const label = document.createElement('span');
    label.textContent = text;
    label.style.fontSize = '16px';
    label.style.color = '#c5c5c5';
    label.style.userSelect = 'none';

    box.onclick = click;

    row.appendChild(box);
    row.appendChild(label);

    return { row, box, dot };
  }

  function makeSearch() {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '4px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search items...';
    input.style.padding = '6px 8px';
    input.style.borderRadius = '6px';
    input.style.border = '1px solid #ccc';
    input.style.fontSize = '14px';
    input.style.outline = 'none';

    input.addEventListener('input', () => {
      searchText = input.value.trim().toLowerCase();
      applyFilters();
    });

    wrap.appendChild(input);
    return wrap;
  }

  function addUI() {
    if (panel) return;

    const target = document.querySelector('[class*="idekbuh"]');
    if (!target) return;

    panel = document.createElement('div');
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '10px';
    panel.style.marginTop = '18px';

    const limited = makeSwitch('Limiteds Only', () => {
      limitedOnly = !limitedOnly;
      updateLimited();
      applyFilters();
    });

    limitedBtn = limited.box;
    limitedDot = limited.dot;

    const all = makeSwitch('Show All Items', () => {
      showAll = !showAll;
      updateAll();

      if (showAll) loadEverything();
    });

    allBtn = all.box;
    allDot = all.dot;

    panel.appendChild(limited.row);
    panel.appendChild(all.row);
    panel.appendChild(makeSearch());

    target.appendChild(panel);

    updateLimited();
    updateAll();
  }

  function removeUI() {
    loading = false;

    if (panel) {
      panel.remove();
      panel = null;
      limitedBtn = null;
      limitedDot = null;
      allBtn = null;
      allDot = null;
    }
  }

  function updateLimited() {
    if (!limitedBtn) return;

    if (limitedOnly) {
      limitedBtn.style.background = onColor;
      limitedDot.style.left = '22px';
    } else {
      limitedBtn.style.background = offColor;
      limitedDot.style.left = '2px';
    }
  }

  function updateAll() {
    if (!allBtn) return;

    if (showAll) {
      allBtn.style.background = onColor;
      allDot.style.left = '22px';
    } else {
      allBtn.style.background = offColor;
      allDot.style.left = '2px';
    }
  }

  function applyFilters() {
    if (!onAvatar()) return;

    const cards = document.querySelectorAll('[class^="avatarCardWrapper"]');

    cards.forEach(card => {
      const restrict = card.querySelector('[class^="restrictionsContainer"]');
      let name = '';

      const img = card.querySelector('img[alt]');
      if (img && img.alt) {
        name = img.alt.toLowerCase();
      } else {
        const el = card.querySelector('[class*="name"], [class*="title"], h3, span');
        if (el) name = el.textContent.toLowerCase();
      }

      let show = true;

      if (limitedOnly) {
        const isLimitedItem = restrict && restrict.children.length > 0;
        if (!isLimitedItem) show = false;
      }

      if (searchText && !name.includes(searchText)) {
        show = false;
      }

      card.style.display = show ? '' : 'none';
    });
  }

  function loadEverything() {
    if (!onAvatar() || !showAll) return;
    if (loading) return;

    const btn = document.querySelector('button[class*="loadMoreBtn"]');
    if (!btn || btn.disabled || btn.offsetParent === null) return;

    loading = true;
    btn.click();

    setTimeout(() => {
      loading = false;
      applyFilters();

      if (showAll) loadEverything();
    }, 1000);
  }

  function initAvatarTweaks() {
    if (!onAvatar()) {
      removeUI();
      return;
    }
    addUI();
    applyFilters();

    if (showAll) loadEverything();
  }

  // ========== AD REMOVAL ==========
  const adSelectors = [
    "[class*='advertisementContainer-0-2']",
    "[class*='skyScraperLeft-0-2']",
    "[class*='skyScraperRight-0-2']",
    "[class*='feedNews-0-2']",
    "[class*='adWrapper-0-2']"
  ];

  function removeAds() {
    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try { el.style.display = 'none'; } catch (e) { }
      });
    });
  }

  function applyAdRemoval() {
    if (localStorage.getItem('kogold:removeAds') === 'false') return;
    removeAds();
  }

  // ========== PERSISTENCE AND OBSERVERS ==========

  let debounceTimer = null;
  let persistenceTimer = null;

  function debouncedReapply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (localStorage.getItem('kogold:avatarTweaks') === 'true' && onAvatar()) {
        initAvatarTweaks();
      }
      if (localStorage.getItem('kogold:removeAds') !== 'false') {
        removeAds();
      }
    }, 100);
  }

  const persistenceObserver = new MutationObserver(() => {
    debouncedReapply();
  });

  function startPersistence() {
    persistenceObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    persistenceTimer = setInterval(() => {
      if (localStorage.getItem('kogold:avatarTweaks') === 'true' && onAvatar()) {
        initAvatarTweaks();
      }
      if (localStorage.getItem('kogold:removeAds') !== 'false') {
        removeAds();
      }
    }, 2000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        if (localStorage.getItem('kogold:avatarTweaks') === 'true' && onAvatar()) {
          initAvatarTweaks();
        }
        if (localStorage.getItem('kogold:removeAds') !== 'false') {
          applyAdRemoval();
        }
      }
    });

    // Listen for common events that might trigger content changes
    ['click', 'scroll', 'focus'].forEach(event => {
      document.addEventListener(event, debouncedReapply, true);
    });
  }

  // Initialize on load
  function initSettings() {
    // Apply avatar tweaks if enabled
    if (localStorage.getItem('kogold:avatarTweaks') === 'true') {
      if (onAvatar()) {
        initAvatarTweaks();
      }
    }

    // Apply ad removal if enabled
    if (localStorage.getItem('kogold:removeAds') !== 'false') {
      applyAdRemoval();
    }

    startPersistence();
  }

  // Handle page changes (SPA navigation)
  let lastPath = location.pathname;
  const pageChangeObserver = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;

      if (localStorage.getItem('kogold:avatarTweaks') === 'true') {
        if (onAvatar()) {
          initAvatarTweaks();
        } else {
          removeUI();
        }
      }

      if (localStorage.getItem('kogold:removeAds') !== 'false') {
        setTimeout(applyAdRemoval, 200);
      }
    }
  });

  pageChangeObserver.observe(document.body, { childList: true, subtree: true });

  // Expose functions globally
  window.KoGold_applyAvatarTweaks = initAvatarTweaks;
  window.KoGold_applyAdRemoval = applyAdRemoval;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
  } else {
    initSettings();
  }
})();
