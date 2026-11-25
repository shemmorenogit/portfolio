(() => {
  const config = window.PORTFOLIO_CONFIG || {};
  document.body.classList.add("has-js");

  document.querySelectorAll("[data-config]").forEach((element) => {
    const value = config[element.dataset.config];
    if (typeof value === "string" && value.trim()) element.textContent = value;
  });

  const username = config.githubUsername || "shemmorenogit";
  document.querySelectorAll("[data-profile-link]").forEach((link) => {
    link.href = `https://github.com/${encodeURIComponent(username)}`;
    link.textContent = `@${username}`;
  });
  const profilePhoto = document.querySelector(".profile-photo");
  if (profilePhoto) {
    profilePhoto.src = `https://github.com/${encodeURIComponent(username)}.png?size=400`;
    profilePhoto.alt = `${config.name || username}'s GitHub profile photo`;
    profilePhoto.addEventListener("error", () => {
      profilePhoto.hidden = true;
      const note = document.createElement("p");
      note.className = "api-message";
      note.textContent = "The GitHub profile photo could not be loaded.";
      profilePhoto.after(note);
    }, { once: true });
  }

  setLink("[data-social='github']", `https://github.com/${username}`);
  setLink("[data-social='email']", config.email, "email");
  setLink("[data-social='instagram']", config.instagramUrl);
  setLink("[data-social='phone']", config.phone, "tel");
  setLink("[data-social='whatsapp']", config.whatsapp, "whatsapp");

  const extraHost = document.querySelector("[data-extra-social-links]");
  if (extraHost && Array.isArray(config.extraSocialLinks)) {
    config.extraSocialLinks.forEach((item) => {
      if (!item || !isFilled(item.label) || !isFilled(item.url)) return;
      const url = window.PortfolioGitHub.normalizeWebUrl(item.url);
      if (!url) return;
      const link = document.createElement("a");
      link.className = "social-link social-link--text";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.label.trim().slice(0, 2).toUpperCase();
      link.setAttribute("aria-label", item.label);
      extraHost.append(link);
    });
  }

  const revealItems = document.querySelectorAll(".section, .page-heading, .project-detail, .gallery-item-detail, .not-found");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    revealItems.forEach((element) => element.classList.add("fade-up"));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    revealItems.forEach((element) => observer.observe(element));
  }

  function isFilled(value) {
    return typeof value === "string" && value.trim() !== "" && !value.includes("[FILL IN]");
  }

  function setLink(selector, value, kind) {
    const link = document.querySelector(selector);
    if (!link || !isFilled(value)) {
      if (link) link.hidden = true;
      return;
    }
    if (kind === "tel") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 6) { link.hidden = true; return; }
      link.href = `tel:${value.replace(/[^\d+]/g, "")}`;
    }
    else if (kind === "whatsapp") {
      const digits = value.replace(/\D/g, "");
      if (!digits) { link.hidden = true; return; }
      link.href = `https://wa.me/${digits}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else if (kind === "email") {
      link.href = `mailto:${value.trim()}`;
    } else {
      const url = window.PortfolioGitHub.normalizeWebUrl(value);
      if (!url) { link.hidden = true; return; }
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.hidden = false;
  }

  function createProjectCard(project) {
    const notes = window.PROJECT_NOTES || {};
    const note = notes[project.name] || {};
    const card = document.createElement("article");
    card.className = "project-card";

    const detailUrl = `project.html?slug=${encodeURIComponent(project.slug || project.name)}`;
    const imageLink = document.createElement("a");
    imageLink.className = "project-card__image-link";
    imageLink.href = detailUrl;
    imageLink.setAttribute("aria-label", `View ${project.name} project details`);
    const imageArea = document.createElement("div");
    imageArea.className = "project-card__image";
    imageArea.setAttribute("aria-hidden", "true");
    const candidates = getProjectImageCandidates(project, note);
    if (candidates.length) {
      const image = document.createElement("img");
      image.src = candidates[0];
      image.alt = "";
      image.loading = "lazy";
      let candidateIndex = 0;
      image.addEventListener("error", () => {
        candidateIndex += 1;
        if (candidateIndex < candidates.length) image.src = candidates[candidateIndex];
        else showProjectInitial(imageArea, project.name);
      });
      imageArea.append(image);
    } else showProjectInitial(imageArea, project.name);
    imageLink.append(imageArea);

    const info = document.createElement("div");
    info.className = "project-card__info";
    const title = document.createElement("h2");
    title.textContent = project.name;
    const link = document.createElement("a");
    link.className = "button button--small";
    link.href = detailUrl;
    link.textContent = "View website";
    info.append(title, link);
    card.append(imageLink, info);
    return card;
  }

  function getProjectImageCandidates(project, note) {
    const candidates = [];
    const customImage = note.image || project.image;
    if (isFilled(customImage)) candidates.push(customImage.trim());
    if (project.homepage) candidates.push(`https://image.thum.io/get/width/900/crop/600/${project.homepage}`);
    const fullName = project.fullName || project.repo;
    if (isFilled(fullName)) {
      const repoPath = String(fullName).includes("/") ? String(fullName) : `${username}/${fullName}`;
      candidates.push(`https://opengraph.githubassets.com/1/${repoPath}`);
    }
    return [...new Set(candidates)];
  }

  function showProjectInitial(container, projectName) {
    const initial = document.createElement("span");
    initial.className = "project-card__initial";
    initial.textContent = String(projectName || "?").trim().charAt(0).toUpperCase() || "?";
    container.replaceChildren(initial);
  }

  function createGalleryCard(item) {
    const link = document.createElement("a");
    link.className = "gallery-card";
    link.href = `item.html?id=${encodeURIComponent(item.id)}`;
    const imageWrap = document.createElement("span");
    imageWrap.className = "gallery-card__image";
    if (isFilled(item.image)) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => { image.hidden = true; }, { once: true });
      imageWrap.append(image);
    }
    const title = document.createElement("span");
    title.className = "gallery-card__title";
    title.textContent = item.title || "Untitled item";
    const date = document.createElement("span");
    date.className = "gallery-card__date";
    date.textContent = isFilled(item.date) ? item.date : "";
    link.append(imageWrap, title, date);
    link.setAttribute("aria-label", [item.title, item.type, item.date].filter(Boolean).join(", "));
    return link;
  }

  window.PortfolioUI = {
    createProjectCard,
    createGalleryCard,
    getProjectImageCandidates,
    showProjectInitial,
    isFilled
  };
})();
