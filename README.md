# opcg-sc-decklists (public)

Public catalog of Simplified Chinese **51-card** tournament lists: 1 leader + 50 main.

GitHub: https://github.com/Casval0093/opcg-sc-decklists

Nothing else belongs here. No player names, no W, no 名次, no crawler.

Do not hand-edit files under `lists/` unless you are fixing a validator bug.

## Record

- `leader` — gameplay ID
- `mainCounts` — gameplay IDs, sum 50
- `date`
- `eventName`
- `eventType` — 旗舰赛 / 标准赛 / 对战会 / 邀请赛 / 大型赛
- `gameplayHash` — `sha256:` of `{ leader, main: mainCounts }`
- `source` — always `bandaimatch-plaza`

Path: `lists/<YYYY-MM-DD>/<sha256(date,eventName,eventType,gameplayHash)>.json`

`lists/index.json` is generated from those files.

```bash
node --test schema/*.test.mjs
node schema/validate_catalog.mjs
```
