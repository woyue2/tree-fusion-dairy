#!/usr/bin/env python3
"""
一次性旧数据导入脚本
将旧 SQLite (fusion-todo) + JSON (diary, tree) 导出为 import-bundle.json
"""

import sqlite3
import json
from pathlib import Path

USER_ID = 'default-user'
NOW = '2026-03-29T00:00:00.000Z'

TODO_DB  = '/home/aa/Park/fusion-todo/data/todo.db'
DIARY_JSON = '/home/aa/Park/tree-fusion-dairy/old-data/diary-backup-2026-03-15.json'
TREE_JSON  = '/home/aa/Park/tree-fusion-dairy/old-data/tree.json'
OUT_PATH   = '/home/aa/Park/tree-fusion-dairy/old-data/import-bundle.json'

# ─── 1. Todo ─────────────────────────────────────────────
conn = sqlite3.connect(TODO_DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

raw_statuses = cur.execute('SELECT id,title,"order",collapsed,belowOf FROM statuses ORDER BY "order"').fetchall()
raw_contexts = cur.execute('SELECT id,title,color,"order",collapsed,belowOf FROM contexts ORDER BY "order"').fetchall()
raw_tasks    = cur.execute('SELECT id,title,status,context,tags,color,"order",createdAt FROM tasks ORDER BY "order"').fetchall()
conn.close()

statuses = [{
    'id': r['id'],
    'userId': USER_ID,
    'title': r['title'],
    'collapsed': bool(r['collapsed']),
    'orderIndex': r['order'] or 0,
    'belowOf': r['belowOf'],
    '_dirty': 0,
} for r in raw_statuses]

contexts = [{
    'id': r['id'],
    'userId': USER_ID,
    'title': r['title'],
    'color': r['color'] or '#888888',
    'collapsed': bool(r['collapsed']),
    'orderIndex': r['order'] or 0,
    'belowOf': r['belowOf'],
    '_dirty': 0,
} for r in raw_contexts]

tasks = []
for r in raw_tasks:
    try:
        tags = json.loads(r['tags'] or '[]')
    except:
        tags = []
    tasks.append({
        'id': r['id'],
        'userId': USER_ID,
        'title': r['title'],
        'statusId': r['status'],
        'contextId': r['context'],
        'color': r['color'] or '#ffffff',
        'tags': tags,
        'orderIndex': r['order'] or 0,
        'createdAt': r['createdAt'] or NOW,
        'updatedAt': NOW,
        'deletedAt': None,
        '_dirty': 0,
    })

print(f'✅ Todo: {len(statuses)} statuses, {len(contexts)} contexts, {len(tasks)} tasks')

# ─── 2. Diary ────────────────────────────────────────────
with open(DIARY_JSON, encoding='utf-8') as f:
    diary_backup = json.load(f)

diaries = []
for d in diary_backup['diaries']:
    diaries.append({
        'id': d['id'],
        'userId': USER_ID,
        'title': d.get('title') or '',
        'date': d['date'],
        'content': {
            'original': d.get('content') or d.get('original_content') or '',
            'structured': d.get('structured_version') or None,
            'final': d.get('finalVersion') or None,
        },
        'images': d.get('images') or [],
        'footerImages': d.get('footer_images') or [],
        'aiAnalysis': d.get('analysis') or None,
        'tags': [],
        'createdAt': d.get('createdAt') or NOW,
        'updatedAt': d.get('updatedAt') or NOW,
        'deletedAt': None,
        '_dirty': 0,
    })

print(f'✅ Diary: {len(diaries)} entries')

# ─── 3. Tree ─────────────────────────────────────────────
with open(TREE_JSON, encoding='utf-8') as f:
    raw_tree = json.load(f)

documents = []
for doc in raw_tree:
    doc['userId'] = USER_ID
    doc['_dirty'] = 0
    documents.append(doc)

print(f'✅ Tree: {len(documents)} documents')

# ─── 4. Write bundle ─────────────────────────────────────
bundle = {
    'statuses': statuses,
    'contexts': contexts,
    'tasks': tasks,
    'diaries': diaries,
    'documents': documents,
}

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(bundle, f, ensure_ascii=False, indent=2)

print(f'\n📦 Bundle written to {OUT_PATH}')
print(f'   statuses:  {len(statuses)}')
print(f'   contexts:  {len(contexts)}')
print(f'   tasks:     {len(tasks)}')
print(f'   diaries:   {len(diaries)}')
print(f'   documents: {len(documents)}')
