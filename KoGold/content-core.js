(function () {
  const applyEdits = () => {
    if (!window.CONTAINER_EDITS) return;
    window.CONTAINER_EDITS.forEach(edit => {
      document.querySelectorAll(edit.selector).forEach(el => {
        if (edit.styles) {
          Object.entries(edit.styles).forEach(([key, value]) => {
            try { el.style[key] = value; } catch (e) { }
          });
        }
        if (edit.remove) {
          try { el.remove(); } catch (e) { }
        }
      });
    });
  };

  // Run once initially
  applyEdits();

  // Watch for new elements being added
  const observer = new MutationObserver(() => applyEdits());
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose a global apply function so themes loaded later can apply edits
  window.KoGold_applyContainerEdits = function() {
    try {
      if (!window.CONTAINER_EDITS) return;
      window.CONTAINER_EDITS.forEach(edit => {
        document.querySelectorAll(edit.selector).forEach(el => {
          if (edit.styles) {
            Object.entries(edit.styles).forEach(([key, value]) => {
              try { el.style[key] = value; } catch (e) { }
            });
          }
          if (edit.remove) {
            try { el.remove(); } catch (e) { }
          }
        });
      });
    } catch (e) { }
  };

  function getScriptBase() {
    try {
      const scripts = Array.from(document.scripts || []);
      const s = scripts.reverse().find(sc => sc.src && sc.src.indexOf('content.js') !== -1);
      if (s && s.src) return s.src.substring(0, s.src.lastIndexOf('/') + 1);
    } catch (e) {}
    return '';
  }

  function getResourcePath(file) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const chromeUrl = chrome.runtime.getURL('Themes/' + file);
        if (chromeUrl && chromeUrl.indexOf('invalid') === -1) return chromeUrl;
      }
    } catch (e) {}
    return getScriptBase() + 'Themes/' + file;
  }

  function getAssetPath(filename) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const chromeUrl = chrome.runtime.getURL(filename);
        if (chromeUrl && chromeUrl.indexOf('invalid') === -1) return chromeUrl;
      }
    } catch (e) {}
    return getScriptBase() + filename;
  }

  // expose helpers globally for other split files
  window.KoGold_getResourcePath = getResourcePath;
  window.KoGold_getAssetPath = getAssetPath;
})();
