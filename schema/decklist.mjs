const MAIN_SIZE = 50;
const ALLOWED_EVENT_TYPES = Object.freeze([
  "旗舰赛",
  "标准赛",
  "对战会",
  "邀请赛",
  "大型赛",
]);
const FORBIDDEN_KEYS = Object.freeze([
  "w",
  "W",
  "winner",
  "playerName",
  "player",
  "handle",
  "placement",
  "rank",
]);
const ALLOWED_KEYS = Object.freeze([
  "schemaVersion",
  "leader",
  "mainCounts",
  "mainSize",
  "date",
  "eventName",
  "eventType",
  "gameplayHash",
  "source",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function assertPublicDecklist(record) {
  if (!isRecord(record)) throw new Error("decklist must be an object");
  for (const key of FORBIDDEN_KEYS) {
    if (Object.hasOwn(record, key)) {
      throw new Error(`${key} is not allowed in the public catalog`);
    }
  }
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.includes(key)) {
      throw new Error(`${key} is not allowed in the public catalog`);
    }
  }
  if (record.schemaVersion !== 1) throw new Error("schemaVersion must be 1");
  if (typeof record.leader !== "string" || record.leader.length === 0) {
    throw new Error("leader is required");
  }
  if (!isRecord(record.mainCounts)) throw new Error("mainCounts must be an object");
  const total = Object.values(record.mainCounts).reduce((sum, n) => {
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error("mainCounts values must be positive integers");
    return sum + n;
  }, 0);
  if (total !== MAIN_SIZE) throw new Error(`mainCounts must sum to ${MAIN_SIZE}`);
  if (record.mainSize !== MAIN_SIZE) throw new Error(`mainSize must be ${MAIN_SIZE}`);
  if (typeof record.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(record.date)) {
    throw new Error("date must be YYYY-MM-DD");
  }
  if (typeof record.eventName !== "string" || record.eventName.length === 0) {
    throw new Error("eventName is required");
  }
  if (!ALLOWED_EVENT_TYPES.includes(record.eventType)) {
    throw new Error("eventType is not in the whitelist");
  }
  if (typeof record.gameplayHash !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(record.gameplayHash)) {
    throw new Error("gameplayHash must be sha256:<hex>");
  }
  if (record.source !== "bandaimatch-plaza") {
    throw new Error("source must be bandaimatch-plaza");
  }
}

export function serializePublicDecklist(record) {
  const ordered = {};
  for (const key of ALLOWED_KEYS) {
    ordered[key] = record[key];
  }
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

export { ALLOWED_EVENT_TYPES, ALLOWED_KEYS, FORBIDDEN_KEYS, MAIN_SIZE };
