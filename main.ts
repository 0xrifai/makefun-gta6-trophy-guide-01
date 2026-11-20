// Leonida Trophy Guide — the program that hands the guide in.
//
// It copies this repository's app/ (the offline guide) and screenshots/
// (real renders of it) into the output directory and writes
// dossier.json there with make.fun's vendored library, so the judge
// reads the screenshots, the first load's files and bytes, and the
// source. Node 22, standard library only; no network, no clock, no
// randomness, so two runs write identical bytes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The scorer's caps for this bounty (from the gate): at most 4
// screenshots of 256 KiB each, app/ at most 993 entries and 48 MiB,
// dossier text at most 160 KiB. Only text_max_bytes shapes the bytes;
// the other caps make the program fail exactly where the scorer would.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

function fail(message: string): never {
  throw new Error("main.ts: " + message);
}

function copyTreeInto(sourceDir: string, targetDir: string): void {
  if (!existsSync(sourceDir)) fail("missing directory: " + sourceDir);
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function main(): void {
  const appDir = join(repoRoot, "app");
  const shotsDir = join(repoRoot, "screenshots");

  if (!existsSync(join(appDir, "index.html"))) fail("app/index.html is missing");
  if (!existsSync(join(appDir, "data", "trophies.json"))) fail("app/data/trophies.json is missing");
  const shotFiles = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => !f.startsWith(".")) : [];
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    fail("screenshots/ must hold 3 or 4 images, found " + shotFiles.length);
  }

  mkdirSync(outputDir, { recursive: true });
  copyTreeInto(appDir, join(outputDir, "app"));
  copyTreeInto(shotsDir, join(outputDir, "screenshots"));

  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, "dossier.json"), dossier);
  console.log(
    "wrote " + outputDir + " (app/ + " + shotFiles.length + " screenshots + dossier.json, " +
    Buffer.byteLength(dossier) + " bytes)",
  );
}

main();
