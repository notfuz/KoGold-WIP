(function () {
  const applyEdits = () => {
    if (!window.CONTAINER_EDITS) return;
    window.CONTAINER_EDITS.forEach(edit => {
      document.querySelectorAll(edit.selector).forEach(el => {
        if (edit.styles) {
          Object.entries(edit.styles).forEach(([key, value]) => {
            el.style[key] = value;
          });
        }
        if (edit.remove) {
          el.remove();
        }
      });
    });
  };

  // Run once initially
  applyEdits();

  // Watch for new elements being added
  const observer = new MutationObserver(() => {
    applyEdits();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// Expose a global apply function so themes loaded later can apply edits
window.KoGold_applyContainerEdits = function() {
  try {
    if (!window.CONTAINER_EDITS) return;
    window.CONTAINER_EDITS.forEach(edit => {
      document.querySelectorAll(edit.selector).forEach(el => {
        if (edit.styles) {
          Object.entries(edit.styles).forEach(([key, value]) => {
            try { el.style[key] = value; } catch (e) {}
          });
        }
        if (edit.remove) {
          try { el.remove(); } catch (e) {}
        }
      });
    });
  } catch (e) { console.error('KoGold_applyContainerEdits', e); }
};

  // Add KoGold button to dropdown UL and show a centered plain box with close button
  (function() {
    try {
      const ulSelectorParts = ['dropdownNew-0-2-226', 'card-0-2-129', 'dropdownClass-0-2-101'];
      function matchesDropdown(ul) {
        return ul && ul.classList && ul.classList.contains(ulSelectorParts[0]) && ul.classList.contains(ulSelectorParts[1]) && ul.classList.contains(ulSelectorParts[2]);
      }

      function createPanel() {
        let panel = document.getElementById('kogold-panel');
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = 'kogold-panel';
        // center the box and make it larger and opaque
        panel.style.position = 'fixed';
        panel.style.left = '50%';
        panel.style.top = '50%';
        panel.style.transform = 'translate(-50%,-50%)';
        panel.style.zIndex = 99999;
        panel.style.display = 'none';
        panel.style.width = '600px';
        panel.style.height = '400px';
        panel.style.background = '#222222ff';
        panel.style.color = '#000000';
        panel.style.padding = '16px';

        // close button in upper-left inside the box (plain button)
        const closeBtn = document.createElement('button');
        closeBtn.id = 'kogold-close';
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          panel.style.display = 'none';
        });
        panel.appendChild(closeBtn);

        // content container (placeholder)
          const content = document.createElement('div');
          content.id = 'kogold-panel-content';

          // simple Themes option
          const themesBtn = document.createElement('button');
          themesBtn.id = 'kogold-themes-btn';
          themesBtn.textContent = 'Themes';
          themesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const list = document.getElementById('kogold-themes-list');
            if (list) list.style.display = (list.style.display === 'none') ? 'block' : 'none';
          });
          content.appendChild(themesBtn);

          // Reset button: removes persisted theme and attempts to undo last applied edits
          const resetBtn = document.createElement('button');
          resetBtn.id = 'kogold-reset-btn';
          resetBtn.textContent = 'Reset Theme';
          resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
              // clear persisted selection
              localStorage.removeItem('kogold:selectedTheme');
              // remove injected script if present
              const s = document.getElementById('kogold-theme-script');
              if (s) s.remove();
              // attempt to undo inline styles from last applied theme
              const last = window.KoGold_lastApplied;
              if (last && Array.isArray(last)) {
                last.forEach(edit => {
                  try {
                    document.querySelectorAll(edit.selector).forEach(el => {
                      if (edit.styles) {
                        Object.keys(edit.styles).forEach(key => {
                          try { el.style[key] = ''; } catch (e) {}
                        });
                      }
                    });
                  } catch (e) {}
                });
              }
              // clear global container edits and reapply (no-op)
              try { window.CONTAINER_EDITS = undefined; } catch (e) {}
              if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
              // hide panel
              const panel = document.getElementById('kogold-panel');
              if (panel) panel.style.display = 'none';
              // reload page after 3 seconds
              setTimeout(() => { try { location.reload(); } catch (e) { console.error(e); } }, 3000);
            } catch (err) { console.error('KoGold: reset failed', err); }
          });
          content.appendChild(resetBtn);

          const themesList = document.createElement('div');
          themesList.id = 'kogold-themes-list';
          themesList.style.display = 'none';
          themesList.textContent = 'Loading themes...';
          content.appendChild(themesList);
        panel.appendChild(content);

        document.body.appendChild(panel);
        return panel;
      }

        // --- Themes loading utilities ---
        function getScriptBase() {
          try {
            const scripts = Array.from(document.scripts || []);
            const s = scripts.reverse().find(sc => sc.src && sc.src.indexOf('content.js') !== -1);
            if (s && s.src) {
              return s.src.substring(0, s.src.lastIndexOf('/') + 1);
            }
          } catch (e) {}
          return '';
        }

        function getResourcePath(file) {
          // Prefer extension URL if available (content script running from extension)
          try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
              const chromeUrl = chrome.runtime.getURL('Themes/' + file);
              // chrome may return "chrome-extension://invalid/..." in some contexts — avoid using that
              if (chromeUrl && chromeUrl.indexOf('invalid') === -1) return chromeUrl;
            }
          } catch (e) {}
          // Fallback: try relative to content.js location
          return getScriptBase() + 'Themes/' + file;
        }

        // Get path to an extension asset (root-level), prefer chrome.runtime.getURL when available
        function getAssetPath(filename) {
          try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
              const chromeUrl = chrome.runtime.getURL(filename);
              if (chromeUrl && chromeUrl.indexOf('invalid') === -1) return chromeUrl;
            }
          } catch (e) {}
          return getScriptBase() + filename;
        }

        // Embedded fallback themes (auto-generated from workspace)
        const KoGold_embeddedThemes = [
          { name: 'Test Theme', file: 'test-theme.js' },
          { name: 'Starry Night', file: 'starry-night.js' }
        ];

        // Embedded theme contents (so themes work without fetching chrome-extension URLs)
        const KoGold_embeddedThemeMap = {
          'test-theme.js': [
            {
              selector: "body",
              styles: {
                backgroundColor: "rgba(255, 255, 255, 1)",
                background: "url(https://imgur.com/9ncCjcg.png)"
              }
            },
            {
              selector: ".row.pb-2.gamesContainer-0-2-33",
              styles: { backgroundColor: "#ffffff01" }
            },
            {
              selector: ".col-12.col-lg-3.advertisementContainer-0-2-76",
              styles: { display: "none" }
            },
            {
              selector: ".skyScraperLeft-0-2-33",
              styles: { display: "none" }
            },
            {
              selector: ".skyScraperRight-0-2-34",
              styles: { display: "none" }
            },
            {
              selector: ".col-12.feedNews-0-2-44",
              styles: { display: "none" }
            },
            {
              selector: ".col-12.col-lg-9.uselessFuckingClass-0-2-75",
              styles: { width: "100%" }
            },
            {
              selector: ".section-content",
              styles: { backgroundColor: "#ffffff01", boxShadow: "none" }
            },
            {
              selector: ".containerHeader-0-2-73",
              styles: { width: "85.75%" }
            }
          ],
          'starry-night.js': [
            {
              selector: "body",
              styles: {
                backgroundColor: "rgba(54, 54, 54, 1)",
                background: "url(https://imgur.com/Vff8cxn.png)"
              }
            },
            {
              selector: ".row.pb-2.gamesContainer-0-2-33",
              styles: { backgroundColor: "#ffffff01" }
            },
            {
              selector: ".row-0-2-4.rowOne-0-2-6.row",
              styles: { backgroundColor: "rgba(0, 0, 0, 1)" }
            },
            {
              selector: ".alertBg-0-2-25",
              styles: { backgroundColor: "#454647" }
            },
            {
              selector: ".section-content",
              styles: { backgroundColor: "#ffffff01", boxShadow: "none" }
            },
            {
              selector: "[class*='card-0-2'][class*='card-d0-0-2']",
              styles: { backgroundColor: "rgba(0, 0, 0, 1)" }
            },
            {
              selector: "[class*='iconCard-0-2']",
              styles: { backgroundColor: "#454647" }
            },
            {
              selector: "[class*='card assetContainerCard-0-2']",
              styles: { backgroundColor: "#454647" }
            },
            {
              selector: "[class*='statText-0-2']",
              styles: { color: "#ccccccff !important" }
            },
            {
              selector: "[class*='col-12 col-lg-3 advertisementContainer-0-2']",
              styles: { display: "none" }
            },
            { selector: ".row.undefined", styles: { display: "none" } },
            { selector: ".skyScraperLeft-0-2-33", styles: { display: "none" } },
            { selector: ".skyScraperRight-0-2-34", styles: { display: "none" } },
            { selector: "[class*='col-12 feedNews-0-2']", styles: { display: "none" } },
            { selector: "[class*='adWrapper-0-2'][class*='skyscraperAdContainer-0-2']", styles: { display: "none" } },
            { selector: "[class*='adWrapper-0-2'][class*='bannerAdContainer-0-2']", styles: { display: "none" } },
            { selector: "[class*='col-12 col-lg-9 uselessFuckingClass-0-2']", styles: { width: "100%" } },
            { selector: "[class*='containerHeader-0-2']", styles: { width: "85.75%" } }
          ]
        };

        async function loadThemesManifest() {
          const manifestUrl = getResourcePath('themes.json');
          try {
            const res = await fetch(manifestUrl, {cache: 'no-store'});
            if (!res.ok) throw new Error('no manifest');
            const json = await res.json();
            if (Array.isArray(json) && json.length) return json;
          } catch (e) {
            // ignore and fallback to embedded list
          }
          return KoGold_embeddedThemes.slice();
        }

        function injectThemeScript(file) {
          return new Promise((resolve, reject) => {
            try {
              // If we have the theme embedded, apply it directly
              if (KoGold_embeddedThemeMap && KoGold_embeddedThemeMap[file]) {
                try {
                  window.CONTAINER_EDITS = JSON.parse(JSON.stringify(KoGold_embeddedThemeMap[file]));
                  if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
                  // record last applied edits so Reset can undo them
                  try { window.KoGold_lastApplied = JSON.parse(JSON.stringify(KoGold_embeddedThemeMap[file])); } catch (e) { window.KoGold_lastApplied = KoGold_embeddedThemeMap[file]; }
                  resolve();
                  return;
                } catch (e) {
                  console.error('KoGold: failed to apply embedded theme', e);
                }
              }

              const old = document.getElementById('kogold-theme-script');
              if (old) old.remove();
              const scriptUrl = getResourcePath(file);
              const s = document.createElement('script');
              s.id = 'kogold-theme-script';
              s.src = scriptUrl;
              s.onload = () => resolve();
              s.onerror = async (e) => {
                console.warn('KoGold: script tag failed, attempting fetch fallback for', scriptUrl, e);
                // fallback: try fetching the script and inject via blob URL
                try {
                  const resp = await fetch(scriptUrl, {cache: 'no-store'});
                  if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
                  const code = await resp.text();
                  const blob = new Blob([code], { type: 'application/javascript' });
                  const blobUrl = URL.createObjectURL(blob);
                  const s2 = document.createElement('script');
                  s2.id = 'kogold-theme-script';
                  s2.src = blobUrl;
                      s2.onload = () => {
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                        // record last applied edits if the theme script set window.CONTAINER_EDITS
                        try { window.KoGold_lastApplied = window.CONTAINER_EDITS ? JSON.parse(JSON.stringify(window.CONTAINER_EDITS)) : window.KoGold_lastApplied; } catch (e) {}
                        resolve();
                      };
                  s2.onerror = (err2) => {
                    console.error('KoGold: blob-injected script failed', err2);
                    reject(err2);
                  };
                  document.documentElement.appendChild(s2);
                } catch (fetchErr) {
                  console.error('KoGold: fetch fallback failed for', scriptUrl, fetchErr);
                  reject(fetchErr);
                }
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
          if (!themes.length) {
            listEl.textContent = 'No themes found.';
            return;
          }
          const selectedFile = localStorage.getItem('kogold:selectedTheme');
          themes.forEach(t => {
            const b = document.createElement('button');
            b.textContent = t.name || t.file || 'unnamed';
            b.style.display = 'block';
            if (t.file === selectedFile) {
              b.setAttribute('aria-pressed', 'true');
              b.style.fontWeight = '600';
            } else {
              b.setAttribute('aria-pressed', 'false');
              b.style.fontWeight = 'normal';
            }
            b.addEventListener('click', async (e) => {
              e.stopPropagation();
              try {
                await injectThemeScript(t.file);
                if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
                localStorage.setItem('kogold:selectedTheme', t.file);
                populateThemes();
              } catch (err) { console.error('Failed to load theme', err); }
            });
            listEl.appendChild(b);
          });
        }

        // Auto-load persisted theme
        (function autoLoadSavedTheme(){
          try {
            const file = localStorage.getItem('kogold:selectedTheme');
            if (!file) return;
            injectThemeScript(file).then(() => {
              if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
            }).catch(e => console.error('Auto-load theme failed', e));
          } catch (e) {}
        })();

        // populate themes list when panel is first created
        (function whenPanelReadyPopulate(){
          const obs = new MutationObserver(() => {
            const list = document.getElementById('kogold-themes-list');
            if (list) {
              populateThemes();
              obs.disconnect();
            }
          });
          obs.observe(document.body, { childList: true, subtree: true });
        })();

      function togglePanelForButton() {
        const panel = createPanel();
        panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
      }

      function addKoGoldToUl(ul) {
        if (!matchesDropdown(ul)) return;
        if (ul.querySelector('.kogold-item')) return; // already added
        const li = document.createElement('li');
        li.className = 'kogold-item';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kogold-button';
        btn.textContent = 'KoGold';
        // apply requested KoGold button styles
        btn.style.color = '#ffd166';
        btn.style.clear = 'both';
        btn.style.width = '100%';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.display = 'block';
        btn.style.padding = '10px 12px';
        btn.style.fontSize = '16px';
        btn.style.background = 'transparent';
        btn.style.textAlign = 'left';
        btn.style.lineHeight = '1.42857';
        btn.style.userSelect = 'none';
        btn.style.whiteSpace = 'nowrap';
        btn.style.textDecoration = 'none';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePanelForButton();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      }

      function scanAndInject() {
        document.querySelectorAll('ul').forEach(ul => {
          try { addKoGoldToUl(ul); } catch (e) {}
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scanAndInject);
      } else scanAndInject();

      // Observe for new dropdowns being added
      new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach(node => {
            if (node && node.querySelectorAll) scanAndInject();
          });
        }
      }).observe(document.body, { childList: true, subtree: true });

    } catch (e) { console.error(e); }
  })();
  
// Inject paw icon for user 14159
(function() {
  try {
    const targetUserId = '14159';
    if (!location.href.includes('/users/' + targetUserId + '/profile')) return;
    const selector = 'span.icon-obc.bcIcon-0-2-114';
    function applyPaw() {
      document.querySelectorAll(selector).forEach(el => {
        if (el.dataset.pawApplied) return;
        el.dataset.pawApplied = '1';
        el.style.backgroundImage = 'url("https://i.imgur.com/ffZwPVV.png")';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'left';
        el.style.backgroundSize = 'contain';
        el.style.display = 'inline-block';
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyPaw);
    } else applyPaw();
    new MutationObserver(applyPaw).observe(document.body, { childList: true, subtree: true });
  } catch (e) { console.error(e); }
})();
