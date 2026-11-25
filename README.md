# Shem Moreno — personal portfolio

A small portfolio made with plain HTML, CSS, and JavaScript. It has no framework, package manager, build step, or backend. Open `index.html` directly in a browser, or use VS Code Live Server while working on it.

## What each file does

### Pages

- `index.html` — profile, GitHub contribution graph and activity, project preview, gallery preview, and contact section.
- `projects.html` — all real projects tagged `portfolio` on GitHub, plus any manual entries.
- `project.html` — one project, selected with `?slug=REPOSITORY_NAME`.
- `gallery.html` — certificate and achievement cards, with category filters.
- `item.html` — one gallery item, selected with `?id=ITEM_ID`.
- `cv.html` — CV preview and available contact buttons.
- `404.html` — the custom not-found page.

### Styles and scripts

- `css/style.css` — layout, colors, responsive styles, focus states, and gentle animations.
- `js/config.js` — the personal details used throughout the pages. Edit this file first.
- `js/layout.js` — inserts the shared navigation and footer.
- `js/github.js` — fetches public GitHub data and caches it in the browser.
- `js/main.js` — shared page setup, contact links, animation, and reusable card helpers.
- `js/home.js` — contribution graph, recent activity, project preview, and scrolling gallery.
- `js/projects.js` — project listing and loading/error states.
- `js/project.js` — project details, GitHub insights, and sharing.
- `js/gallery.js` — gallery filters and cards.
- `js/item.js` — one certificate or achievement.
- `js/cv.js` — CV and phone-button setup.
- `data/projects.js` — empty manual-project list and optional project notes.
- `data/gallery.js` — empty certificate/achievement list.
- `assets/icons/favicon.svg` — the small browser-tab icon.
- `assets/projects/` — add custom project screenshots here.
- `assets/certificates/` — add certificate and achievement images here.
- `assets/cv/` — add your CV file here.

## Change your details

Edit `js/config.js`. Values still marked `[FILL IN]` are hidden instead of becoming broken links or blank content:

- `phone` — phone number used for the call button.
- `whatsapp` — WhatsApp number, including country code.
- `instagramUrl` — full Instagram profile URL.
- `extraSocialLinks` — replace its placeholder entry with real `{ label, url }` entries, or use an empty array.
- `cvPath` — path to your CV, for example `assets/cv/my-cv.pdf`. Leave the placeholder until the file exists.

The name, GitHub username, email, contact headline, and handle are also in that file. Keep phone numbers in international format for the WhatsApp link.

## Run locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also open `index.html` directly in a browser. Public GitHub API requests need an internet connection. If an API is unavailable, the page shows a friendly message and the rest of the site remains usable.

## Publish on GitHub and Vercel

1. Create a **public** GitHub repository named `portfolio` under `shemmorenogit`.
2. Add the files and folders in this project to the repository and push them to the `main` branch.
3. In Vercel, choose **Add New → Project**, import `shemmorenogit/portfolio`, and deploy it. This is a plain static site: it has no build command or output directory to configure.
4. Vercel will provide a public `*.vercel.app` URL. Each later push to `main` automatically triggers a new production deployment.

The website's GitHub activity and public project data also update from GitHub APIs in visitors' browsers, subject to the cache times below. New portfolio files and content still need to be added to this project and pushed to GitHub; that push is what publishes them automatically through Vercel.

## Add real projects

For a GitHub repository to appear automatically:

1. Open that repository on GitHub.
2. Add the topic `portfolio` in its About/topics settings.
3. If it has a live website, set the repository's **Website** URL too.

The site ignores forks and archived repositories. It loads repositories from your public GitHub account, then keeps a 15-minute browser cache. Home shows up to three; the Projects page shows the full list.

For a project not represented by a tagged repository, add a real object to `window.MANUAL_PROJECTS` in `data/projects.js`. Use `name`, `repo`, `repositoryUrl`, `homepage`, `description`, and `image` fields. The repository and homepage URLs may be left out when unavailable. Add a custom image under `assets/projects/` and use its relative path if desired. Add a `why` note or image override to `window.PROJECT_NOTES`, keyed by project/repository name. Do not leave `[FILL IN]` values in an active project entry.

Project detail URLs use the project's name, such as `project.html?slug=MY_REPOSITORY`. The detail page shows a live-site button only when a valid homepage URL is available.

## Add certificates and achievements

Add image files under `assets/certificates/`, then add real entries to `window.GALLERY` in `data/gallery.js`. Use a unique `id`, a `type` of `certificate` or `achievement`, and the title, issuer, date, image path, short description, and story you want to show. The home-page gallery only moves when the real cards are wide enough to fill its row; otherwise it stays still.

## Add your CV and contact links

1. Put your CV in `assets/cv/` and set `cvPath` in `js/config.js` to its relative path.
2. Set `phone`, `whatsapp`, and `instagramUrl` to real values in `js/config.js`.
3. Replace the optional extra-social placeholder with real profile links, or remove it.
4. The site hides unfilled contact links and the CV download/call buttons until the values are ready.

## Public GitHub data

- Contribution history comes from `github-contributions-api.jogruber.de` and is cached for one hour.
- Public activity comes from the GitHub Events API and is cached for five minutes.
- Repository listings and project insights are cached for 15 minutes.

These are public unauthenticated API requests. If GitHub's rate limit is reached, wait for the cache/rate-limit window to pass or visit your GitHub profile directly.
