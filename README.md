# Kitty’s Maths

A calm, interactive maths game with a kitty guide. **Version 0.1.0 — learning preview.**

Complex Numbers is the first active chapter: 36 guided activities, named symbols, step-by-step explanations, recorded female narration and word highlighting. Other chapter titles are previews, not implemented courses.

## Use the app

The GitHub Pages build is in `docs/`. Open its `index.html`, or run:

```sh
npm ci
npm run build
npm run serve
```

Then visit `http://127.0.0.1:8766`.

- **Listen to Kitty** starts narration. Pause/Resume keeps your place; the separate restart button starts over.
- **Quick explanation** opens a small help card. Tap any symbol for contextual help.
- **Search Google** opens a relevant search in a new tab. Search results are external, changeable and not endorsed as correct by the app.
- **Sound → Load my music** plays your own file locally with independent volume. Select it again after reloading.
- **Contents** opens/closes the course menu. Progress records guided activities explored, not mastery of every book exercise.

Both the built-in drone and linked YouTube drone player have been removed. No paid API credits are needed to play the saved narration.

## What is not published

The owner’s textbook PDF, scanned pages, private notes, local environments and credentials are excluded by a Git allowlist and a separate publish-build allowlist. Hosted lessons show printed textbook page references instead of trying to fetch private scans. The supplied book itself is not redistributed.

Local `game.html` supports the owner’s adjacent PDF and local source-page images. Those optional files are absent in a fresh clone; use the self-contained `docs/` build for normal playback. Earlier reading companions and historical project notes remain local and are not part of this release.

## Development and releases

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:public
```

`package.json` is the version source. The app footer, `CHANGELOG.md`, generated `docs/miso-build.js`, release manifest and Git tag must agree. Use `vMAJOR.MINOR.PATCH` tags. Build and test before committing; commit regenerated `docs/` with source changes. The release manifest records each published file’s SHA256 checksum. When the repository is public, GitHub Actions checks build reproducibility and runs the mathematical, packaging and hosted-app browser checks. Its job is intentionally skipped in private repositories to avoid consuming private Actions minutes without a separate choice; run the same checks locally.

The build requires no network or API key; it reuses the committed recordings. Narration regeneration is separate: see `tools/narration/prepare-free.cjs`, `generate-free.py` and `requirements-free.txt`. It uses an online service, so it is not part of automated builds.

For branch-based GitHub Pages, publish **main /docs**. Publishing the site makes the app accessible on the web; repository access and website access are separate settings. Do not add textbook files to either source control or the publishing folder.

Progress is local to a browser and website origin; localhost progress does not automatically migrate to the hosted site. There are no learner accounts or analytics. This is not a clinically validated intervention or a complete exam-preparation course. Voice quality and learning suitability need human judgment.

See [changelog](CHANGELOG.md) and [sources, credits and privacy](CREDITS.md). No project-wide open-source licence has been selected.
