(() => {
  const config = window.PORTFOLIO_CONFIG || {};
  const username = config.githubUsername || "shemmorenogit";
  const githubProfile = `https://github.com/${encodeURIComponent(username)}`;
  let contributionRequest = 0;
  let displayedContributionYear = null;
  let hasActivityData = false;

  loadContributions();
  loadActivity();
  loadHomeProjects();
  loadHomeGallery();
  window.setInterval(() => {
    if (document.visibilityState === "visible") loadActivity();
  }, 6 * 60 * 1000);
  window.setInterval(() => {
    if (document.visibilityState === "visible") loadContributions(getSelectedContributionYear());
  }, 11 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    loadActivity();
    loadContributions(getSelectedContributionYear());
  });

  async function loadContributions(year) {
    const requestId = ++contributionRequest;
    const currentYear = new Date().getFullYear();
    const selectedYear = year || Math.max(2026, currentYear);
    const picker = document.querySelector("[data-year-picker]");
    const total = document.querySelector("[data-contribution-total]");
    const message = document.querySelector("[data-contribution-message]");
    const years = [];
    for (let item = 2026; item <= currentYear; item += 1) years.push(item);
    if (!years.includes(selectedYear)) years.push(selectedYear);
    years.sort((left, right) => left - right);

    const buttons = Array.from(picker.querySelectorAll(".year-button"));
    const pickerNeedsUpdate = buttons.length !== years.length ||
      buttons.some((button, index) => Number(button.textContent) !== years[index]);
    if (pickerNeedsUpdate) {
      picker.replaceChildren();
      years.forEach((item) => {
        const button = document.createElement("button");
        button.className = "year-button";
        button.type = "button";
        button.textContent = String(item);
        button.addEventListener("click", () => loadContributions(item));
        picker.append(button);
      });
    }
    picker.querySelectorAll(".year-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.textContent) === selectedYear));
    });

    const showingSelectedYear = displayedContributionYear === selectedYear;
    const previousTotal = total.textContent;
    if (!showingSelectedYear) total.textContent = `Loading ${selectedYear}…`;
    message.replaceChildren();
    try {
      const data = await window.PortfolioGitHub.getContributions(selectedYear);
      if (requestId !== contributionRequest) return;
      const days = Array.isArray(data.contributions) ? data.contributions : [];
      const totalCount = typeof data.total === "number"
        ? data.total
        : (data.total && typeof data.total[selectedYear] === "number"
          ? data.total[selectedYear]
          : days.reduce((sum, day) => sum + (Number(day.count) || 0), 0));
      total.textContent = `${totalCount.toLocaleString()} contributions in ${selectedYear}`;
      renderContributionGrid(days, selectedYear);
      displayedContributionYear = selectedYear;
    } catch (error) {
      if (requestId !== contributionRequest) return;
      console.error("Could not load the GitHub contribution graph.", error);
      if (showingSelectedYear) {
        total.textContent = previousTotal;
        addExternalMessage(message, "The latest contribution update is unavailable; showing the last update. View GitHub profile", githubProfile);
        return;
      }
      total.textContent = `Contributions in ${selectedYear}`;
      renderContributionGrid([], selectedYear);
      addExternalMessage(message, "The contribution graph is temporarily unavailable. View GitHub profile", githubProfile);
    }
  }

  function getSelectedContributionYear() {
    const selected = document.querySelector("[data-year-picker] .year-button[aria-pressed='true']");
    return selected ? Number(selected.textContent) : undefined;
  }

  function renderContributionGrid(days, year) {
    const grid = document.querySelector("[data-contribution-grid]");
    const months = document.querySelector("[data-contribution-months]");
    grid.replaceChildren();
    months.replaceChildren();
    if (!days.length) {
      grid.style.gridTemplateColumns = "1fr";
      grid.setAttribute("aria-label", `No contribution data was returned for ${year}`);
      return;
    }

    const firstDate = new Date(`${days[0].date}T00:00:00Z`);
    const dayOffset = firstDate.getUTCDay();
    const weekCount = Math.ceil((dayOffset + days.length) / 7);
    grid.style.gridTemplateColumns = `repeat(${weekCount}, 11px)`;
    months.style.gridTemplateColumns = `repeat(${weekCount}, 11px)`;
    months.style.setProperty("--contribution-gap", "3px");
    grid.setAttribute("aria-label", `Daily GitHub contributions in ${year}`);

    let lastMonth = "";
    days.forEach((day, index) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      const cellIndex = dayOffset + index;
      const column = Math.floor(cellIndex / 7);
      const weekday = date.getUTCDay();
      const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      if (monthKey !== lastMonth) {
        const label = document.createElement("span");
        label.className = "contribution-month";
        label.style.gridColumn = `${column + 1}`;
        label.textContent = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date);
        months.append(label);
        lastMonth = monthKey;
      }

      const count = Number(day.count) || 0;
      const level = Math.max(0, Math.min(4, Number(day.level) || (count ? Math.min(4, Math.ceil(count / 4)) : 0)));
      const cell = document.createElement("span");
      cell.className = "contribution-day";
      cell.dataset.level = String(level);
      cell.style.gridColumn = `${column + 1}`;
      cell.style.gridRow = `${weekday + 1}`;
      const dateText = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
      cell.title = `${count} ${count === 1 ? "contribution" : "contributions"} on ${dateText}`;
      cell.setAttribute("aria-label", cell.title);
      grid.append(cell);
    });
  }

  async function loadActivity() {
    const feed = document.querySelector("[data-activity-feed]");
    const previousNotice = feed.querySelector("[data-refresh-notice]");
    if (previousNotice) previousNotice.remove();
    try {
      const events = await window.PortfolioGitHub.getEvents();
      renderActivity(Array.isArray(events) ? events : []);
      hasActivityData = true;
    } catch (error) {
      console.error("Could not load public GitHub activity.", error);
      if (hasActivityData) {
        const notice = document.createElement("p");
        notice.className = "api-message";
        notice.dataset.refreshNotice = "";
        addExternalMessage(notice, "Could not refresh activity; showing the last update. View GitHub activity", `${githubProfile}?tab=activity`);
        feed.append(notice);
        return;
      }
      feed.replaceChildren();
      addExternalMessage(feed, "Recent activity is temporarily unavailable. View GitHub activity", `${githubProfile}?tab=activity`);
    }
  }

  function renderActivity(events) {
    const feed = document.querySelector("[data-activity-feed]");
    feed.replaceChildren();
    const todayKey = localDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);
    const todayItems = [];
    const yesterdayItems = [];
    const datedItems = new Map();

    events.forEach((event) => {
      const date = new Date(event.created_at);
      if (Number.isNaN(date.getTime())) return;
      const key = localDateKey(date);
      if (key === todayKey) todayItems.push(event);
      else if (key === yesterdayKey) yesterdayItems.push(event);
      else {
        if (!datedItems.has(key)) datedItems.set(key, []);
        datedItems.get(key).push(event);
      }
    });

    const todayGroup = createActivityGroup("Today", todayItems);
    if (!todayItems.length) {
      const nothing = document.createElement("p");
      nothing.className = "empty-message";
      nothing.textContent = "Nothing yet today.";
      todayGroup.append(nothing);
    }
    feed.append(todayGroup);
    if (yesterdayItems.length) feed.append(createActivityGroup("Yesterday", yesterdayItems));
    [...datedItems.keys()].sort().reverse().forEach((dateKey) => {
      const date = new Date(`${dateKey}T12:00:00`);
      const heading = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
      feed.append(createActivityGroup(heading, datedItems.get(dateKey)));
    });

    if (!events.length) {
      const mostRecent = document.createElement("a");
      mostRecent.className = "text-link activity-more";
      mostRecent.href = `${githubProfile}?tab=activity`;
      mostRecent.target = "_blank";
      mostRecent.rel = "noopener noreferrer";
      mostRecent.textContent = "See recent activity on GitHub ↗";
      feed.append(mostRecent);
    }
  }

  function createActivityGroup(title, events) {
    const section = document.createElement("section");
    section.className = "activity-group";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.append(heading);
    if (events.length) {
      const list = document.createElement("ul");
      events.forEach((event) => list.append(createActivityItem(event)));
      section.append(list);
    }
    return section;
  }

  function createActivityItem(event) {
    const item = document.createElement("li");
    const description = document.createElement("span");
    const repositoryName = event.repo && event.repo.name ? event.repo.name : "";
    const repositoryLink = document.createElement("a");
    repositoryLink.className = "activity-repository";
    repositoryLink.href = `https://github.com/${repositoryName}`;
    repositoryLink.target = "_blank";
    repositoryLink.rel = "noopener noreferrer";
    repositoryLink.textContent = repositoryName.split("/").pop() || "repository";

    let action = "Activity in";
    if (event.type === "PushEvent") {
      const commits = event.payload && Array.isArray(event.payload.commits) ? event.payload.commits.length : 0;
      action = `Pushed ${commits} ${commits === 1 ? "commit" : "commits"} to`;
    } else if (event.type === "CreateEvent" && event.payload && event.payload.ref_type === "repository") {
      action = "Created repository";
    } else if (event.type === "CreateEvent") action = "Created a branch in";
    else if (event.type === "WatchEvent") action = "Starred";
    else if (event.type === "ForkEvent") action = "Forked";
    else if (event.type === "IssuesEvent") action = "Updated an issue in";
    else if (event.type === "PullRequestEvent") action = "Updated a pull request in";
    else if (event.type === "IssueCommentEvent" || event.type === "PullRequestReviewEvent") action = "Contributed to";

    description.append(document.createTextNode(`${action} `), repositoryLink);
    const time = document.createElement("time");
    time.dateTime = event.created_at;
    time.textContent = relativeTime(new Date(event.created_at));
    item.append(description, time);
    return item;
  }

  async function loadHomeProjects() {
    const grid = document.querySelector("[data-home-projects]");
    const moreLink = document.querySelector("[data-view-projects]");
    try {
      const projects = await window.PortfolioGitHub.getTaggedProjects();
      renderHomeProjects(grid, projects.slice(0, 3));
    } catch (error) {
      console.error("Could not load portfolio projects from GitHub.", error);
      const manual = window.PortfolioGitHub.getManualProjects();
      if (manual.length) renderHomeProjects(grid, manual.slice(0, 3));
      else {
        grid.replaceChildren(makeEmptyMessage("Projects are temporarily unavailable. Please try again later."));
        moreLink.hidden = true;
      }
    }
  }

  function renderHomeProjects(grid, projects) {
    const moreLink = document.querySelector("[data-view-projects]");
    grid.replaceChildren();
    if (!projects.length) {
      grid.append(makeEmptyMessage("Projects coming soon."));
      moreLink.hidden = true;
      return;
    }
    projects.forEach((project) => grid.append(window.PortfolioUI.createProjectCard(project)));
    moreLink.hidden = false;
  }

  function loadHomeGallery() {
    const host = document.querySelector("[data-home-gallery]");
    const items = Array.isArray(window.GALLERY) ? window.GALLERY.filter(isValidGalleryItem) : [];
    if (!items.length) {
      host.replaceChildren(makeEmptyMessage("Certificates and achievements coming soon."));
      return;
    }

    host.replaceChildren();
    const track = document.createElement("div");
    track.className = "gallery-marquee__track";
    const group = document.createElement("div");
    group.className = "gallery-marquee__group";
    group.setAttribute("role", "list");
    items.forEach((item) => {
      const card = window.PortfolioUI.createGalleryCard(item);
      card.setAttribute("role", "listitem");
      group.append(card);
    });
    track.append(group);
    host.append(track);

    const updateMarquee = () => {
      const duplicate = track.querySelector(".gallery-marquee__group--copy");
      if (duplicate) duplicate.remove();
      track.classList.remove("is-moving");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || group.scrollWidth <= host.clientWidth) return;
      const copy = group.cloneNode(true);
      copy.classList.add("gallery-marquee__group--copy");
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("a").forEach((link) => { link.tabIndex = -1; });
      track.append(copy);
      track.classList.add("is-moving");
    };
    window.addEventListener("resize", updateMarquee, { passive: true });
    requestAnimationFrame(updateMarquee);
  }

  function isValidGalleryItem(item) {
    return item && typeof item.id === "string" && item.id.trim() &&
      typeof item.title === "string" && item.title.trim() &&
      !item.id.includes("[FILL IN]") && !item.title.includes("[FILL IN]") &&
      (item.type === "certificate" || item.type === "achievement");
  }

  function makeEmptyMessage(text) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = text;
    return message;
  }

  function addExternalMessage(host, text, href) {
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    host.append(link);
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function relativeTime(date) {
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
})();
