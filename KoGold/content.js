(function () {
  function moveContainer() {
    try {
      const profileContainer = document.querySelector(
        "div[class*='profileContainer-0-2']"
      );
      if (!profileContainer) return;

      const candidates = document.querySelectorAll(".col-12.col-lg-6.pe-0");
      if (!candidates.length) return;

      let targetDiv = candidates[0];
      
      // Ensure the main target is styled and moved
      try {
        targetDiv.style.width = "100%";
        targetDiv.style.maxWidth = "100%";
        targetDiv.style.flex = "0 0 100%";

        // Move the element to just before the profile container
        if (!targetDiv.dataset.kogoldMoved) {
          profileContainer.before(targetDiv);
          targetDiv.dataset.kogoldMoved = '1';
          console.log("[KoGold] Container moved successfully");
        }
      } catch (e) {
        console.error('[KoGold] moveContainer styling/move error:', e);
      }

      // Hide any duplicate candidate elements that remain elsewhere in the DOM
      try {
        candidates.forEach((el, idx) => {
          if (idx === 0) return; // keep the moved one
          if (el.dataset.kogoldHidden) return;
          try {
            el.dataset.kogoldHidden = '1';
            el.style.setProperty('display', 'none', 'important');
          } catch (e) {}
        });
      } catch (e) {}
    } catch (e) {
      console.error("[KoGold] moveContainer error:", e);
    }
  }

  const observer = new MutationObserver(moveContainer);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  moveContainer();

  // Periodic check to ensure the container stays moved (in case DOM resets)
  setInterval(moveContainer, 3000);
})();

(function(){
  try {
    if (window.KoGold_applyContainerEdits && window.CONTAINER_EDITS) {
      try { window.KoGold_applyContainerEdits(); } catch(e) {}
    }
  } catch (e) {}
})();

(function(){
  try {
    if (window.KoGold_applyContainerEdits && window.CONTAINER_EDITS) {
      try { window.KoGold_applyContainerEdits(); } catch(e) {}
    }
  } catch (e) {}
})();

(function () {
  function applyWidthOnly() {
    try {
      const targets = document.querySelectorAll(".col-12.col-lg-6.ps-0");
      if (!targets.length) return;

      targets.forEach(el => {
        el.style.width = "100%";
        el.style.maxWidth = "100%";
        el.style.flex = "0 0 100%";
      });
    } catch (e) {
      console.error("[KoGold] width-only error:", e);
    }
  }

  applyWidthOnly();

  const widthObserver = new MutationObserver(applyWidthOnly);
  widthObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Periodic check to ensure width styles stick
  setInterval(applyWidthOnly, 3000);
})();

(function () {
  window.CONTAINER_EDITS = window.CONTAINER_EDITS || [];

  window.CONTAINER_EDITS.push(
    {
      selector: "[class*='uselessFuckingClass-0-2']",
      styles: { width: "100%" }
    },
    {
      selector: ".section-content",
      styles: {
        backgroundColor: "#ffffff01",
        boxShadow: "none"
      }
    },
    {
      selector: "[class*='containerHeader-0-2']",
      styles: { width: "85.75%" }
    }
  );
})();

(function(){
  try {
    if (window.KoGold_applyContainerEdits && window.CONTAINER_EDITS) {
      try { window.KoGold_applyContainerEdits(); } catch(e) {}
    }
  } catch (e) {}
})();
