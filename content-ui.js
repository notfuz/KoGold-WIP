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
      panel.style.width = '900px';
      panel.style.height = '600px';
      panel.style.background = '#2a2a2a';
      panel.style.color = '#000000';
      panel.style.padding = '0';
      // panel stays hidden until toggled
      // (avoid setting to 'flex' here to prevent first-click hide/show bug)
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

      // Support Development button in sidebar
      const supportBtn = document.createElement('button');
      supportBtn.id = 'kogold-support-btn';
      supportBtn.textContent = 'Support Development';
      supportBtn.style.cssText = `
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
      supportBtn.addEventListener('mousedown', () => { supportBtn.style.borderStyle = 'inset'; });
      supportBtn.addEventListener('mouseup', () => { supportBtn.style.borderStyle = 'solid'; });
      supportBtn.addEventListener('mouseleave', () => { supportBtn.style.borderStyle = 'solid'; });
      supportBtn.addEventListener('click', (e) => { 
        e.stopPropagation();
        document.querySelectorAll('[id$="-list"]').forEach(el => el.style.display = 'none');
        const list = document.getElementById('kogold-support-list');
        if (list) list.style.display = 'block';
      });
      sidebar.insertBefore(supportBtn, creditsBtn);

      mainContainer.appendChild(sidebar);

      // Content area
      const content = document.createElement('div');
      content.id = 'kogold-panel-content';
      content.style.cssText = `
        flex: 1 1 0%;
        overflow: hidden;
        display: block;
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

        // Trade Notifier setting - DISABLED FOR NOW
        const { row: tradeNotifierRow, checkbox: tradeNotifierCheckbox } = createToggleSetting('Trade Notifier (Still being worked on)', 'kogold:tradeNotifier', false);
        // Disable the Trade Notifier toggle temporarily
        tradeNotifierCheckbox.disabled = true;
        tradeNotifierCheckbox.style.opacity = '0.5';
        tradeNotifierRow.style.opacity = '0.5';
        tradeNotifierRow.style.pointerEvents = 'none';
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

      // Support Development section (Tier buttons)
      const supportDiv = document.createElement('div');
      supportDiv.id = 'kogold-support-list';
      supportDiv.style.cssText = `
        display: none;
        padding: 16px;
        background: #2a2a2a;
        overflow-y: auto;
        border-top: 2px solid #444;
        flex: 1;
      `;

      const supportTitle = document.createElement('div');
      supportTitle.textContent = 'Support Development';
      supportTitle.style.cssText = 'color:#ffd166;font-weight:700;font-size:13px;';
      supportDiv.appendChild(supportTitle);

      const tierRow = document.createElement('div');
      tierRow.style.cssText = 'display:flex;gap:8px;align-items:center';

      // Helper to create tier buttons
      function makeTierButton(label, href, color) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = `
          padding: 10px 14px;
          font-weight:700;
          font-size:13px;
          cursor:pointer;
          border:2px solid rgba(0,0,0,0.3);
          border-radius:6px;
          background:${color || '#333333'};
          color:#fff;
        `;
        if (href) {
          btn.addEventListener('click', (e) => { e.stopPropagation(); window.open(href, '_blank'); });
        }
        return btn;
      }

      // Tier buttons (all currently point to the provided gamepass URL)
      const tier1Url = 'https://www.pekora.zip/catalog/436966/KoGold-Tier-1';
      const tier2Url = 'https://www.pekora.zip/catalog/436968/KoGold-Tier-2';
      const tier3Url = 'https://www.pekora.zip/catalog/436970/KoGold-Tier-3';
      const tier1Btn = makeTierButton('Tier 1', tier1Url, '#2e7d32');
      const tier2Btn = makeTierButton('Tier 2', tier2Url, '#ab47bc');
      const tier3Btn = makeTierButton('Tier 3', tier3Url, '#2196f3');

      tierRow.appendChild(tier1Btn);
      tierRow.appendChild(tier2Btn);
      tierRow.appendChild(tier3Btn);
      supportDiv.appendChild(tierRow);

      // Ownership check (best-effort)
      (async function checkOwnership() {
        try {
          // get authenticated user id
          const authResp = await fetch('https://www.pekora.zip/apisite/users/v1/users/authenticated', { credentials: 'include' });
          if (!authResp.ok) return;
          const auth = await authResp.json();
          const userId = auth && auth.id;
          if (!userId) return;

          async function checkAssetOwned(assetId) {
            try {
              // Best-effort ownership endpoint similar to Roblox
              const url = `https://www.pekora.zip/ownership/hasasset?userId=${userId}&assetId=${assetId}`;
              const r = await fetch(url, { credentials: 'include' });
              if (!r.ok) return false;
              const txt = await r.text();
              // endpoint may return plain true/false or JSON
              if (txt.trim() === 'true') return true;
              if (txt.trim() === 'false') return false;
              try { const j = JSON.parse(txt); return !!j; } catch { return false; }
            } catch (e) { return false; }
          }

          const ownedTier1 = await checkAssetOwned(436966);
          if (ownedTier1) {
            tier1Btn.textContent = 'Tier 1 — Owned';
            tier1Btn.disabled = true;
            tier1Btn.style.opacity = '0.8';
            tier1Btn.addEventListener('click', (e) => e.stopPropagation());
          }
          const ownedTier2 = await checkAssetOwned(436968);
          if (ownedTier2) {
            tier2Btn.textContent = 'Tier 2 — Owned';
            tier2Btn.disabled = true;
            tier2Btn.style.opacity = '0.8';
            tier2Btn.addEventListener('click', (e) => e.stopPropagation());
          }
          const ownedTier3 = await checkAssetOwned(436970);
          if (ownedTier3) {
            tier3Btn.textContent = 'Tier 3 — Owned';
            tier3Btn.disabled = true;
            tier3Btn.style.opacity = '0.8';
            tier3Btn.addEventListener('click', (e) => e.stopPropagation());
          }
        } catch (e) { console.warn('Support ownership check failed', e); }
      })();

      content.appendChild(supportDiv);

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
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="color: #ffd166; margin: 0 0 4px 0; font-size: 16px;">KoGold Credits</h3>
          <p style="color: #888; margin: 0; font-size: 11px;">Thanks to everyone who contributed and tested.</p>
        </div>
        <div style="margin-top: 8px; display:flex; gap:12px; flex-direction:column;">
          <div>
            <h4 style="color: #ffd166; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Owner</h4>
            <div style="color:#e0e0e0; font-size:13px; padding:8px; border:2px solid #555555; background:#2a2a2a;">
              <div style="font-weight:700; color:#ffd166;">fuz</div>
              <div style="color:#999; font-size:12px;">ID: 14159</div>
            </div>
          </div>

          <div>
            <h4 style="color: #ffd166; margin: 8px 0 8px 0; font-size: 12px; text-transform: uppercase;">Other Extension Owners</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="padding:8px;border:2px solid #555555;background:#2a2a2a;color:#e0e0e0;">
                <div style="font-weight:700;">this guy</div>
                <div style="color:#999;font-size:12px;">ID: 1234</div>
              </div>
              <div style="padding:8px;border:2px solid #555555;background:#2a2a2a;color:#e0e0e0;">
                <div style="font-weight:700;">this guy aswell</div>
                <div style="color:#999;font-size:12px;">ID: 12345</div>
              </div>
            </div>
          </div>

          <div>
            <h4 style="color: #ffd166; margin: 8px 0 8px 0; font-size: 12px; text-transform: uppercase;">Testers</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="padding:8px;border:2px solid #555555;background:#2a2a2a;color:#e0e0e0;">
                <div style="font-weight:700;">this guy</div>
                <div style="color:#999;font-size:12px;">ID: 234</div>
              </div>
              <div style="padding:8px;border:2px solid #555555;background:#2a2a2a;color:#e0e0e0;">
                <div style="font-weight:700;">look at this guy</div>
                <div style="color:#999;font-size:12px;">ID: 234567</div>
              </div>
            </div>
          </div>
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
        // ensure no content list is shown by default
        document.querySelectorAll('[id$="-list"]').forEach(el => el.style.display = 'none');
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
      // Use capturing pointerdown to open the panel immediately and prevent other handlers
      btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); togglePanelForButton(); }, true);
      // also handle keyboard activation
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePanelForButton(); } });
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
