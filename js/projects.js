(() => {
  const grid = document.querySelector("[data-projects-grid]");
  const skeletonCount = window.innerWidth > 760 ? 4 : 2;
  grid.setAttribute("aria-label", "Portfolio projects");
  grid.replaceChildren();
  for (let index = 0; index < skeletonCount; index += 1) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.setAttribute("aria-hidden", "true");
    grid.append(skeleton);
  }
  loadProjects();

  async function loadProjects() {
    try {
      const projects = await window.PortfolioGitHub.getTaggedProjects();
      renderProjects(projects);
    } catch (error) {
      console.error("Could not load tagged projects.", error);
      const manual = window.PortfolioGitHub.getManualProjects();
      if (manual.length) {
        renderProjects(manual);
        return;
      }
      const message = document.createElement("p");
      message.className = "empty-message";
      message.textContent = "Projects could not be loaded right now. Please try again later.";
      const profile = document.createElement("a");
      profile.className = "text-link";
      profile.href = `https://github.com/${encodeURIComponent(window.PORTFOLIO_CONFIG.githubUsername)}`;
      profile.target = "_blank";
      profile.rel = "noopener noreferrer";
      profile.textContent = "Visit GitHub ↗";
      grid.replaceChildren(message, profile);
    }
  }

  function renderProjects(projects) {
    grid.replaceChildren();
    if (!projects.length) {
      const message = document.createElement("p");
      message.className = "empty-message";
      message.textContent = "Projects coming soon.";
      grid.append(message);
      return;
    }
    projects.forEach((project) => grid.append(window.PortfolioUI.createProjectCard(project)));
  }
})();
