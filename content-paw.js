(function(){
  try {
    const targetUserId = '14159';
    if (!location.href.includes('/users/' + targetUserId + '/profile')) return;
    const selector = 'span.icon-obc.bcIcon-0-2-114';
    const KoGold_pawDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVBwOKOGSoTnZREcdSxSJYKG2FVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoC4C06KLlLi/5JCixgPjvvx7t7j7h0gNKtMs3pigKbbZjoRl3L5VSn0ijBECIhiWGaWkcwsZuE7vu4R4OtdlGf5n/tzDKgFiwEBiTjGDNMm3iCe3bQNzvvEIivLKvE58aRJFyR+5Lri8RvnkssCzxTNbHqeWCSWSl2sdDErmxrxDHFE1XTKF3Ieq5y3OGvVOmvfk78wXNBXMlynOYYElpBEChIU1FFBFTb1VYFOioU07cd9/KOuP0UuhVwVMHIsoAYNsusH/4Pf3VrF6SkvKRwHel8c52McCO0CrYbjfB87TusECD4DV3rHX2sCc5+kNzpa5AgY3AYurjuasgdc7gAjT4Zsyq4UpCkUi8D7GX1THhi6BfrXvN7a+zh9ALLU1fINcHAITJQoe93n3X3dvf17pt3fD79LcsU6J7PCAAAABmJLR0QA/wCYANk/KP/LAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH6QwUAwECEkcjFwAAAOhJREFUSMfdVsENwyAMxIZZyLNDdIbswBrZIjNko2aBLFFBH1Wj1oLEBlOptZRHJPDZx53BmH8PqNmU5lvaE4QBugK+g9WAogZNuSJK4XrQJu6QVvz8T8Dt9vU1UZrmNUqpzYGinuB5DKBUHLB5WxB8lsJxXGxbhxNECgphgNKZLdfL/VSlRwl2UKaHqcKRu1CamD1pPvy3eWsmiBKvUmZoIcCZGHTTEd1nnYoTccdYCVhsi9a1isbngWKLMmtAkcP9qS8F4TQ82Hw9qb5hSPGuZ3LRjd9jrIkoheBR47wFZwjpm+L63XgA2YZ5p2EE1r0AAAAASUVORK5CYII=';
    const alternateSelectors = [
      'span.icon-obc.bcIcon-0-2-114',
      'span[class*="icon-obc"]',
      'span[class*="bcIcon"]',
      'span[class^="icon-obc"]',
      'span[class^="bcIcon"]'
    ];

    function normalizeIconClasses() {
      try {
        const els = document.querySelectorAll('span.icon-obc');
        els.forEach(el => {
          try {
            const toRemove = Array.from(el.classList).filter(c => c.startsWith('bcIcon') || c.startsWith('bcIcon-'));
            toRemove.forEach(c => el.classList.remove(c));
          } catch (e) {}
        });
      } catch (e) {}
    }

    function applyPaw() {
      try {
        let matched = Array.from(document.querySelectorAll(selector));
        if (!matched.length) {
          for (const s of alternateSelectors) {
            try {
              const found = Array.from(document.querySelectorAll(s));
              if (found.length) matched = matched.concat(found);
            } catch (e) {}
          }
        }
        const unique = Array.from(new Set(matched));
        unique.forEach(el => {
          try {
            if (el.dataset.pawApplied) return;
            el.dataset.pawApplied = '1';
            try { el.style.backgroundImage = 'url("' + KoGold_pawDataUrl + '")'; } catch (e) { el.style.backgroundImage = 'url("https://i.imgur.com/ffZwPVV.png")'; }
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'left';
            el.style.verticalAlign = 'top';
            el.style.backgroundSize = 'contain';
            el.style.display = 'inline-block';
          } catch (e) {}
        });
      } catch (e) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { normalizeIconClasses(); applyPaw(); });
    } else { normalizeIconClasses(); applyPaw(); }
    new MutationObserver(() => { normalizeIconClasses(); applyPaw(); }).observe(document.body, { childList: true, subtree: true });

    setInterval(() => { normalizeIconClasses(); applyPaw(); }, 3000);

    ['click', 'focus', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        setTimeout(() => { normalizeIconClasses(); applyPaw(); }, 100);
      }, true);
    });

    window.KoGold_applyPaw = applyPaw;
  } catch (e) {}
})();
