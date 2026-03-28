# scripts · L2 Member Manifest

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，描述 `scripts/` 目录成员（一次性工具脚本）。

## Members
- [import-old-data.py](./import-old-data.py): 读取旧 SQLite (fusion-todo) + JSON (diary/tree)，生成 `old-data/import-bundle.json`。
- [seed-supabase.py](./seed-supabase.py): 读取 `import-bundle.json`，通过 Supabase REST API 批量 upsert 进新项目各表。
- [import-old-data.mjs](./import-old-data.mjs): 旧版 Node.js 草稿（已废弃，保留备查）。
