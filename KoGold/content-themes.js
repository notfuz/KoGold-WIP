(function() {
  // Embedded fallback themes
  window.KoGold_embeddedThemes = [
    { name: 'Test Theme', file: 'test-theme.js' },
    { name: 'Starry Night', file: 'starry-night.js' }
  ];

  window.KoGold_embeddedThemeMap = {
    'test-theme.js': [
      { selector: 'body', styles: { backgroundColor: 'rgba(255,255,255,1)', background: 'url(https://imgur.com/9ncCjcg.png)' } },
      { selector: '.row.pb-2.gamesContainer-0-2-33', styles: { backgroundColor: '#ffffff01' } }
    ],
    'starry-night.js': [
    { selector: 'body',
         styles: { backgroundColor: 'rgba(54,54,54,1)',
         background: 'url(https://i.imgur.com/Vff8cxn.jpeg)' } 
    },
    {
      selector: "[class*='advertisementContainer-0-2']",
      styles: { display: "none" }
    },
    {
      selector: "[class*='skyScraperLeft-0-2']",
      styles: { display: "none" }
    },
    {
      selector: "[class*='skyScraperRight-0-2']",
      styles: { display: "none" }
    },
    {
      selector: "[class*='feedNews-0-2']",
      styles: { display: "none" }
    },
    {
      selector: "[class*='adWrapper-0-2']",
      styles: { display: "none" }
    },
    {
      selector: "[class*='uselessFuckingClass-0-2']",
      styles: { width: "100%" }
    },
    {
      selector: ".section-content",
      styles: {
        backgroundColor: "#ffffff01",
        boxShadow: "none"}
    },
    {
      selector: "[class*='containerHeader-0-2']",
      styles: { width: "85.75%" }
    },
    {
    selector: ".row.pb-2.gamesContainer-0-2-33",
    styles: {
      backgroundColor: "#ffffff01"}
    },
    {
    selector: ".row-0-2-4.rowOne-0-2-6.row",
    styles: {
      backgroundColor: "rgba(0, 0, 0, 1)"}
    },
    {
    selector: ".alertBg-0-2-25",
    styles: {
      backgroundColor: "#454647"}
    },
    {
    selector: ".section-content",
    styles: {
        backgroundColor: "#ffffff01",
        boxShadow: "none"}
    },
    {
    selector: "[class*='card-0-2'][class*='card-d0-0-2']",
    styles: {
      backgroundColor: "rgba(0, 0, 0, 1)"}
    },
    {
    selector: "[class*='iconCard-0-2']",
    styles: {
      backgroundColor: "#454647"}
    },
    {
    selector: "[class*='card assetContainerCard-0-2']",
    styles: {
      backgroundColor: "#454647"}
    },
    {
    selector: "[class*='statText-0-2']",
    styles: {
      color: "#ccccccff !important"}
    },
    ]
    };

  const KoGold_embeddedThemeAssets = window.KoGold_embeddedThemeAssets || {
    'starry-night.js': 'starry-night.jpg',
    'test-theme.js': 'test-theme-bg.png'
  };

  async function blobToDataURL(blob) {
    return await new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } catch (e) { reject(e); }
    });
  }

  async function resolveEmbeddedThemeBackgrounds(file, edits) {
    const getResourcePath = window.KoGold_getResourcePath || (n => n);
    const clone = JSON.parse(JSON.stringify(edits));
    const urlRe = /url\((?:['"])?(https?:\/\/[^)'"]+)(?:['"])?\)/i;
    for (const e of clone) {
      if (!e.styles) continue;
      for (const k of Object.keys(e.styles)) {
        const v = e.styles[k];
        if (typeof v !== 'string') continue;
        const m = v.match(urlRe);
        if (m && m[1]) {
          const remote = m[1];
          try {
            const resp = await fetch(remote, { cache: 'no-store' });
            if (resp && resp.ok) {
              const blob = await resp.blob();
              const dataUrl = await blobToDataURL(blob);
              e.styles[k] = 'url("' + dataUrl + '")';
              continue;
            }
          } catch (err) {}
          try {
            const assetName = KoGold_embeddedThemeAssets[file] || (file.replace('.js', '.jpg'));
            const localUrl = getResourcePath(assetName);
            e.styles[k] = 'url("' + localUrl + '")';
          } catch (err2) {}
        }
      }
    }
    return clone;
  }

  async function loadThemesManifest() {
    const getResourcePath = window.KoGold_getResourcePath || (n => n);
    const manifestUrl = getResourcePath('themes.json');
    try {
      if (manifestUrl && manifestUrl.indexOf('invalid') === -1) {
        const res = await fetch(manifestUrl, { cache: 'no-store' });
        if (res && res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length) return json;
        }
      }
    } catch (e) {}

    // If manifest not present, try probing the Themes folder for known files
    const fallback = (window.KoGold_embeddedThemes || []).slice();
    const available = [];
    for (const t of fallback) {
      try {
        let url = getResourcePath(t.file) || ('Themes/' + t.file);
        if (url.indexOf && url.indexOf('invalid') !== -1) url = 'Themes/' + t.file;
        // try a lightweight fetch to check presence (skip chrome-extension invalid URLs)
        const r = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (r && r.ok) available.push(t);
      } catch (e) {}
    }
    return (available.length ? available : fallback);
  }

  async function injectThemeScript(file) {
    try {
      if (window.KoGold_embeddedThemeMap && window.KoGold_embeddedThemeMap[file]) {
        try {
          const resolved = await resolveEmbeddedThemeBackgrounds(file, window.KoGold_embeddedThemeMap[file]);
          window.CONTAINER_EDITS = resolved;
          if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
          try { window.KoGold_lastApplied = JSON.parse(JSON.stringify(resolved)); } catch (e) { window.KoGold_lastApplied = resolved; }
          try { localStorage.setItem('kogold:selectedThemeData', JSON.stringify(resolved)); } catch (e) {}
          return;
        } catch (e) {}
      }
    } catch (e) {}

    return await new Promise((resolve, reject) => {
      try {
        const old = document.getElementById('kogold-theme-script');
        if (old) old.remove();
        const scriptUrl = (window.KoGold_getResourcePath || (n => n))(file);
        const s = document.createElement('script');
        s.id = 'kogold-theme-script';
        s.src = scriptUrl;
        s.onload = () => { try { if (window.CONTAINER_EDITS) localStorage.setItem('kogold:selectedThemeData', JSON.stringify(window.CONTAINER_EDITS)); } catch (e) {} resolve(); };
        s.onerror = async (e) => {
          try {
            const resp = await fetch(scriptUrl, { cache: 'no-store' });
            if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
            const code = await resp.text();
            const blob = new Blob([code], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            const s2 = document.createElement('script');
            s2.id = 'kogold-theme-script';
            s2.src = blobUrl;
            s2.onload = () => {
              setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              try { window.KoGold_lastApplied = window.CONTAINER_EDITS ? JSON.parse(JSON.stringify(window.CONTAINER_EDITS)) : window.KoGold_lastApplied; } catch (e) {}
              try { if (window.CONTAINER_EDITS) localStorage.setItem('kogold:selectedThemeData', JSON.stringify(window.CONTAINER_EDITS)); } catch (e) {}
              resolve();
            };
            s2.onerror = (err2) => { reject(err2); };
            document.documentElement.appendChild(s2);
          } catch (fetchErr) { reject(fetchErr); }
        };
        document.documentElement.appendChild(s);
      } catch (e) { reject(e); }
    });
  }

  async function populateThemes() {
    const listEl = document.getElementById('kogold-themes-list');
    if (!listEl) return;
    listEl.textContent = 'Loading themes...';
    const themes = await loadThemesManifest();
    listEl.innerHTML = '';
    if (!themes.length) { listEl.textContent = 'No themes found.'; return; }
    const selectedFile = localStorage.getItem('kogold:selectedTheme');
    themes.forEach(t => {
      const b = document.createElement('button');
      b.textContent = t.name || t.file || 'unnamed';
      b.style.display = 'block';
      if (t.file === selectedFile) { b.setAttribute('aria-pressed', 'true'); b.style.fontWeight = '600'; } else { b.setAttribute('aria-pressed', 'false'); b.style.fontWeight = 'normal'; }
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await injectThemeScript(t.file);
          if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
          localStorage.setItem('kogold:selectedTheme', t.file);
          populateThemes();
        } catch (err) {}
      });
      listEl.appendChild(b);
    });
  }

  (function autoLoadSavedTheme(){
    try {
      const data = localStorage.getItem('kogold:selectedThemeData');
      if (data) {
        try { const parsed = JSON.parse(data); if (parsed && Array.isArray(parsed)) { window.CONTAINER_EDITS = parsed; if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits(); return; } } catch (e) {}
      }
      const file = localStorage.getItem('kogold:selectedTheme');
      if (!file) return;
      injectThemeScript(file).then(() => { if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits(); }).catch(e => {});
    } catch (e) {}
  })();

  (function whenPanelReadyPopulate(){
    const obs = new MutationObserver(() => {
      const list = document.getElementById('kogold-themes-list');
      if (list) { populateThemes(); obs.disconnect(); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  })();

  // expose theme functions globally for UI to call
  window.KoGold_populateThemes = populateThemes;
  window.KoGold_injectThemeScript = injectThemeScript;
  window.KoGold_loadThemesManifest = loadThemesManifest;
})();
