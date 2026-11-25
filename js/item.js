(() => {
  const host = document.querySelector("[data-gallery-item]");
  const id = new URLSearchParams(window.location.search).get("id");
  const items = Array.isArray(window.GALLERY) ? window.GALLERY : [];
  const item = items.find((entry) => entry && String(entry.id) === id);
  if (!item) {
    showNotFound();
    return;
  }

  const article = document.createElement("article");
  article.className = "gallery-item-detail";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = item.type === "achievement" ? "Achievement" : "Certificate";
  const heading = document.createElement("h1");
  heading.textContent = item.title || "";
  const meta = document.createElement("div");
  meta.className = "gallery-item-detail__meta";
  if (window.PortfolioUI.isFilled(item.issuer)) {
    const issuer = document.createElement("span");
    issuer.textContent = item.issuer;
    meta.append(issuer);
  }
  if (window.PortfolioUI.isFilled(item.date)) {
    const date = document.createElement("time");
    date.textContent = item.date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) date.dateTime = item.date;
    meta.append(date);
  }

  article.append(eyebrow, heading);
  if (meta.childElementCount) article.append(meta);
  if (window.PortfolioUI.isFilled(item.image)) {
    const imageWrap = document.createElement("div");
    imageWrap.className = "gallery-item-detail__image";
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title ? `${item.title} image` : "Certificate or achievement image";
    image.addEventListener("error", () => { image.hidden = true; }, { once: true });
    imageWrap.append(image);
    article.append(imageWrap);
  }
  const story = item.story || item.shortDescription;
  if (story && !String(story).includes("[FILL IN]")) {
    const paragraph = document.createElement("p");
    paragraph.className = "gallery-item-detail__story";
    paragraph.textContent = story;
    article.append(paragraph);
  }
  const back = document.createElement("a");
  back.className = "button button--primary";
  back.href = `gallery.html?type=${encodeURIComponent(item.type)}`;
  back.textContent = "See all certificates & achievements";
  article.append(back);
  host.replaceChildren(article);
  document.title = `${item.title} — ${window.PORTFOLIO_CONFIG.name}`;
  document.querySelector('meta[property="og:title"]').content = `${item.title} — ${window.PORTFOLIO_CONFIG.name}`;
  document.querySelector('meta[property="og:description"]').content = item.shortDescription || item.title;

  function showNotFound() {
    const section = document.createElement("section");
    section.className = "detail-error";
    const heading = document.createElement("h1");
    heading.textContent = "This item isn’t here.";
    const text = document.createElement("p");
    text.textContent = "It may not have been added to the gallery yet.";
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = "gallery.html";
    link.textContent = "See all certificates & achievements";
    section.append(heading, text, link);
    host.replaceChildren(section);
  }
})();
