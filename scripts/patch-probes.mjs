// ---------------------------------------------------------------------------
// Gently probes Rocket Revise subject/paper pages and Exam-Mate syllabus blog
// pages (2025 per-subject), then merges verified URLs into src/data/papers.json
// Run: node scripts/patch-probes.mjs
// ---------------------------------------------------------------------------
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function status200(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 20000);
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*" },
        redirect: "follow",
        signal: ctl.signal,
      });
      clearTimeout(t);
      if (res.status === 200) return true;
      if (res.status === 404) return false; // definitive
      // 403/429/5xx: wait and retry
      await sleep(3000 * (i + 1));
    } catch {
      await sleep(3000 * (i + 1));
    }
  }
  return null; // unresolved
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "src/data/papers.json"), "utf8"));

const ROCKET = {
  "9702": "cie-a-level-physics",
  "9709": "cie-a-level-maths-9709",
  "9701": "cie-a-level-chemistry",
  "9700": "cie-a-level-biology-9700",
  "9708": "cie-a-level-economics",
  "9618": "cie-a-level-computer-science",
  "9626": "cie-a-level-information-technology",
  "9990": "cie-a-level-psychology",
  "9609": "cie-a-level-business",
  "9706": "cie-a-level-accounting",
};

const EXAMMATE = {
  "9709": ["cambridge_a_level_maths_9709", "cambridge_a_level_mathematics_9709"],
  "9702": ["cambridge_a_level_physics_9702"],
  "9701": ["cambridge_a_level_chemistry_9701"],
  "9700": ["cambridge_a_level_biology_9700"],
  "9618": ["cambridge_a_level_computer_science_9618", "cambridge_a_level_cs_9618"],
  "9626": ["cambridge_a_level_it_9626", "cambridge_a_level_information_technology_9626"],
  "9990": ["cambridge_a_level_psychology_9990"],
  "9609": ["cambridge_a_level_business_9609"],
  "9706": ["cambridge_a_level_accounting_9706"],
  "9708": ["cambridge_a_level_economics_9708"],
};

for (const [code, subject] of Object.entries(manifest.subjects)) {
  // Rocket Revise subject page
  const rrSlug = ROCKET[code];
  const rrSubjectUrl = `https://rocketrevise.com/a-level-cambridge/${rrSlug}/`;
  const rrOk = await status200(rrSubjectUrl);
  subject.rocketSubject = rrOk ? rrSubjectUrl : null;

  // Rocket Revise per-paper topical pages
  const topical = {};
  if (rrOk) {
    const shortBase = rrSlug.replace(/-\d{4}$/, "");
    const paperNums = [...new Set(subject.papers.map((p) => p.p))].sort((a, b) => a - b);
    for (const p of paperNums) {
      for (const base of [shortBase, rrSlug]) {
        const url = `https://rocketrevise.com/a-level-cambridge/${rrSlug}/${base}-p${p}/`;
        const ok = await status200(url);
        if (ok) {
          topical[p] = url;
          break;
        }
      }
      await sleep(1200);
    }
  }
  subject.topicalPapers = topical;

  // Exam-Mate syllabus blog page
  subject.examMateUrl = null;
  for (const slug of EXAMMATE[code]) {
    const url = `https://www.exam-mate.com/blog/${slug}`;
    const ok = await status200(url);
    if (ok) {
      subject.examMateUrl = url;
      break;
    }
    await sleep(1200);
  }

  console.log(
    `[${code}] rocket=${subject.rocketSubject ? "yes" : "no"} topical=${Object.keys(topical).join(",") || "none"} exammate=${subject.examMateUrl ? "yes" : "no"}`
  );
  await sleep(1500);
}

await writeFile(path.join(ROOT, "src/data/papers.json"), JSON.stringify(manifest, null, 1));
console.log("papers.json updated");
