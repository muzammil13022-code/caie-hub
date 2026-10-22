// ---------------------------------------------------------------------------
// Derives a compact public/papers-index.json from src/data/papers.json for the
// homepage paper finder. Stores one record per variant (not per link) plus the
// XtremePapers folder name per subject, then validates every computed URL
// against the scraped original; mismatches keep the original URL inline.
// qm per record: 1 = QP only, 2 = MS only, 3 = both.
// Run: node scripts/export-finder-index.mjs
// ---------------------------------------------------------------------------
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(await readFile(path.join(root, "src/data/papers.json"), "utf8"));

const FOLDER_ROOT = "https://papers.xtremepape.rs/CAIE/AS%20and%20A%20Level/";
// space -> %20, parentheses stay literal (matches the scraped URL shape)
const folderPath = (folder) =>
  encodeURIComponent(folder).replace(/%28/g, "(").replace(/%29/g, ")");
const repoUrl = (folder, code, session, yy, kind, pv) =>
  `${FOLDER_ROOT}${folderPath(folder)}/${code}_${session}${yy}_${kind}_${pv}.pdf`;

let mismatchCount = 0;

const subjects = {};
const records = [];

for (const [code, data] of Object.entries(manifest.subjects)) {
  let folder = null;
  if (data.xtpFolder) folder = new URL(data.xtpFolder).searchParams.get("dirpath");

  const byVariant = new Map();
  for (const p of data.papers) {
    const key = `${p.y}|${p.s}|${p.p}|${p.v}`;
    if (!byVariant.has(key)) byVariant.set(key, { y: p.y, s: p.s, p: p.p, v: p.v, q: 0, m: 0, qUrl: null, mUrl: null });
    const rec = byVariant.get(key);
    if (p.k === "qp") { rec.q = 1; rec.qUrl = p.url; } else { rec.m = 1; rec.mUrl = p.url; }
  }

  const entries = [];
  for (const rec of byVariant.values()) {
    const qm = rec.q + 2 * rec.m;
    const yy = String(rec.y).slice(2);
    const pv = `${rec.p}${rec.v}`;
    const entry = [code, rec.y, rec.s, rec.p, rec.v, qm];
    if (folder) {
      let mismatch = null;
      if (rec.qUrl && repoUrl(folder, code, rec.s, yy, "qp", pv) !== rec.qUrl) {
        (mismatch ??= {})[0] = rec.qUrl;
        mismatchCount++;
      }
      if (rec.mUrl && repoUrl(folder, code, rec.s, yy, "ms", pv) !== rec.mUrl) {
        (mismatch ??= {})[1] = rec.mUrl;
        mismatchCount++;
      }
      if (mismatch) entry.push(mismatch);
    }
    entries.push(entry);
  }

  subjects[code] = { ...(folder ? { folder } : {}) };
  records.push(...entries);
}

const index = {
  generatedAt: manifest.generatedAt ?? null,
  subjects,
  papers: records,
};

await writeFile(path.join(root, "public/papers-index.json"), JSON.stringify(index));
console.log(
  `papers-index.json: ${records.length} variants, ${mismatchCount} URL mismatches kept inline`
);
