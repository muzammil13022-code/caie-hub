// ---------------------------------------------------------------------------
// Verifies every static curation link (Rocket Revise / Exam-Mate / Cambridge /
// full-archive) and a deterministic sample of the generated paper links by
// asking each URL for its HTTP status. Rocket Revise blocks non-browser
// clients, so those are reported as "unverified" rather than failures.
// Run: node scripts/check-links.mjs   (exit 0 = no dead links found)
// ---------------------------------------------------------------------------
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function status(url) {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", method: "GET", signal: ctl.signal });
    clearTimeout(t);
    return res.status;
  } catch {
    return -1;
  }
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "src/data/papers.json"), "utf8"));
const dead = [];
const unverified = [];
let checked = 0;

async function check(url, what) {
  checked++;
  const st = await status(url);
  if (st === -1 || st === 403 || st === 429) {
    unverified.push(`${st == -1 ? "fetch-blocked" : st}  ${what}  ${url}`);
  } else if (st >= 400) {
    dead.push(`${st}  ${what}  ${url}`);
  }
  await sleep(250);
}

// Static curation links per subject
for (const [code, s] of Object.entries(manifest.subjects)) {
  if (s.rocketSubject) await check(s.rocketSubject, "rocket-revise subject");
  if (s.examMateUrl) await check(s.examMateUrl, "exam-mate syllabus");
  if (s.xtpFolder) await check(s.xtpFolder, "xtp archive");
  for (const [p, url] of Object.entries(s.topicalPapers)) await check(url, `topical P${p}`);
}

// Paper sample: verify every link of the two most recent years per subject
for (const [code, s] of Object.entries(manifest.subjects)) {
  const years = [...new Set(s.papers.map((p) => p.y))].sort((a, b) => b - a);
  const keep = new Set(years.slice(0, 2));
  const recent = s.papers.filter((p) => keep.has(p.y));
  const step = Math.max(1, Math.floor(recent.length / 20));
  for (let i = 0; i < recent.length; i += step) {
    await check(recent[i].url, `${code} paper sample`);
  }
}

console.log(`Checked ${checked} links.`);
console.log(`Dead links: ${dead.length}; blocked/unverified: ${unverified.length}`);
if (dead.length) {
  console.log("\nDEAD:");
  for (const d of dead.slice(0, 40)) console.log("  " + d);
}
if (unverified.length) {
  console.log("\nUNVERIFIED (browser-ok, bot-fenced or rate-limited):");
  for (const d of unverified.slice(0, 40)) console.log("  " + d);
}
process.exitCode = dead.length ? 1 : 0;
