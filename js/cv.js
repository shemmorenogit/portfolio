(() => {
  const config = window.PORTFOLIO_CONFIG || {};
  const viewer = document.querySelector("[data-cv-viewer]");
  const download = document.querySelector("[data-cv-download]");
  const call = document.querySelector("[data-call-button]");
  const path = config.cvPath;

  if (typeof path === "string" && path.trim() && !path.includes("[FILL IN]")) {
    viewer.replaceChildren();
    const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(path);
    if (isImage) {
      const image = document.createElement("img");
      image.src = path;
      image.alt = `${config.name || "Portfolio owner"} CV`;
      image.addEventListener("error", () => showMissingFile(), { once: true });
      viewer.append(image);
    } else {
      const frame = document.createElement("iframe");
      frame.src = path;
      frame.title = `${config.name || "Portfolio owner"} CV`;
      frame.loading = "lazy";
      frame.addEventListener("error", () => showMissingFile(), { once: true });
      viewer.append(frame);
    }
    download.href = path;
    download.download = "";
    download.hidden = false;
  }

  if (typeof config.phone === "string" && !config.phone.includes("[FILL IN]")) {
    const digits = config.phone.replace(/\D/g, "");
    if (digits.length >= 6) {
      call.href = `tel:${config.phone.replace(/[^\d+]/g, "")}`;
      call.hidden = false;
    }
  }

  function showMissingFile() {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = "The CV file could not be opened. Check its path in js/config.js.";
    viewer.replaceChildren(message);
    download.hidden = true;
  }
})();
