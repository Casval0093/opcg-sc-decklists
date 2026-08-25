import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { assertPublicDecklist, serializePublicDecklist } from "./decklist.mjs";

export const CATALOG_INDEX_PATH = "lists/index.json";
const DATE_DIRECTORY = /^\d{4}-\d{2}-\d{2}$/u;
const CATALOG_ID = /^[0-9a-f]{64}$/u;

export function catalogId(record) {
  const payload = JSON.stringify({
    date: record.date,
    eventName: record.eventName,
    eventType: record.eventType,
    gameplayHash: record.gameplayHash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function catalogRelativePath(record) {
  if (typeof record?.date !== "string" || !DATE_DIRECTORY.test(record.date)) {
    throw new Error("catalog path date must be YYYY-MM-DD");
  }
  return `lists/${record.date}/${catalogId(record)}.json`;
}

function compareIndexRows(left, right) {
  for (const key of ["date", "eventName", "eventType", "leader", "gameplayHash", "path"]) {
    if (left[key] < right[key]) return -1;
    if (left[key] > right[key]) return 1;
  }
  return 0;
}

export function rebuildCatalogIndex(records) {
  const lists = records.map((record) => ({
    path: catalogRelativePath(record),
    date: record.date,
    eventName: record.eventName,
    eventType: record.eventType,
    leader: record.leader,
    gameplayHash: record.gameplayHash,
  })).sort(compareIndexRows);
  return {
    schemaVersion: 1,
    count: lists.length,
    lists,
  };
}

export function serializeCatalogIndex(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function listDeckFiles(listsDir, prefix = "lists") {
  if (!existsSync(listsDir)) return [];
  const files = [];
  for (const entry of readdirSync(listsDir, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    const full = join(listsDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listDeckFiles(full, relative));
    } else if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(relative);
    }
  }
  return files.sort();
}

export function loadCatalog(root) {
  const records = [];
  for (const relative of listDeckFiles(join(root, "lists"))) {
    const parsed = JSON.parse(readFileSync(join(root, relative), "utf8"));
    assertPublicDecklist(parsed);
    const expected = catalogRelativePath(parsed);
    if (relative !== expected) {
      throw new Error(`catalog path mismatch: ${relative} !== ${expected}`);
    }
    const id = relative.slice(relative.lastIndexOf("/") + 1, -".json".length);
    if (!CATALOG_ID.test(id)) {
      throw new Error(`catalog filename is not a 64-hex id: ${relative}`);
    }
    records.push({ path: relative, record: parsed });
  }
  return records;
}

export function assertCatalog(root) {
  const loaded = loadCatalog(root);
  const records = loaded.map((item) => item.record);
  const expectedIndex = rebuildCatalogIndex(records);
  const indexPath = join(root, CATALOG_INDEX_PATH);
  if (!existsSync(indexPath)) {
    if (records.length === 0) return { records: [], index: expectedIndex };
    throw new Error("lists/index.json is missing");
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  if (serializeCatalogIndex(index) !== serializeCatalogIndex(expectedIndex)) {
    throw new Error("lists/index.json does not match the catalog files");
  }
  return { records, index };
}

export { serializePublicDecklist };
