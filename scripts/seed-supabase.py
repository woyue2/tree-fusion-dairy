#!/usr/bin/env python3
"""
1. 在新 Supabase 项目上执行 schema SQL（建表）
2. 将 import-bundle.json 批量 upsert 进各表
"""

import json
import urllib.request
import urllib.error
import os

SUPABASE_URL = 'https://jlllzqrcmhbjhxqstvxz.supabase.co'
SERVICE_KEY  = '***REMOVED***'
BUNDLE_PATH  = '/home/aa/Park/tree-fusion-dairy/old-data/import-bundle.json'

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=ignore-duplicates,return=minimal',
}

def rest_upsert(table, rows):
    if not rows:
        return 0
    url = f'{SUPABASE_URL}/rest/v1/{table}'
    data = json.dumps(rows).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=HEADERS, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return len(rows)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'  ❌ {table} error {e.code}: {body[:300]}')
        return 0

# ── Load bundle ──────────────────────────────────────────
with open(BUNDLE_PATH, encoding='utf-8') as f:
    bundle = json.load(f)

print('📦 Bundle loaded:')
for k, v in bundle.items():
    print(f'   {k}: {len(v)}')

# ── Map bundle → Supabase tables ─────────────────────────
# statuses → todo_statuses
statuses_rows = [{
    'id': s['id'],
    'user_id': s['userId'],
    'title': s['title'],
    'color': s.get('color'),
    'collapsed': s.get('collapsed', False),
    'order_index': s.get('orderIndex', 0),
    'updated_at': 'now()',
} for s in bundle['statuses']]

# contexts → todo_contexts
contexts_rows = [{
    'id': c['id'],
    'user_id': c['userId'],
    'title': c['title'],
    'color': c.get('color'),
    'collapsed': c.get('collapsed', False),
    'order_index': c.get('orderIndex', 0),
    'updated_at': 'now()',
} for c in bundle['contexts']]

# tasks → todo_tasks
tasks_rows = [{
    'id': t['id'],
    'user_id': t['userId'],
    'title': t['title'],
    'status_id': t['statusId'],
    'context_id': t['contextId'],
    'color': t.get('color'),
    'tags': t.get('tags', []),
    'order_index': t.get('orderIndex', 0),
    'created_at': t.get('createdAt'),
    'updated_at': t.get('updatedAt'),
    'deleted_at': t.get('deletedAt'),
} for t in bundle['tasks']]

# diaries → diaries
diaries_rows = [{
    'id': d['id'],
    'user_id': d['userId'],
    'date': d['date'],
    'title': d.get('title', ''),
    'content': d.get('content', {}),
    'images': d.get('images', []),
    'analysis': d.get('aiAnalysis'),
    'created_at': d.get('createdAt'),
    'updated_at': d.get('updatedAt'),
    'deleted_at': d.get('deletedAt'),
} for d in bundle['diaries']]

# documents → tree_documents
docs_rows = [{
    'id': doc['id'],
    'user_id': doc.get('userId', 'default-user'),
    'title': doc.get('title', ''),
    'icon': doc.get('icon'),
    'root': doc.get('root', {}),
    'metadata': doc.get('metadata', {}),
    'updated_at': doc.get('updatedAt') or doc.get('updated_at'),
    'deleted_at': doc.get('deletedAt') or doc.get('deletedAt'),
} for doc in bundle['documents']]

# ── Upsert ───────────────────────────────────────────────
print('\n🚀 Uploading to Supabase...')

n = rest_upsert('todo_statuses', statuses_rows)
print(f'  ✅ todo_statuses:  {n}')

n = rest_upsert('todo_contexts', contexts_rows)
print(f'  ✅ todo_contexts:  {n}')

n = rest_upsert('todo_tasks', tasks_rows)
print(f'  ✅ todo_tasks:     {n}')

n = rest_upsert('diaries', diaries_rows)
print(f'  ✅ diaries:        {n}')

n = rest_upsert('tree_documents', docs_rows)
print(f'  ✅ tree_documents: {n}')

print('\n✅ 全部完成！')
