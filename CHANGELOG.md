# Changelog

Version numbers use MAJOR.MINOR.PATCH. This first Git-tracked release is an early learning preview, not a claim of exam completeness or learner validation.

## 0.2.0 — 2026-09-28

- Added a human-teacher YouTube link and alternative for every one of the 36 guided steps, alongside existing Google links.
- Selected 18 publicly playable videos with dated positive-engagement evidence. Likes/views are not represented as independent quality ratings. Selection scope, known creator corrections and external-site limitations are visible in video details.
- Added safe per-browser replacement links, restore-original, JSON export/import, and clear storage/error messages. No shared public editing, embedded player, tracking requests, paid API or video download.
- Added short practical picture cues across the chapter; moved long explanations into an expandable transcript. Listening opens the exact matching transcript, closing it pauses audio, and true pause/resume remains.
- Added 14 small visual experiments: floor-plan address, imaginary turns, component addition, conjugate cancellation/division, ribbon distance, square patches, two roots, an equation machine, polar turns/stretching, radians and angle identities. All have button or slider controls; no timed pressure. Existing complex-plane and polar activities are retained, not double-counted. The first number line is now a labelled toy shelf.
- Kept all 108 existing narration files and scripts unchanged. The new short cues are text-only, not mismatched voice-over. Existing lesson progress is retained.
- Added coverage, URL-safety, import, persistence, transcript and visual-interaction regression tests.

## 0.1.0 — 2026-09-28

### Added

- The teacher’s name is Kitty; the app is Kitty’s Maths. Existing progress-storage keys are retained so the name change does not erase progress.

- A contextual Google search link beside every lesson explanation.
- Small, dismissible explanation pop-ups for all 36 lessons and their symbol cards.
- A concrete explanation that both i and −i square to −1.
- An explicit publish build that excludes textbook PDFs, scanned pages, private project notes and build environments.
- A visible app version, reproducible build, release manifest, automated checks and changelog.

### Removed

- The built-in drone synthesizer, linked YouTube drone player and all their sound controls. Local music upload, independent volume, narration and kitty purring remain. No preselected background soundtrack remains.

### Retained

- One active chapter: Complex Numbers, with 36 guided activities, the book’s section names and chapter progress.
- 108 recorded Sonia explanations, word/number highlighting and true pause/resume.
- Calm colours, a glasses-free kitty, touch/keyboard alternatives, reduced motion and saved progress.

Earlier local prototypes were not Git releases. Their files and notes remain on the owner’s computer, outside this repository’s publish allowlist.
