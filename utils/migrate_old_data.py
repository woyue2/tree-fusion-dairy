"""
[INPUT]:    Old JSON/SQLite data from old-data/ directory
[OUTPUT]:   Data injected into Supabase PostgreSQL tables
[POS]:      utils/migrate_old_data.py - One-time migration utility
[PROTOCOL]: Change this header and check CLAUDE.md on update
"""
import json
import sqlite3
import requests
import os
import uuid
from datetime import datetime

# Supabase Config
SUPABASE_URL = "https://peoryiecvofhqxuaerlk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb3J5aWVjdm9maHF4dWFlcmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODM5OTEsImV4cCI6MjA4OTE1OTk5MX0.FwVRYz7LCts-1StUlqAdBQiOFy8kuJP0f_H_g76ekIE"
USER_ID = "default-user"

def get_uuid(original_id):
    if not original_id:
        return str(uuid.uuid4())
    try:
        uuid.UUID(original_id)
        return original_id
    except:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(original_id)))

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

OLD_DATA_DIR = "/home/aa/Park/tree-fusion-dairy/old-data"

def log(msg):
    print(f"[*] {msg}")

def push_to_supabase(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=HEADERS, json=data)
    if response.status_code in [200, 201, 204]:
        log(f"Successfully pushed {len(data)} items to {table}")
    else:
        print(f"[!] Error pushing to {table}: {response.status_code} - {response.text}")

def migrate_diaries():
    path = os.path.join(OLD_DATA_DIR, "diary-backup-2026-03-15.json")
    if not os.path.exists(path):
        log("Diary backup not found, skipping...")
        return

    with open(path, 'r', encoding='utf-8') as f:
        backup = json.load(f)

    diaries = backup.get("diaries", [])
    log(f"Found {len(diaries)} diaries. Mapping...")

    to_push = []
    for d in diaries:
        entry = {
            "id": get_uuid(d["id"]),
            "user_id": USER_ID,
            "date": d["date"],
            "title": d.get("title", ""),
            "content": {
                "original": d.get("original_content") or d.get("content", ""),
                "structured": d.get("structured_version"),
                "final": d.get("finalVersion") or d.get("content", "")
            },
            "images": d.get("images", []),
            "analysis": d.get("analysis"),
            "created_at": d.get("createdAt"),
            "updated_at": d.get("updatedAt")
        }
        to_push.append(entry)
    
    push_to_supabase("diaries", to_push)

def migrate_tree():
    path = os.path.join(OLD_DATA_DIR, "tree.json")
    if not os.path.exists(path):
        log("Tree JSON not found, skipping...")
        return

    with open(path, 'r', encoding='utf-8') as f:
        docs = json.load(f)

    log(f"Found {len(docs)} tree documents. Mapping...")

    to_push = []
    for d in docs:
        entry = {
            "id": d["id"],
            "user_id": USER_ID,
            "title": d.get("title", "Untitled"),
            "icon": d["root"].get("icon"),
            "root": d["root"],
            "metadata": {
                "createdAt": d["root"].get("createdAt", 0),
                "updatedAt": d["root"].get("updatedAt", 0),
                "version": "1.0"
            },
            "created_at": datetime.fromtimestamp(d["root"].get("createdAt", 0)/1000).isoformat() if d["root"].get("createdAt") else None,
            "updated_at": datetime.fromtimestamp(d["root"].get("updatedAt", 0)/1000).isoformat() if d["root"].get("updatedAt") else None
        }
        to_push.append(entry)

    push_to_supabase("tree_documents", to_push)

def migrate_todos():
    path = os.path.join(OLD_DATA_DIR, "fusion-todo.db")
    if not os.path.exists(path):
        log("Todo DB not found, skipping...")
        return

    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    # 1. Migrate Statuses
    log("Migrating Statuses...")
    cursor.execute("SELECT id, title, \"order\", collapsed FROM statuses")
    statuses = []
    for row in cursor.fetchall():
        statuses.append({
            "id": row[0],
            "user_id": USER_ID,
            "title": row[1],
            "order_index": row[2],
            "collapsed": bool(row[3])
        })
    if statuses:
        push_to_supabase("todo_statuses", statuses)

    # 2. Migrate Contexts
    log("Migrating Contexts...")
    cursor.execute("SELECT id, title, color, \"order\", collapsed FROM contexts")
    contexts = []
    for row in cursor.fetchall():
        contexts.append({
            "id": row[0],
            "user_id": USER_ID,
            "title": row[1],
            "color": row[2],
            "order_index": row[3],
            "collapsed": bool(row[4])
        })
    if contexts:
        push_to_supabase("todo_contexts", contexts)

    # 3. Migrate Tasks
    log("Migrating Tasks...")
    cursor.execute("SELECT id, title, status, context, tags, color, \"order\", createdAt FROM tasks")
    tasks = []
    for row in cursor.fetchall():
        tags_raw = row[4]
        tags = []
        try:
            if tags_raw:
                tags = json.loads(tags_raw)
        except:
            pass

        tasks.append({
            "id": get_uuid(row[0]),
            "user_id": USER_ID,
            "title": row[1],
            "status_id": row[2],
            "context_id": row[3],
            "tags": tags,
            "color": row[5],
            "order_index": row[6],
            "created_at": row[7],
            "updated_at": row[7]
        })
    if tasks:
        push_to_supabase("todo_tasks", tasks)

    conn.close()

if __name__ == "__main__":
    log("Starting migration...")
    migrate_diaries()
    migrate_tree()
    migrate_todos()
    log("Migration finished.")
