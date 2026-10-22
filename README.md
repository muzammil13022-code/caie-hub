# Paperline — CAIE AS & A Level past papers

A local static site (Astro + plain JS) that links **directly to PDFs that already exist online**.
Nothing is hosted here: every paper link points to the XtremePapers file archive, and the
resource/topical tabs route to Cambridge International, Exam-Mate and Rocket Revise.

## Run it

```bash
npm install     # once
npm run dev     # http://localhost:4321
npm run build   # static site in dist/
```

(Node is kept portable at `C:\Users\Muzam\tools\node` — add it to PATH in each shell:
`export PATH="/c/Users/Muzam/tools/node:$PATH"`.)

## What's inside

| Subject | Code | Papers | Current syllabus from |
|---|---|---|---|
| Mathematics | 9709 | 564 | 2020 |
| Physics | 9702 | 371 | 2022 |
| Chemistry | 9701 | 372 | 2022 |
| Biology | 9700 | 372 | 2022 |
| Computer Science | 9618 | 260 | 2021 |
| Information Technology | 9626 | 206 | 2020 |
| Psychology | 9990 | 348 | 2020 |
| Business | 9609 | 184 | 2023 |
| Accounting | 9706 | 184 | 2023 |
| Economics | 9708 | 206 | 2023 |

**3,067 checked links.** Every paper URL is scraped from the live XtremePapers directory
listing during data build, so links point at real files — nothing is guessed. Papers older
than each subject's current syllabus version are excluded ("current syllabus only"),
with February/March, May/June and October/November sessions, QP + MS per variant.

## Scripts

- `node scripts/build-paper-manifest.mjs` — re-scrape XtremePapers listings → `src/data/papers.json`
- `node scripts/check-links.mjs` — verify curation links + a sample of paper links
  (`Rocket Revise` blocks non-browser clients, so those report as *unverified*, not failed)

## Edits worth knowing about

- `src/data/subjects.ts` — subject names, colors, paper titles, **syllabus start years**,
  official Cambridge slugs. Add a subject here, then re-run the manifest script.
- The "latest syllabus" cutoff years (`syllabusStart`) reflect each subject's last
  restructure; when Cambridge ships a new syllabus version, bump the year and re-run the
  manifest.
- Subjects with confirmed Rocket Revise topical pages: Physics (P1, P4), Maths (P1),
  Biology (P1), Economics (P1), Computer Science (subject page). Others show a graceful
  fallback.

## Caveats

- Rocket Revise fences bots; its links are confirmed working in a real browser but show
  as "fetch-blocked" in the link checker.
- Exam-Mate has no public API and its file IDs are unpredictable, so per-paper links use
  XtremePapers; Exam-Mate appears as a subject-level browse link where a page was verified.
- Links to third-party mirrors can break — `npm run check-links` catches that.
