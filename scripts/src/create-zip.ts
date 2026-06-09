import { createRequire } from "module";
import fs from "fs";
import path from "path";

const req = createRequire(import.meta.url);
const AdmZip = req("adm-zip") as typeof import("adm-zip");

const ROOT = path.resolve(import.meta.dirname, "../../");
const OUTPUT = path.join(ROOT, "wasla-app.zip");

const EXCLUDE_DIRS = new Set([
  "node_modules", ".git", "dist", "coverage", ".cache",
  ".pnpm-store", ".local", ".agents", "data",
]);

const EXCLUDE_EXTS = new Set([".map", ".tsbuildinfo"]);
const EXCLUDE_NAMES = new Set(["wasla-app.zip", "wasla-app.tar.gz"]);

const zip = new AdmZip();

function addDir(dir: string, zipPath: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const rel = zipPath ? path.join(zipPath, entry.name) : entry.name;
    if (entry.isDirectory()) {
      addDir(full, rel);
    } else {
      if (EXCLUDE_NAMES.has(entry.name)) continue;
      if (EXCLUDE_EXTS.has(path.extname(entry.name))) continue;
      zip.addLocalFile(full, path.dirname(rel));
    }
  }
}

console.log("Building ZIP archive...");
addDir(ROOT, "wasla-app");
zip.writeZip(OUTPUT);

const mb = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
console.log(`✅ wasla-app.zip created (${mb} MB)`);
