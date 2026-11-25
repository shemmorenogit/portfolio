(() => {
  const host = document.querySelector("[data-project-detail]");
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    showNotFound();
    return;
  }
  loadProject();

  async function loadProject() {
    try {
      const projects = await window.PortfolioGitHub.getTaggedProjects();
      const project = projects.find((item) =>
        item.slug === slug || item.name === slug || item.fullName === slug
      );
      if (!project) {
        showNotFound();
        return;
      }
      renderProject(project);
    } catch (error) {
      console.error("Could not load the project details.", error);
      const manual = window.PortfolioGitHub.getManualProjects();
      const project = manual.find((item) => item && (item.slug === slug || item.name === slug));
      if (project) {
        renderProject({
          ...project,
          slug: project.slug || project.name,
          fullName: project.fullName || project.repo || "",
          repositoryUrl: window.PortfolioGitHub.normalizeWebUrl(project.repositoryUrl || project.repoUrl || ""),
          homepage: window.PortfolioGitHub.normalizeWebUrl(project.homepage || project.liveUrl || "")
        });
      } else showError();
    }
  }

  function renderProject(project) {
    const notes = window.PROJECT_NOTES || {};
    const note = notes[project.name] || {};
    host.replaceChildren();
    const article = document.createElement("article");
    article.className = "project-detail";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Project";
    const heading = document.createElement("h1");
    heading.textContent = project.name;
    const description = document.createElement("p");
    description.className = "project-detail__description";
    description.textContent = project.description || "";
    description.hidden = !window.PortfolioUI.isFilled(project.description);

    const imageArea = document.createElement("div");
    imageArea.className = "project-detail__image";
    const candidates = window.PortfolioUI.getProjectImageCandidates(project, note);
    if (candidates.length) {
      const image = document.createElement("img");
      image.src = candidates[0];
      image.alt = `${project.name} website preview`;
      let candidateIndex = 0;
      image.addEventListener("error", () => {
        candidateIndex += 1;
        if (candidateIndex < candidates.length) image.src = candidates[candidateIndex];
        else window.PortfolioUI.showProjectInitial(imageArea, project.name);
      });
      imageArea.append(image);
    } else window.PortfolioUI.showProjectInitial(imageArea, project.name);

    const actions = document.createElement("div");
    actions.className = "project-detail__actions";
    if (project.homepage) {
      const website = document.createElement("a");
      website.className = "button button--primary";
      website.href = project.homepage;
      website.target = "_blank";
      website.rel = "noopener noreferrer";
      website.textContent = "Open website ↗";
      actions.append(website);
    }
    if (project.repositoryUrl) {
      const repository = document.createElement("a");
      repository.className = "button";
      repository.href = project.repositoryUrl;
      repository.target = "_blank";
      repository.rel = "noopener noreferrer";
      repository.textContent = "View repository ↗";
      actions.append(repository);
    }

    article.append(eyebrow, heading, description, imageArea, actions);
    if (typeof note.why === "string" && note.why.trim() && !note.why.includes("[FILL IN]")) {
      const why = document.createElement("section");
      why.className = "surface project-detail__why";
      const whyHeading = document.createElement("h2");
      whyHeading.textContent = "Why I made it";
      const whyText = document.createElement("p");
      whyText.textContent = note.why;
      why.append(whyHeading, whyText);
      article.append(why);
    }

    const insights = document.createElement("section");
    insights.className = "surface insights-card";
    insights.hidden = true;
    article.append(insights);
    article.append(createShareCard(project));

    const want = document.createElement("section");
    want.className = "surface want-card";
    const wantCopy = document.createElement("div");
    const wantHeading = document.createElement("h2");
    wantHeading.textContent = "Want one?";
    const wantText = document.createElement("p");
    wantText.textContent = "Tell me what you have in mind.";
    wantCopy.append(wantHeading, wantText);
    const contactLink = document.createElement("a");
    contactLink.className = "button button--primary";
    contactLink.href = "index.html#contacts";
    contactLink.textContent = "Get in touch";
    want.append(wantCopy, contactLink);
    article.append(want);
    host.append(article);

    document.title = `${project.name} — ${window.PORTFOLIO_CONFIG.name}`;
    setOpenGraph(project.name, project.description || "A project from my portfolio.");
    loadInsights(project, insights);
  }

  async function loadInsights(project, card) {
    const repositoryName = project.fullName || project.repo;
    if (!window.PortfolioUI.isFilled(repositoryName)) return;
    const results = await Promise.allSettled([
      window.PortfolioGitHub.getRepository(repositoryName),
      window.PortfolioGitHub.getLanguages(repositoryName)
    ]);
    const repository = results[0].status === "fulfilled" ? results[0].value : null;
    const languages = results[1].status === "fulfilled" ? results[1].value : null;
    if (results.some((result) => result.status === "rejected")) {
      console.warn("Some live GitHub insights could not be loaded.");
    }

    const heading = document.createElement("h2");
    heading.textContent = "Live insights";
    card.append(heading);
    const stats = document.createElement("div");
    stats.className = "insights-grid";
    if (repository) {
      addInsight(stats, "Created", formatDate(repository.created_at));
      addInsight(stats, "Last updated", formatDate(repository.updated_at));
      if (typeof repository.stargazers_count === "number") addInsight(stats, "Stars", repository.stargazers_count.toLocaleString());
    }

    const languageEntries = languages ? Object.entries(languages) : [];
    const totalBytes = languageEntries.reduce((sum, entry) => sum + entry[1], 0);
    if (languageEntries.length && totalBytes > 0) {
      const languageInsight = document.createElement("div");
      languageInsight.className = "insight";
      const label = document.createElement("span");
      label.textContent = "Languages";
      const list = document.createElement("div");
      list.className = "languages-list";
      languageEntries.sort((left, right) => right[1] - left[1]).forEach(([language, bytes]) => {
        const percentage = Math.round(bytes / totalBytes * 1000) / 10;
        const row = document.createElement("div");
        row.className = "language-row";
        const name = document.createElement("span");
        name.textContent = language;
        const bar = document.createElement("span");
        bar.className = "language-bar";
        bar.setAttribute("aria-label", `${language}: ${percentage}%`);
        bar.style.setProperty("--language-share", `${percentage}%`);
        const fill = document.createElement("span");
        bar.append(fill);
        const amount = document.createElement("span");
        amount.textContent = `${percentage}%`;
        row.append(name, bar, amount);
        list.append(row);
      });
      languageInsight.append(label, list);
      stats.append(languageInsight);
    }

    if (stats.childElementCount) {
      card.append(stats);
      card.hidden = false;
    }
  }

  function addInsight(hostElement, labelText, value) {
    if (value === undefined || value === null || value === "") return;
    const item = document.createElement("div");
    item.className = "insight";
    const label = document.createElement("span");
    label.textContent = labelText;
    const text = document.createElement("strong");
    text.textContent = String(value);
    item.append(label, text);
    hostElement.append(item);
  }

  function createShareCard(project) {
    const section = document.createElement("section");
    section.className = "surface share-card";
    const heading = document.createElement("h2");
    heading.textContent = "Share this project";
    const actions = document.createElement("div");
    actions.className = "share-actions";
    const shareButton = document.createElement("button");
    shareButton.className = "button button--primary";
    shareButton.type = "button";
    shareButton.textContent = "Share";
    const copyButton = document.createElement("button");
    copyButton.className = "button";
    copyButton.type = "button";
    copyButton.textContent = "Copy link";
    const status = document.createElement("p");
    status.className = "share-status";
    status.setAttribute("role", "status");
    const url = window.location.href;
    const shareText = `${project.name} — ${window.PORTFOLIO_CONFIG.name}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);
    const services = [
      ["WhatsApp", `https://wa.me/?text=${encodedText}%20${encodedUrl}`],
      ["X", `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`],
      ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
      ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
      ["Telegram", `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`]
    ];
    const links = services.map(([label, href]) => {
      const link = document.createElement("a");
      link.className = "button";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      return link;
    });
    actions.append(shareButton, copyButton, ...links);
    section.append(heading, actions, status);
    copyButton.addEventListener("click", async () => {
      const copied = await copyText(url);
      status.textContent = copied ? "Copied!" : "Could not copy the link. You can select it from the address bar.";
    });
    shareButton.addEventListener("click", async () => {
      if (!navigator.share) {
        const copied = await copyText(url);
        status.textContent = copied ? "Web Share is not available, so the link was copied." : "Use one of the share links below.";
        return;
      }
      try {
        await navigator.share({ title: project.name, text: shareText, url });
        status.textContent = "Shared.";
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("The project could not be shared.", error);
          status.textContent = "Sharing is unavailable. Use one of the share links below.";
        }
      }
    });
    return section;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) console.error("Could not copy the project URL.", error);
      return copied;
    }
  }

  function showNotFound() {
    const section = document.createElement("section");
    section.className = "detail-error";
    const heading = document.createElement("h1");
    heading.textContent = "Project not found.";
    const text = document.createElement("p");
    text.textContent = "This project may have been removed or is not tagged for the portfolio yet.";
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = "projects.html";
    link.textContent = "Back to projects";
    section.append(heading, text, link);
    host.replaceChildren(section);
  }

  function showError() {
    const section = document.createElement("section");
    section.className = "detail-error";
    const heading = document.createElement("h1");
    heading.textContent = "Project details are unavailable.";
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = "projects.html";
    link.textContent = "Back to projects";
    section.append(heading, link);
    host.replaceChildren(section);
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function setOpenGraph(title, description) {
    document.querySelector('meta[property="og:title"]').content = `${title} — ${window.PORTFOLIO_CONFIG.name}`;
    document.querySelector('meta[property="og:description"]').content = description;
  }
})();
