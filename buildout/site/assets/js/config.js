/* Site configuration. Loaded first on every page. */
window.Site = {
  config: {
    dataUrl: 'data/inventory.json',   // replace with the inventory feed; the shape is in HANDOFF.md
    externalLinks: false              // preview guard: false blocks every link that leaves this site (incl. tel:)
  }
};
