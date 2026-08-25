import assert from "node:assert/strict";
import test from "node:test";

import { assertPublicDecklist } from "./decklist.mjs";

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

test("a 51-card plaza record is accepted", () => {
  assert.doesNotThrow(() => assertPublicDecklist(list()));
});

test("W and player identity are catalog-illegal", () => {
  assert.throws(() => assertPublicDecklist(list({ w: true })), /not allowed/);
  assert.throws(() => assertPublicDecklist(list({ playerName: "李四" })), /not allowed/);
  assert.throws(() => assertPublicDecklist(list({ placement: "四强" })), /not allowed/);
});

test("unknown keys are catalog-illegal", () => {
  assert.throws(() => assertPublicDecklist(list({ note: "secret" })), /not allowed/);
});

test("source must be bandaimatch-plaza", () => {
  assert.throws(() => assertPublicDecklist(list({ source: "jihuanshe" })), /bandaimatch-plaza/);
});

test("non-whitelist event types are catalog-illegal", () => {
  assert.throws(() => assertPublicDecklist(list({ eventType: "店赛" })), /whitelist/);
});
