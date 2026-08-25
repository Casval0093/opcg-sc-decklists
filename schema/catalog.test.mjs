import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  assertCatalog,
  catalogId,
  catalogRelativePath,
  rebuildCatalogIndex,
  serializeCatalogIndex,
} from "./catalog.mjs";
import { serializePublicDecklist } from "./decklist.mjs";

function list(overrides = {}) {
  return {
    schemaVersion: 1,
    leader: "OP16-001",
    mainCounts: { "OP16-015": 16, "OP16-018": 16, "OP16-023": 16, "OP16-118": 2 },
    mainSize: 50,
    date: "2026-08-18",
    eventName: "上海旗舰赛",
    eventType: "旗舰赛",
    gameplayHash: `sha256:${"a".repeat(64)}`,
    source: "bandaimatch-plaza",
    ...overrides,
  };
}

test("catalog path is lists/<date>/<64 hex>.json", () => {
  const record = list();
  const path = catalogRelativePath(record);
  assert.match(path, /^lists\/2026-08-18\/[0-9a-f]{64}\.json$/u);
  assert.equal(catalogId(record).length, 64);
});

test("index omits player fields and sorts by date", () => {
  const later = list({
    date: "2026-08-19",
    eventName: "广州标准赛",
    eventType: "标准赛",
    gameplayHash: `sha256:${"b".repeat(64)}`,
  });
  const index = rebuildCatalogIndex([later, list()]);
  assert.equal(index.count, 2);
  assert.equal(index.lists[0].date, "2026-08-18");
  assert.equal(index.lists[1].date, "2026-08-19");
  assert.equal(index.lists[0].playerName, undefined);
  assert.equal(index.lists[0].placement, undefined);
});

test("assertCatalog accepts a matching checkout and rejects a stale index", () => {
  const record = list();
  const root = mkdtempSync(join(tmpdir(), "opcg-lists-"));
  const path = catalogRelativePath(record);
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), serializePublicDecklist(record));
  writeFileSync(join(root, "lists/index.json"), serializeCatalogIndex(rebuildCatalogIndex([record])));
  assert.equal(assertCatalog(root).records.length, 1);

  writeFileSync(join(root, "lists/index.json"), serializeCatalogIndex(rebuildCatalogIndex([])));
  assert.throws(() => assertCatalog(root), /does not match/);
});
