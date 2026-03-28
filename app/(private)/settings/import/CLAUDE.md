# settings/import · L2 Member Manifest

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，描述 `app/(private)/settings/import` 目录成员。

## Members
- [page.tsx](./page.tsx): 历史数据导入页面 Server Component，渲染 BundleImporter。
- [BundleImporter.tsx](./BundleImporter.tsx): Client Component，选取 import-bundle.json 文件，逐条写入 Dexie IndexedDB（跳过 id 冲突）。
