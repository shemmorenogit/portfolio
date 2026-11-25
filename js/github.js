(() => {
  const apiBase = "https://api.github.com";
  const cachePrefix = "shem-portfolio:";

  async function getJson(url, key, ttl) {
    const storageKey = cachePrefix + key;
    try {
      const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (cached && Date.now() - cached.savedAt < ttl && cached.data) return cached.data;
    } catch (error) {
      console.warn("A saved GitHub response could not be read; fetching a fresh copy.", error);
    }

    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status} for ${url}`);
    }
    const data = await response.json();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), data }));
    } catch (error) {
      console.warn("GitHub data could not be cached in this browser.", error);
    }
    return data;
  }

  const username = () => (window.PORTFOLIO_CONFIG || {}).githubUsername || "shemmorenogit";
  const ttl = {
    contribution: 60 * 60 * 1000,
    events: 5 * 60 * 1000,
    repositories: 15 * 60 * 1000,
    repositoryDetails: 15 * 60 * 1000
  };

  window.PortfolioGitHub = {
    getContributions(year) {
      return getJson(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username())}?y=${encodeURIComponent(year)}`,
        `contributions:${username()}:${year}`, ttl.contribution
      );
    },
    getEvents() {
      return getJson(`${apiBase}/users/${encodeURIComponent(username())}/events/public?per_page=30`, `events:${username()}`, ttl.events);
    },
    getRepositories() {
      return getJson(`${apiBase}/users/${encodeURIComponent(username())}/repos?per_page=100&sort=updated`, `repositories:${username()}`, ttl.repositories);
    },
    getRepository(name) {
      const path = repositoryPath(name);
      return getJson(`${apiBase}/repos/${path}`, `repository:${path}`, ttl.repositoryDetails);
    },
    getLanguages(name) {
      const path = repositoryPath(name);
      return getJson(`${apiBase}/repos/${path}/languages`, `languages:${path}`, ttl.repositoryDetails);
    },
    getManualProjects() {
      const manual = Array.isArray(window.MANUAL_PROJECTS) ? window.MANUAL_PROJECTS : [];
      return manual
        .filter((project) => project && typeof project.name === "string" && project.name.trim() && !project.name.includes("[FILL IN]"))
        .map(normalizeManualProject);
    },
    async getTaggedProjects() {
      const manual = this.getManualProjects();
      const repos = await this.getRepositories();
      const githubProjects = repos
        .filter((repo) => !repo.fork && !repo.archived && Array.isArray(repo.topics) && repo.topics.includes("portfolio"))
        .map((repo) => {
          const homepage = normalizeWebUrl(repo.homepage);
          return {
            name: repo.name,
            slug: repo.name,
            fullName: repo.full_name,
            description: repo.description || "",
            repositoryUrl: repo.html_url,
            homepage,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            topics: repo.topics,
            source: "github"
          };
        });

      const merged = [...manual, ...githubProjects];
      const unique = new Map();
      merged.forEach((project) => {
        if (!project || typeof project.name !== "string" || !project.name.trim() || project.name.includes("[FILL IN]")) return;
        const key = project.name.toLowerCase();
        if (!unique.has(key)) unique.set(key, normalizeManualProject(project));
      });
      return [...unique.values()];
    },
    normalizeWebUrl
  };

  function normalizeManualProject(project) {
    return {
      ...project,
      slug: project.slug || project.name,
      fullName: project.fullName || project.repo || "",
      repositoryUrl: normalizeWebUrl(project.repositoryUrl || project.repoUrl || ""),
      homepage: normalizeWebUrl(project.homepage || project.liveUrl || "")
    };
  }

  function repositoryPath(name) {
    const parts = String(name).split("/").filter(Boolean);
    if (parts.length > 1) return parts.slice(-2).map(encodeURIComponent).join("/");
    return `${encodeURIComponent(username())}/${encodeURIComponent(name)}`;
  }

  function normalizeWebUrl(value) {
    if (typeof value !== "string" || !value.trim() || value.includes("[FILL IN]")) return "";
    try {
      const url = new URL(value.match(/^https?:\/\//i) ? value : `https://${value}`);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (error) {
      console.warn(`Skipping an invalid web address: ${value}`, error);
      return "";
    }
  }
})();
