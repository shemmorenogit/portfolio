(() => {
  const grid = document.querySelector("[data-gallery-grid]");
  const filters = document.querySelector("[data-gallery-filters]");
  const selectedType = new URLSearchParams(window.location.search).get("type");
  const type = selectedType === "certificate" || selectedType === "achievement" ? selectedType : "all";
  const items = Array.isArray(window.GALLERY) ? window.GALLERY.filter(isValidItem) : [];
  const shown = type === "all" ? items : items.filter((item) => item.type === type);

  filters.querySelectorAll("[data-filter]").forEach((link) => {
    if (link.dataset.filter === type) link.setAttribute("aria-current", "page");
  });
  if (!shown.length) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = "Coming soon.";
    grid.append(message);
    return;
  }
  shown.forEach((item) => grid.append(window.PortfolioUI.createGalleryCard(item)));

  function isValidItem(item) {
    return item && typeof item.id === "string" && item.id.trim() &&
      typeof item.title === "string" && item.title.trim() &&
      !item.id.includes("[FILL IN]") && !item.title.includes("[FILL IN]") &&
      (item.type === "certificate" || item.type === "achievement");
  }
})();
