// ---------------------------------------------------------------------------
// Builds src/data/papers.json by scraping the XtremePapers CAIE A Level
// directory listings (so every link is a REAL file that exists), and probing
// Rocket Revise / Exam-Mate subject page slugs.
// Run: node scripts/build-paper-manifest.mjs
// ---------------------------------------------------------------------------
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// XtremePapers folder name inside CAIE/AS and A Level/<folder>
const XTP_BASE = "https://papers.xtremepape.rs/";
const FOLDERS = {
  "9709": "Mathematics (9709)",
  "9702": "Physics (9702)",
  "9701": "Chemistry (9701)",
  "9700": "Biology (9700)",
  "9618": "Computer Science (for first examination in 2021) (9618)",
  "9626": "Information Technology (9626)",
  "9990": "Psychology (9990)",
  "9609": "Business (9609)",
  "9706": "Accounting (9706)",
  "9708": "Economics (9708)",
};

// First exam year of the current syllabus version (see src/data/subjects.ts)
const CUTOFFS = {
  "9709": 2020,
  "9702": 2022,
  "9701": 2022,
  "9700": 2022,
  "9618": 2021,
  "9626": 2020,
  "9990": 2020,
  "9609": 2023,
  "9706": 2023,
  "9708": 2023,
};

const ROCKET_CANDIDATES = [
  "9702", "cie-a-level-physics",
  "9709", "cie-a-level-maths-9709",
  "9701", "cie-a-level-chemistry",
  "9700", "cie-a-level-biology-9700",
  "9708", "cie-a-level-economics",
  "9618", "cie-a-level-computer-science",
  "9626", "cie-a-level-information-technology",
  "9990", "cie-a-level-psychology",
  "9609", "cie-a-level-business",
  "9706", "cie-a-level-accounting",
];

const EXAMMATE_WORDS = {
  "9709": "mathematics", "9702": "physics", "9701": "chemistry",
  "9700": "biology", "9618": "computer_science", "9626": "information_technology",
  "9990": "psychology", "9609": "business", "9706": "accounting", "9708": "economics",
};

async function get(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      redirect: "follow",
      signal: ctl.signal,
    });
    return { res, text: await res.text() };
  } finally {
    clearTimeout(t);
  }
}

async function headStatus(url) {
  try {
    const { res } = await get(url);
    return res.status === 200 || res.status === 301 || res.status === 302 ? 200 : res.status;
  } catch {
    return -1;
  }
}

// scrape one xtp folder listing (follows pagination start= links)
async function scrapeFolder(code, folder) {
  const dirpath = `./CAIE/AS+and+A+Level/${folder.replace(/ /g, "+").replace(/\(/g, "%28").replace(/\)/g, "%29")}/`;
  const urlFor = (start) => `https://papers.xtremepape.rs/index.php?dirpath=${dirpath}&order=0${start ? `&start=${start}` : ""}`;
  const files = new Map(); // filename -> url
  let nextStarts = [null];
  const seenStarts = new Set();

  while (nextStarts.length) {
    const start = nextStarts.shift();
    if (seenStarts.has(String(start))) continue;
    seenStarts.add(String(start));
    const { text } = await get(urlFor(start));
    const re = /href="([^"]+\.pdf)"/gi;
    for (const m of text.matchAll(re)) {
      const href = m[1];
      if (!href.includes(`(${code})`)) continue;
      const base = decodeURIComponent(href.split("/").pop());
      files.set(base, XTP_BASE + href.replace(/ /g, "%20"));
    }
    // pagination: href="index.php?dirpath=...&start=25&order=0"
    for (const m of text.matchAll(/href="index\.php\?dirpath=[^"]*?start=(\d+)[^"]*"/gi)) {
      if (!seenStarts.has(m[1])) nextStarts.push(m[1]);
    }
  }
  return files;
}

const FILE_RE = /^(\d{4})_([msw])(\d{2})_(qp|ms)_(\d)(\d)\.pdf$/;

const manifest = {
  generatedAt: new Date().toISOString(),
  subjects: {},
};

for (const [code, folder] of Object.entries(FOLDERS)) {
  process.stdout.write(`[${code}] scraping listing ... `);
  const files = await scrapeFolder(code, folder);
  const cutoff = CUTOFFS[code];
  const papers = [];
  for (const [name, url] of files) {
    const m = FILE_RE.exec(name);
    if (!m) continue;
    const [, , session, yy, kind, paper, variant] = m;
    const year = 2000 + Number(yy);
    if (year < cutoff) continue;
    papers.push({
      y: year,
      s: session,
      p: Number(paper),
      v: Number(variant),
      k: kind,
      url,
    });
  }
  papers.sort((a, b) => a.y - b.y || a.s.localeCompare(b.s) || a.p - b.p || a.v - b.v || a.k.localeCompare(b.k));
  const years = [...new Set(papers.map((p) => p.y))];
  console.log(`${papers.length} papers, years ${years[0] ?? "-"}–${years.at(-1) ?? "-"}`);

  // Rocket Revise paper-page probes (topical index per paper)
  const rrHit = ROCKET_CANDIDATES.includes(code) && (await headStatus(`https://rocketrevise.com/a-level-cambridge/${ROCKET_CANDIDATES[ROCKET_CANDIDATES.indexOf(code) + 1]}/`));
  const rrSubject = rrHit === 200 ? ROCKET_CANDIDATES[ROCKET_CANDIDATES.indexOf(code) + 1] : null;
  const topicalPapers = {};
  if (rrSubject) {
    const shortBase = rrSubject.replace(/-\d{4}$/, "");
    const paperNums = [...new Set(papers.map((p) => p.p))];
    for (const p of paperNums) {
      for (const base of [shortBase, rrSubject]) {
        const url = `https://rocketrevise.com/a-level-cambridge/${rrSubject}/${base}-p${p}/`;
        if ((await headStatus(url)) === 200) {
          topicalPapers[p] = url;
          break;
        }
      }
    }
  }

  // Exam-Mate syllabus blog page probe (yearly-papers listing fallback)
  const word = EXAMMATE_WORDS[code];
  const emCandidates = [
    `cambridge_a_level_${word}_${code}`,
    `cambridge_a_level_${word}`,
  ];
  let examMateUrl = null;
  for (const slug of emCandidates) {
    const url = `https://www.exam-mate.com/blog/${slug}`;
    if ((await headStatus(url)) === 200) {
      examMateUrl = url;
      break;
    }
  }

  manifest.subjects[code] = {
    papers,
    topicalPapers,
    rocketSubject: rrSubject ? `https://rocketrevise.com/a-level-cambridge/${rrSubject}/` : null,
    examMateUrl,
    xtpFolder: `https://papers.xtremepape.rs/index.php?dirpath=${FOLDERS[code].replace(/ /g, "+").replace(/\(/g, "%28").replace(/\)/g, "%29")}&order=0`,
  };
}

await writeFile(path.join(ROOT, "src/data/papers.json"), JSON.stringify(manifest, null, 1));
console.log("\nWrote src/data/papers.json");
