# Diary Module Integration & Sync Refinement

Integrate the **Structured Diary** module and ensure all existing core modules (Todo, Tree, Mood) are fully synchronized with a real Supabase database.

## User Review Required

> [!IMPORTANT]
> - This update adds a new `diaries` table to the Supabase schema. You will need to run the updated [supabase_schema.sql](file:///home/aa/Park/tree-fusion-dairy/supabase_schema.sql) in your Supabase SQL Editor.
> - The Diary module uses a JSONB structure for storing multiple versions (original, structured, final), similar to the Knowledge Tree.

## Proposed Changes

### Database Layer
---
#### [MODIFY] [supabase_schema.sql](file:///home/aa/Park/tree-fusion-dairy/supabase_schema.sql)
- Add `diaries` table with fields for title, date, content (JSONB), images, and analysis results.

#### [MODIFY] [db.ts](file:///home/aa/Park/tree-fusion-dairy/lib/db.ts)
- Add `diaries` table to Dexie.js schema.

#### [MODIFY] [supabase-db.ts](file:///home/aa/Park/tree-fusion-dairy/lib/supabase-db.ts)
- Implement [upsertDiary](file:///home/aa/Park/tree-fusion-dairy/lib/supabase-db.ts#122-141) and `fetchDiaries` CRUD wrappers.

### State & Sync
---
#### [NEW] [useDiaryStore.ts](file:///home/aa/Park/tree-fusion-dairy/hooks/useDiaryStore.ts)
- Implement diary state management with `zustand` and `immer`, supporting multi-version content and local persistence.

#### [MODIFY] [useSyncWorker.ts](file:///home/aa/Park/tree-fusion-dairy/hooks/useSyncWorker.ts)
- Add `diaries` sync logic to the background worker loop.

#### [MODIFY] [sync.ts](file:///home/aa/Park/tree-fusion-dairy/app/actions/sync.ts)
- Add [syncDiaryAction](file:///home/aa/Park/tree-fusion-dairy/app/actions/sync.ts#24-27) as a server action entry point.

### UI Components
---
#### [NEW] [DiaryContainer.tsx](file:///home/aa/Park/tree-fusion-dairy/components/diary/DiaryContainer.tsx)
- Main entry for the Diary module (List View).

#### [NEW] [DiaryEditor.tsx](file:///home/aa/Park/tree-fusion-dairy/components/diary/DiaryEditor.tsx)
- Full-screen editor supporting image paste, version toggling, and AI analysis triggers.

#### [NEW] [DiaryViewer.tsx](file:///home/aa/Park/tree-fusion-dairy/components/diary/DiaryViewer.tsx)
- Immersive reader modal with navigation and typography adjustment.

#### [MODIFY] [app/(private)/diary/page.tsx](file:///home/aa/Park/tree-fusion-dairy/app/(private)/diary/page.tsx)
- Initialize the Diary module and render the container.

### AI Analysis Integration [Requirement E]
---
#### [NEW] [ai.ts](file:///home/aa/Park/tree-fusion-dairy/app/actions/ai.ts)
- Implement [analyzeDiaryAction](file:///home/aa/Park/tree-fusion-dairy/app/actions/ai.ts#43-84) and [optimizeStructureAction](file:///home/aa/Park/tree-fusion-dairy/app/actions/ai.ts#85-119).
- Configure ZhipuAI (GLM-4) with prompts for emotional rewrite, key point extraction, and directory tree generation.

#### [MODIFY] [DiaryEditor.tsx](file:///home/aa/Park/tree-fusion-dairy/components/diary/DiaryEditor.tsx)
- Add "AI Assistant" button.
- Integrate analysis modal to display emotional mapping and structural suggestions.
- Add "Apply Optimization" logic to merge AI suggestions into the structured version.

#### [MODIFY] [useDiaryStore.ts](file:///home/aa/Park/tree-fusion-dairy/hooks/useDiaryStore.ts)
- Add `aiAnalysis` and `structured_version` to state.
- Implement methods to update and apply AI versions.

## Verification Plan

### Automated Tests
- Run `next lint` and `tsc --noEmit` to ensure no regression in types or code quality.

## Requirement F: Mood Real Database Integration
Migrating the Mood Recording feature to a fully synchronized model using Supabase as the "Real Database" truth source.

### Proposed Changes

#### [MODIFY] [useMoodStore.ts](file:///home/aa/Park/tree-fusion-dairy/hooks/useMoodStore.ts)
- Add `pullMoods` action to fetch data from Supabase via Server Action.
- Add `syncMoods` action to combine pull and push.
- Update [loadMoods](file:///home/aa/Park/tree-fusion-dairy/hooks/useMoodStore.ts#26-31) to potentially trigger a pull if empty or on demand.

#### [MODIFY] [syncEngine.ts](file:///home/aa/Park/tree-fusion-dairy/hooks/syncEngine.ts)
- Add `pullAll` logic or specifically include `pullMoods` in the initialization phase.
- Ensure [syncMoodAction](file:///home/aa/Park/tree-fusion-dairy/app/actions/sync.ts#12-15) is reliable and handles errors gracefully.

#### [MODIFY] [IdeaModal.tsx](file:///home/aa/Park/tree-fusion-dairy/components/todo/IdeaModal.tsx)
- Optional: Trigger a manual sync run after [addMood](file:///home/aa/Park/tree-fusion-dairy/hooks/useMoodStore.ts#32-46) to provide immediate feedback.

#### [NEW] [sync.ts](file:///home/aa/Park/tree-fusion-dairy/app/actions/sync.ts) (Verify/Extend)
- Add `fetchUserDataAction` if not already present.

### Verification Plan
- **Manual Verification**:
    1. Open Supabase Dashboard, check `moods` table.
    2. Record a mood in the app.
    3. Verify `_dirty` flag in Dexie (via console/DevTools).
    4. Wait for sync or trigger manual sync.
    5. Refresh Supabase Dashboard to confirm record existence.
    6. Clear Dexie and refresh app to verify data is pulled from cloud.
    7. Interactive Test: Create a diary entry, paste an image link, and verify it's parsed.
    8. AI Logic Test: Trigger emotional analysis and verify the poetic title and rewritten version are generated.
    9. Structure Test: Trigger structural optimization and verify the Linux-style tree and bullet points appear.
    10. Persistence Test: Refresh page and ensure local Dexie data persists.
    11. Sync Test: Check Supabase dashboard to verify the `diaries` table received the record and `_dirty` cleared.
    12. Outliner Logic: Briefly re-verify Tree/Todo modules to ensure `useSyncWorker` changes didn't affect them.
