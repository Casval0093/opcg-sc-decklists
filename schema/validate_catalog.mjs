#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { assertCatalog } from "./catalog.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function main(root = ROOT) {
  const { records, index } = assertCatalog(root);
  process.stdout.write(`${JSON.stringify({
    status: "ok",
    count: index.count,
    files: records.length,
  })}\n`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main(process.argv[2] ? resolve(process.argv[2]) : ROOT);
  } catch (error) {
    process.stderr.write(`validate_catalog: ${error.message}\n`);
    process.exitCode = 1;
  }
}
