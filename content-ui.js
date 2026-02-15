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
      
      // Create backdrop overlay if it doesn't exist
      let backdrop = document.getElementById('kogold-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'kogold-backdrop';
        backdrop.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99998;
          display: none;
        `;
        document.body.appendChild(backdrop);
      }
      
      panel = document.createElement('div');
      panel.id = 'kogold-panel';
      panel.style.position = 'fixed';
      panel.style.left = '50%';
      panel.style.top = '50%';
      panel.style.transform = 'translate(-50%,-50%)';
      panel.style.zIndex = 99999;
      panel.style.display = 'none';
      panel.style.width = '900px';
      panel.style.height = '600px';
      panel.style.background = '#222222ff';
      panel.style.color = '#000000';
      panel.style.padding = '0';
      panel.style.display = 'flex';
      panel.style.flexDirection = 'column';
      panel.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.95), 0 0 60px rgba(0, 0, 0, 0.8)';
      panel.style.borderRadius = '0px';

      // Header with close button
      const header = document.createElement('div');
      header.style.cssText = `
        background: #333333;
        border-bottom: 2px solid #555555;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      `;
      
      const title = document.createElement('div');
      title.textContent = 'KoGold';
      title.style.cssText = `
        color: #ffd166;
        font-weight: bold;
        font-size: 16px;
      `;
      header.appendChild(title);

      const closeBtn = document.createElement('button');
      closeBtn.id = 'kogold-close';
      closeBtn.textContent = 'Close';
      closeBtn.style.color = '#ffd166';
      closeBtn.style.background = '#333333';
      closeBtn.style.border = '2px solid #555555';
      closeBtn.style.padding = '6px 12px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '12px';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        panel.style.display = 'none';
        const backdrop = document.getElementById('kogold-backdrop');
        if (backdrop) backdrop.style.display = 'none';
      });
      closeBtn.addEventListener('mousedown', () => { closeBtn.style.borderStyle = 'inset'; });
      closeBtn.addEventListener('mouseup', () => { closeBtn.style.borderStyle = 'solid'; });
      closeBtn.addEventListener('mouseleave', () => { closeBtn.style.borderStyle = 'solid'; });
      header.appendChild(closeBtn);
      panel.appendChild(header);

      // Main content area with sidebar
      const mainContainer = document.createElement('div');
      mainContainer.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
      `;

      // Sidebar
      const sidebar = document.createElement('div');
      sidebar.style.cssText = `
        width: 150px;
        background: #2a2a2a;
        border-right: 2px solid #555555;
        padding: 12px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        box-sizing: border-box;
      `;

      const themesBtn = document.createElement('button');
      themesBtn.id = 'kogold-themes-btn';
      themesBtn.textContent = 'Themes';
      themesBtn.style.cssText = `
        color: #ffd166;
        background: #333333;
        border: 2px solid #555555;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin: 0 8px;
        text-align: left;
      `;
      themesBtn.addEventListener('mousedown', () => { themesBtn.style.borderStyle = 'inset'; });
      themesBtn.addEventListener('mouseup', () => { themesBtn.style.borderStyle = 'solid'; });
      themesBtn.addEventListener('mouseleave', () => { themesBtn.style.borderStyle = 'solid'; });
      themesBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        document.querySelectorAll('[id$="-list"]').forEach(el => el.style.display = 'none');
        const list = document.getElementById('kogold-themes-list');
        if (list) list.style.display = 'block';
      });
      sidebar.appendChild(themesBtn);

      const settingsBtn = document.createElement('button');
      settingsBtn.id = 'kogold-settings-btn';
      settingsBtn.textContent = 'Settings';
      settingsBtn.style.cssText = `
        color: #ffd166;
        background: #333333;
        border: 2px solid #555555;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin: 0 8px;
        text-align: left;
      `;
      settingsBtn.addEventListener('mousedown', () => { settingsBtn.style.borderStyle = 'inset'; });
      settingsBtn.addEventListener('mouseup', () => { settingsBtn.style.borderStyle = 'solid'; });
      settingsBtn.addEventListener('mouseleave', () => { settingsBtn.style.borderStyle = 'solid'; });
      settingsBtn.addEventListener('click', (e) => { 
        e.stopPropagation();
        document.querySelectorAll('[id$="-list"]').forEach(el => el.style.display = 'none');
        const list = document.getElementById('kogold-settings-list');
        if (list) list.style.display = 'block';
      });
      sidebar.appendChild(settingsBtn);

      const creditsBtn = document.createElement('button');
      creditsBtn.id = 'kogold-credits-btn';
      creditsBtn.textContent = 'Credits';
      creditsBtn.style.cssText = `
        color: #ffd166;
        background: #333333;
        border: 2px solid #555555;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin: 0 8px;
        margin-top: auto;
        text-align: left;
      `;
      creditsBtn.addEventListener('mousedown', () => { creditsBtn.style.borderStyle = 'inset'; });
      creditsBtn.addEventListener('mouseup', () => { creditsBtn.style.borderStyle = 'solid'; });
      creditsBtn.addEventListener('mouseleave', () => { creditsBtn.style.borderStyle = 'solid'; });
      creditsBtn.addEventListener('click', (e) => { 
        e.stopPropagation();
        document.querySelectorAll('[id$="-list"]').forEach(el => el.style.display = 'none');
        const list = document.getElementById('kogold-credits-list');
        if (list) list.style.display = 'block';
      });
      sidebar.appendChild(creditsBtn);

      mainContainer.appendChild(sidebar);

      // Content area
      const content = document.createElement('div');
      content.id = 'kogold-panel-content';
      content.style.cssText = `
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;

      const settingsList = document.createElement('div');
      settingsList.id = 'kogold-settings-list';
      settingsList.style.cssText = `
        display: none;
        padding: 16px;
        background: #2a2a2a;
        overflow-y: auto;
        flex: 1;
      `;
      (async () => {
        const toggles = document.createElement('div');
        toggles.style.display = 'flex';
        toggles.style.flexDirection = 'column';
        toggles.style.gap = '12px';

        // Helper function to create custom styled toggle
        function createToggleSetting(labelText, storageKey, defaultValue) {
          const row = document.createElement('label');
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.gap = '10px';
          row.style.cursor = 'pointer';
          row.style.userSelect = 'none';
          row.style.padding = '6px 8px';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.style.width = '16px';
          checkbox.style.height = '16px';
          checkbox.style.cursor = 'pointer';
          checkbox.style.accentColor = '#ffd166';
          checkbox.checked = localStorage.getItem(storageKey) === 'true' || (defaultValue && localStorage.getItem(storageKey) === null);
          
          const label = document.createElement('span');
          label.textContent = labelText;
          label.style.fontSize = '13px';
          label.style.color = '#e0e0e0';
          label.style.fontWeight = '500';

          row.appendChild(checkbox);
          row.appendChild(label);

          return { row, checkbox };
        }

        // Avatar Editor Tweaks setting
        const { row: avatarRow, checkbox: avatarCheckbox } = createToggleSetting('Avatar Editor Tweaks', 'kogold:avatarTweaks', false);
        avatarCheckbox.addEventListener('change', () => {
          localStorage.setItem('kogold:avatarTweaks', avatarCheckbox.checked);
          if (window.KoGold_applyAvatarTweaks) window.KoGold_applyAvatarTweaks();
        });
        toggles.appendChild(avatarRow);

        // Ad Removal setting
        const { row: adsRow, checkbox: adsCheckbox } = createToggleSetting('Remove Ads', 'kogold:removeAds', true);
        adsCheckbox.addEventListener('change', () => {
          localStorage.setItem('kogold:removeAds', adsCheckbox.checked);
          if (window.KoGold_applyAdRemoval) window.KoGold_applyAdRemoval();
        });
        toggles.appendChild(adsRow);

        // API Purchaser setting
        const { row: apiRow, checkbox: apiCheckbox } = createToggleSetting('API Purchaser', 'kogold:apiPurchaser', false);
        apiCheckbox.addEventListener('change', () => {
          localStorage.setItem('kogold:apiPurchaser', apiCheckbox.checked);
        });
        toggles.appendChild(apiRow);

        // Trade Notifier setting
        const { row: tradeNotifierRow, checkbox: tradeNotifierCheckbox } = createToggleSetting('Trade Notifier (Still being worked on)', 'kogold:tradeNotifier', false);
        tradeNotifierCheckbox.addEventListener('change', () => {
          localStorage.setItem('kogold:tradeNotifier', tradeNotifierCheckbox.checked);
          if (tradeNotifierCheckbox.checked) {
            console.log('Trade Notifier enabled. Reload page for changes to take effect.');
          } else {
            console.log('Trade Notifier disabled. Reload page for changes to take effect.');
          }
        });
        toggles.appendChild(tradeNotifierRow);

        settingsList.appendChild(toggles);

        // Ban Checker button
        const bannedDiv = document.createElement('div');
        bannedDiv.style.marginTop = '12px';
        const bannedBtn = document.createElement('button');
        bannedBtn.id = 'kogold-ban-checker-btn';
        bannedBtn.textContent = 'Account Viewer';
        bannedBtn.style.color = '#ffd166';
        bannedBtn.style.background = '#333333';
        bannedBtn.style.border = '2px solid #555555';
        bannedBtn.style.padding = '8px 12px';
        bannedBtn.style.cursor = 'pointer';
        bannedBtn.style.fontSize = '12px';
        bannedBtn.style.fontWeight = 'bold';
        bannedBtn.style.width = '100%';
        bannedBtn.addEventListener('mousedown', () => { bannedBtn.style.borderStyle = 'inset'; });
        bannedBtn.addEventListener('mouseup', () => { bannedBtn.style.borderStyle = 'solid'; });
        bannedBtn.addEventListener('mouseleave', () => { bannedBtn.style.borderStyle = 'solid'; });
        bannedBtn.addEventListener('click', (e) => { 
          e.stopPropagation();
          panel.style.display = 'none';
          const backdrop = document.getElementById('kogold-backdrop');
          if (backdrop) backdrop.style.display = 'none';
          if (window.KoGold_openBannedViewer) window.KoGold_openBannedViewer();
        });
        bannedDiv.appendChild(bannedBtn);
        settingsList.appendChild(bannedDiv);
      })();
      content.appendChild(settingsList);

      const themesList = document.createElement('div');
      themesList.id = 'kogold-themes-list';
      themesList.style.cssText = `
        display: none;
        padding: 16px;
        background: #2a2a2a;
        overflow-y: auto;
        flex: 1;
        color: #e0e0e0;
      `;
      themesList.textContent = 'Loading themes...';
      content.appendChild(themesList);

      const creditsList = document.createElement('div');
      creditsList.id = 'kogold-credits-list';
      creditsList.style.cssText = `
        display: none;
        padding: 16px;
        background: #2a2a2a;
        overflow-y: auto;
        flex: 1;
        color: #e0e0e0;
      `;
      creditsList.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
          <h3 style="color: #ffd166; margin: 0 0 4px 0; font-size: 16px;">KoGold Credits</h3>
          <p style="color: #888; margin: 0; font-size: 11px;"></p>
        </div>
        <div style="margin-top: 16px;">
          <h4 style="color: #ffd166; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Coming Soon</h4>
          <p style="color: #888; font-size: 12px;">More credits and contributors will be listed here.</p>
        </div>
      `;
      content.appendChild(creditsList);

      mainContainer.appendChild(content);
      panel.appendChild(mainContainer);
      document.body.appendChild(panel);
      
      // Make backdrop clickable to close panel
      backdrop.addEventListener('click', () => {
        panel.style.display = 'none';
        backdrop.style.display = 'none';
      });
      
      return panel;
    }

    function togglePanelForButton() { 
      const panel = createPanel(); 
      const backdrop = document.getElementById('kogold-backdrop');
      if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        if (backdrop) backdrop.style.display = 'block';
      } else {
        panel.style.display = 'none';
        if (backdrop) backdrop.style.display = 'none';
      }
    }

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
