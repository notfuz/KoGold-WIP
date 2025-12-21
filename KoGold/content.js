(function () {
  let moved = false;

  function moveContainer() {
    if (moved) return;

    try {
      const profileContainer = document.querySelector(
        "div[class*='profileContainer-0-2']"
      );
      if (!profileContainer) return;

      const candidates = document.querySelectorAll(".col-12.col-lg-6.pe-0");
      if (!candidates.length) return;

      let targetDiv = candidates[0];

      targetDiv.style.width = "100%";
      targetDiv.style.maxWidth = "100%";
      targetDiv.style.flex = "0 0 100%";

      profileContainer.before(targetDiv);

      moved = true;
      observer.disconnect();
      console.log("[KoGold] Container moved successfully");
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
})();

(function () {
  window.CONTAINER_EDITS = window.CONTAINER_EDITS || [];

  window.CONTAINER_EDITS.push(
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
