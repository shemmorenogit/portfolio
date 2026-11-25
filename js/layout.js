(() => {
  const config = window.PORTFOLIO_CONFIG || {};
  const username = config.githubUsername || "github";
  const name = config.name || "Portfolio";
  const headerHost = document.querySelector("[data-site-header]");
  const footerHost = document.querySelector("[data-site-footer]");

  if (headerHost) {
    headerHost.innerHTML = `
      <header class="site-header page-width">
        <a class="site-brand" href="index.html" aria-label="Home">${escapeText(name)}<span aria-hidden="true">.</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
          <span class="menu-toggle__text">Menu</span><span class="menu-toggle__icon" aria-hidden="true"><i></i><i></i></span>
        </button>
        <nav class="site-nav" id="primary-navigation" aria-label="Main navigation">
          <a data-nav="projects" href="projects.html">Projects</a>
          <a data-nav="certificate" href="gallery.html?type=certificate">Certificates</a>
          <a data-nav="achievement" href="gallery.html?type=achievement">Achievements</a>
          <a data-nav="contacts" href="index.html#contacts">Contacts</a>
          <a class="mobile-profile-link" href="https://github.com/${encodeURIComponent(username)}" target="_blank" rel="noopener noreferrer">@${escapeText(username)} ↗</a>
        </nav>
      </header>`;

    const page = window.location.pathname.split("/").pop() || "index.html";
    let galleryType = new URLSearchParams(window.location.search).get("type");
    if (page === "item.html") {
      const id = new URLSearchParams(window.location.search).get("id");
      const gallery = Array.isArray(window.GALLERY) ? window.GALLERY : [];
      const item = gallery.find((entry) => entry && String(entry.id) === id);
      if (item) galleryType = item.type;
    }
    const active = page === "projects.html" || page === "project.html" ? "projects"
      : page === "gallery.html" || page === "item.html" ? (galleryType === "achievement" ? "achievement" : galleryType === "certificate" ? "certificate" : "")
      : page === "index.html" && window.location.hash === "#contacts" ? "contacts" : "";
    if (active) {
      const activeLink = headerHost.querySelector(`[data-nav="${active}"]`);
      if (activeLink) activeLink.setAttribute("aria-current", "page");
    }
    const pageTitles = {
      "index.html": "Home",
      "projects.html": "Projects",
      "project.html": "Project",
      "gallery.html": "Certificates & Achievements",
      "item.html": "Gallery item",
      "cv.html": "CV",
      "404.html": "Page not found"
    };
    document.title = `${pageTitles[page] || "Portfolio"} — ${name}`;
    const openGraphTitle = document.querySelector('meta[property="og:title"]');
    if (openGraphTitle) openGraphTitle.content = document.title;

    const toggle = headerHost.querySelector(".menu-toggle");
    const nav = headerHost.querySelector(".site-nav");
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-is-open", open);
      if (open) nav.querySelector("a").focus();
      else toggle.focus();
    };
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
      if (event.key === "Tab" && toggle.getAttribute("aria-expanded") === "true") {
        const links = [...nav.querySelectorAll("a")];
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (footerHost) {
    footerHost.innerHTML = `
      <footer class="site-footer page-width">
        <a class="site-brand" href="index.html">${escapeText(name)}<span aria-hidden="true">.</span></a>
        <p>© <span data-current-year></span> ${escapeText(name)}</p>
        <a class="text-link" href="index.html#main">Back to top ↑</a>
      </footer>`;
    footerHost.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
  }

  function escapeText(text) {
    return String(text).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }
})();
