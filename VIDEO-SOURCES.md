# Human-teacher video companion — v0.2.0

Checked 28 September 2026. These are outbound links, not copies of the videos. No player, thumbnail, YouTube API or tracking request loads until a learner follows a link. YouTube opens in a new tab and may show ads, recommendations or paid-course promotions. A trusted adult should assess suitability.

## What “selected” means

Selection considered topic coverage, human-led teaching, visible positive audience engagement and public playability. Public YouTube watch-page metadata reported `OK` playback and caption availability for all 18 videos below. Counts are a dated snapshot and can change. Each had at least 1,030 visible likes at this check. We do not have independent teaching-quality ratings, a like/dislike ratio, or a full human review of every minute. Popularity is not proof of accuracy or suitability; the app does not label these “top rated”.

Titles, teacher/channel names, durations, view counts, like counts and descriptions were checked against the linked primary YouTube pages. No media or transcripts were downloaded. Video descriptions and published chapter headings informed topic mapping; the app's practical cues and diagrams are original, not copied video explanations. The [Math Antics catalogue](https://mathantics.com/), [Video Tutor complex-number page](https://www.video-tutor.net/complex-numbers.html), [trigonometry applications](https://www.video-tutor.net/trigonometric-applications.html) and [identities page](https://www.video-tutor.net/trigonometric-identities.html) were also consulted.

## Selected lessons

| Teacher/channel and video | Duration | Views | Likes |
| --- | ---: | ---: | ---: |
| Math Antics — [The Number Line](https://www.youtube.com/watch?v=RSJOTBJlKNA) | 10:12 | 954,056 | 8,620 |
| Math Antics — [Negative Numbers](https://www.youtube.com/watch?v=OAoLCXpao6s) | 8:26 | 3,562,304 | 25,793 |
| Math Antics — [Graphing on the Coordinate Plane](https://www.youtube.com/watch?v=9Uc62CuQjc4) | 10:14 | 4,195,828 | 57,315 |
| Math Antics — [What Is Algebra?](https://www.youtube.com/watch?v=NybHckSEQBI) | 12:06 | 11,378,045 | 164,060 |
| Math Antics — [Exponents and Square Roots](https://www.youtube.com/watch?v=B4zejSI8zho) | 11:08 | 2,425,488 | 38,281 |
| Eddie Woo — [Why Complex Numbers? The Imaginary Unit](https://www.youtube.com/watch?v=A254hF5QqOk) | 9:57 | 79,742 | 1,030 |
| 3Blue1Brown — [Complex Number Fundamentals](https://www.youtube.com/watch?v=5PcpBw5Hbwo) | 82:10 | 2,138,329 | 39,939 |
| The Organic Chemistry Tutor — [Complex Numbers: Basic Operations](https://www.youtube.com/watch?v=OQz1ydBcQSA) | 83:35 | 1,833,322 | 28,006 |
| Math Antics — [The Pythagorean Theorem](https://www.youtube.com/watch?v=WqhlG3Vakw8) | 12:55 | 3,408,586 | 42,373 |
| Math Antics — [Simplifying Square Roots](https://www.youtube.com/watch?v=2mejAHKMBiM) | 12:01 | 1,027,083 | 17,663 |
| The Organic Chemistry Tutor — [Solving Quadratic Equations with Imaginary Numbers](https://www.youtube.com/watch?v=83WrPCagHRg) | 8:19 | 82,376 | 1,477 |
| Eddie Woo — [Visual Explanation of Completing the Square](https://www.youtube.com/watch?v=McDdEw_Fb5E) | 3:33 | 234,587 | 7,304 |
| The Organic Chemistry Tutor — [Complex Numbers in Polar: De Moivre’s Theorem](https://www.youtube.com/watch?v=J6TnZxUUzqU) | 64:47 | 1,288,828 | 18,795 |
| The Organic Chemistry Tutor — [The Unit Circle: Basic Introduction](https://www.youtube.com/watch?v=57VrEiEPD1I) | 12:48 | 516,328 | 8,636 |
| The Organic Chemistry Tutor — [What Exactly Is a Radian?](https://www.youtube.com/watch?v=CHCWXAkozHM) | 12:05 | 209,635 | 3,553 |
| Patrick J / PatrickJMT — [Roots of Complex Numbers](https://www.youtube.com/watch?v=HhlD7sX5Tp8) | 6:01 | 529,139 | 2,959 |
| The Organic Chemistry Tutor — [Double Angle Identities and Formulas](https://www.youtube.com/watch?v=SE5SBTgrwH8) | 18:16 | 884,478 | 10,851 |
| blackpenredpen — [sin(3x) and cos(3x), Using De Moivre’s Theorem](https://www.youtube.com/watch?v=I1myAqBFm7g) | 7:49 | 73,895 | 1,756 |

## Mapping and limits

`miso-video-catalog.js` is the complete 36-step primary/alternative map. Reusing a broad lesson for related steps is intentional; it does not mean each step has its own dedicated video. Long lessons are references to pause and revisit, not an expectation to watch in one sitting. Some human teachers use a voice-over and a whiteboard rather than appearing on camera.

The polar lesson uses YouTube's published chapter starts, rounded down to the second: De Moivre at 5:51, polar-to-rectangular at 31:18, multiplication at 37:42, and division at 47:53. Only the public 64:47 video is linked, not its paid extended version. No guessed timestamps are used for other videos.

The completing-square video is a visual foundation, not a full treatment of complex roots. The roots video works square roots using the general nth-root rule; students use n = 3 or 4 in Kitty's corresponding activities. The algebra introduction is a foundation for what a letter represents, not a complex-number-specific lesson.

The 3Blue1Brown video description lists corrections to three written expressions: the first complex-plane sketch labels 2i where −2i belongs; the final angle-sum identity's last term should use sin(beta), not sin(alpha); Q9 is missing i inside the parentheses. These creator-reported corrections are shown in the app when that video is selected. Check the current description before relying on it.

The new pictures distinguish concrete physical measurements from mathematical models. A complex arrow is not a claim that fabric has negative area. Radian measurement and polar multiplication follow the definitions explained in [Illustrative Mathematics' radian task](https://tasks.illustrativemathematics.org/content-standards/tasks/1874) and [TU Delft's polar-form reference](https://interactivetextbooks.tudelft.nl/linear-algebra/Appendices/ComplexNumbersPolar.html). Numerical angle-identity experiments are explicitly examples, not proofs.

## Replacements and privacy

Replacement URLs accept specific HTTPS YouTube videos only, with an optional start time. Links and titles are stored in this browser's local storage, independently of lesson progress; they do not change anyone else's links. Imported files are validated in full before being merged. Custom links are labelled as unreviewed and do not inherit the original video's likes or selection claim. Export JSON to back up or share your replacements. Clearing browser storage removes them.

Changing the defaults for everyone requires a reviewed code change and a new published version. No account, shared edit service, GitHub token, analytics or paid API is embedded in the app. Broken, removed or later-restricted videos cannot be repaired automatically; use the alternative or replace the link.
