(function() {
  // UI: panel and KoGold button insertion
  try {
    const ulSelectorPrefixes = ['dropdownNew-0-2', 'card-0-2', 'dropdownClass-0-2'];
    function matchesDropdown(ul) {
      if (!ul || !ul.classList) return false;
      const classes = Array.from(ul.classList);
      return ulSelectorPrefixes.every(prefix => classes.some(c => c.indexOf(prefix) === 0));
    }

    function createPanel() {
      let panel = document.getElementById('kogold-panel');
      if (panel) return panel;
      panel = document.createElement('div');
      panel.id = 'kogold-panel';
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

      const closeBtn = document.createElement('button');
      closeBtn.id = 'kogold-close';
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); panel.style.display = 'none'; });
      panel.appendChild(closeBtn);

      const content = document.createElement('div');
      content.id = 'kogold-panel-content';

      const themesBtn = document.createElement('button');
      themesBtn.id = 'kogold-themes-btn';
      themesBtn.textContent = 'Themes';
      themesBtn.addEventListener('click', (e) => { e.stopPropagation(); const list = document.getElementById('kogold-themes-list'); if (list) list.style.display = (list.style.display === 'none') ? 'block' : 'none'; });
      content.appendChild(themesBtn);

      const resetBtn = document.createElement('button');
      resetBtn.id = 'kogold-reset-btn';
      resetBtn.textContent = 'Reset Theme';
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          localStorage.removeItem('kogold:selectedTheme');
          localStorage.removeItem('kogold:selectedThemeData');
          const s = document.getElementById('kogold-theme-script'); if (s) s.remove();
          const last = window.KoGold_lastApplied; if (last && Array.isArray(last)) { last.forEach(edit => { try { document.querySelectorAll(edit.selector).forEach(el => { if (edit.styles) Object.keys(edit.styles).forEach(key => { try { el.style[key] = ''; } catch (e) {} }); }); } catch (e) {} }); }
          try { window.CONTAINER_EDITS = undefined; } catch (e) {}
          if (window.KoGold_applyContainerEdits) window.KoGold_applyContainerEdits();
          const panel = document.getElementById('kogold-panel'); if (panel) panel.style.display = 'none';
          setTimeout(() => { try { location.reload(); } catch (e) {} }, 3000);
        } catch (err) {}
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

    function togglePanelForButton() { const panel = createPanel(); panel.style.display = (panel.style.display === 'none') ? 'block' : 'none'; }

    function addKoGoldToUl(ul) {
      if (!matchesDropdown(ul)) return;
      if (ul.querySelector('.kogold-item')) return;
      const li = document.createElement('li'); li.className = 'kogold-item';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'kogold-button'; btn.textContent = 'KoGold';
      btn.style.color = '#ffd166'; btn.style.clear = 'both'; btn.style.width = '100%'; btn.style.border = 'none'; btn.style.cursor = 'pointer'; btn.style.display = 'block'; btn.style.padding = '10px 12px'; btn.style.fontSize = '16px'; btn.style.background = 'transparent'; btn.style.textAlign = 'left'; btn.style.lineHeight = '1.42857'; btn.style.userSelect = 'none'; btn.style.whiteSpace = 'nowrap'; btn.style.textDecoration = 'none';
      btn.addEventListener('click', (e) => { e.stopPropagation(); togglePanelForButton(); });
      li.appendChild(btn); ul.appendChild(li);
    }

    function scanAndInject() {
      const uls = document.querySelectorAll('ul');
      Array.from(uls).slice(0,5).forEach((u,i)=>{ try { const classes = u.className || '(no class)'; const snippet = (u.outerHTML||'').slice(0,500); } catch(e){} });
      uls.forEach(ul => { try { addKoGoldToUl(ul); } catch (e) {} });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scanAndInject); else scanAndInject();
    new MutationObserver((mutations)=>{ for (const m of mutations) m.addedNodes.forEach(node => { if (node && node.querySelectorAll) scanAndInject(); }); }).observe(document.body, { childList: true, subtree: true });

    // expose for manual toggling
    window.KoGold_togglePanel = togglePanelForButton;
    window.KoGold_createPanel = createPanel;
    window.KoGold_addKoGoldToUl = addKoGoldToUl;

  } catch (e) {}
})();
