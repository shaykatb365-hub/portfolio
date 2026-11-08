# Shaykat Bhattacharjee — Portfolio

Live: https://shaykat-portfolio-2026.netlify.app/

A plain static site (HTML, CSS, JS). No build step.

## Layout

- `index.html`, `style.css`, `script.js` — home page
- `*.html` + `case-style.css` — case-study pages
- `assets/` — videos, PDFs (resume, certificates), tool icons, case-study slides
- `thumbs/` — project thumbnails and the social share image (`og-cover.jpg`)

## Updating the site

Every push to `main` redeploys the live site automatically through Netlify.

- **Small edit:** open the file on github.com, click the pencil, edit, then "Commit changes".
- **New images/PDFs:** open the folder on github.com, "Add file" → "Upload files", then commit.
- **Bigger change:** clone the repo, edit locally, `git add . && git commit -m "…" && git push`.

Netlify also builds a preview link for every pull request, so you can check a change before it goes live.

Keep single files under 100 MB (GitHub's limit); compress large videos before adding them.

## History

See `CHANGELOG.txt`.
