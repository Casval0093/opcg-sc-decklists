# opcg-sc-decklists (public)

Public catalog of Simplified Chinese **51-card** tournament lists: 1 leader + 50 main.

GitHub: https://github.com/Casval0093/opcg-sc-decklists

Nothing else belongs here. No crawler, no AVD, no player names, no W, no 名次.

## Record

- `leader` — gameplay ID
- `mainCounts` — gameplay IDs, sum 50
- `date`
- `eventName`
- `eventType` — 旗舰赛 / 标准赛 / 对战会 / 邀请赛 / 大型赛
- `gameplayHash`

Inclusion rule (applied by the private crawler before publish): 万代卡牌 卡组广场, 右上角筛选, 赛事类型 in the whitelist, 上位名次 with **冠军、亚军、四强 all checked**.

```bash
node --test schema/*.test.mjs
```
