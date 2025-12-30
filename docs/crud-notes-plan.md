# CRUD Notes and Topics - Implementation Plan

This plan breaks down the implementation into 10 phases with specific, actionable steps. Each phase builds on the previous one.

---

## Phase 1: Database Migration

**Goal**: Add `status` field to notes table and update public queries.

### Step 1.1: Update Notes Schema
**File**: `/app/db/schemas/notes.ts`

```typescript
// Add this field after 'content':
status: text("status").notNull().default("draft"),
```

### Step 1.2: Generate and Run Migration
```bash
bun run db:generate
bun run db:migrate
```

### Step 1.3: Update Public Notes List Query
**File**: `/app/routes/_layout.notes._index/queries.server.ts`

- Add `eq(notes.status, 'published')` filter to `getNotes` query
- Import `eq` from `drizzle-orm` if not already imported

### Step 1.4: Update Public Note Detail Query
**File**: `/app/routes/_.notes.$slug/queries.server.ts`

- Add `eq(notes.status, 'published')` filter to `getNote` query
- Use `and()` to combine with existing `eq(notes.id, noteId)` condition

### Step 1.5: Verify
```bash
bun run typecheck
bun run dev
# Test that public /notes page still works
```

**Deliverables**:
- [ ] Notes table has `status` column
- [ ] Public queries filter by `published` status

---

## Phase 2: Install Dependencies

**Goal**: Add Dexie.js for IndexedDB management.

### Step 2.1: Install Dexie
```bash
bun add dexie
```

### Step 2.2: Verify Installation
```bash
bun run typecheck
```

**Deliverables**:
- [ ] Dexie.js installed and types available

---

## Phase 3: Shared Admin Components

**Goal**: Create reusable components used across Notes and Topics admin.

### Step 3.1: Create DeleteConfirmationModal
**File**: `/app/components/admin/DeleteConfirmationModal.tsx`

```typescript
// Component structure:
// - Modal using Dialog from /app/components/ui/Dialog.tsx
// - Warning message with item type and name
// - TextField for typing exact name
// - Delete button disabled until name matches exactly
// - Cancel button
// - Optional warningMessage prop for additional context

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'note' | 'topic';
  warningMessage?: string;
}
```

### Step 3.2: Create SyncStatusIndicator
**File**: `/app/components/admin/SyncStatusIndicator.tsx`

```typescript
// Component structure:
// - Display different states: synced, pending, syncing, error, offline
// - Show timestamp for last sync
// - Use appropriate icons (Check, AlertCircle, Loader, WifiOff)

interface SyncStatusIndicatorProps {
  status: 'synced' | 'pending' | 'syncing' | 'error' | 'offline';
  lastSyncedAt: Date | null;
  onRetry?: () => void;
}
```

### Step 3.3: Verify Components
```bash
bun run typecheck
```

**Deliverables**:
- [ ] DeleteConfirmationModal component working
- [ ] SyncStatusIndicator component working

---

## Phase 4: Topics CRUD (Foundation)

**Goal**: Complete Topics management - simplest CRUD to establish patterns.

### Step 4.1: Create Topics Queries
**File**: `/app/routes/admin.topics/queries.server.ts`

```typescript
// Implement:
// - getAllTopics(db): Get all topics ordered by name
// - getNotesCountByTopic(db, topicId): Count notes per topic
// - deleteTopic(db, topicId): Delete topic by ID
```

### Step 4.2: Create Topics List Route
**File**: `/app/routes/admin.topics/route.tsx`

```typescript
// Loader:
// - requireAdmin check
// - Fetch all topics with note counts

// Action:
// - intent: 'delete' - Delete topic (validate confirmName matches)

// Component:
// - Table with columns: Name, Notes Count, Actions
// - "New Topic" button linking to /admin/topics/new
// - Delete button opening DeleteConfirmationModal
// - Edit link to /admin/topics/:id
```

### Step 4.3: Create TopicForm Component
**File**: `/app/components/admin/TopicForm.tsx`

```typescript
// Component structure:
// - TextField for name
// - Submit button
// - Uses fetcher for form submission

interface TopicFormProps {
  mode: 'create' | 'edit';
  initialData?: { id: string; name: string };
}
```

### Step 4.4: Create New Topic Route
**File**: `/app/routes/admin.topics.new/route.tsx`

```typescript
// Loader:
// - requireAdmin check

// Action:
// - Validate name is provided
// - Generate UUID for id
// - Insert into topics table
// - Redirect to /admin/topics

// Component:
// - Page title "Create Topic"
// - TopicForm in create mode
```

### Step 4.5: Create Topic Edit Queries
**File**: `/app/routes/admin.topics.$topicId/queries.server.ts`

```typescript
// Implement:
// - getTopic(db, topicId): Get single topic
// - updateTopic(db, topicId, data): Update topic name
```

### Step 4.6: Create Topic Edit Route
**File**: `/app/routes/admin.topics.$topicId/route.tsx`

```typescript
// Loader:
// - requireAdmin check
// - Fetch topic by ID
// - Return 404 if not found

// Action:
// - Validate name
// - Update topic
// - Redirect to /admin/topics

// Component:
// - Page title "Edit Topic"
// - TopicForm in edit mode with initialData
```

### Step 4.7: Verify Topics CRUD
```bash
bun run typecheck
bun run dev
# Test: Create, Edit, Delete topics
```

**Deliverables**:
- [ ] Topics list page at /admin/topics
- [ ] Create topic at /admin/topics/new
- [ ] Edit topic at /admin/topics/:id
- [ ] Delete topic with confirmation modal
- [ ] Warning shown when deleting topic with notes

---

## Phase 5: Notes List Page

**Goal**: Create notes list with status badges and delete functionality.

### Step 5.1: Create Notes Admin Queries
**File**: `/app/routes/admin.notes/queries.server.ts`

```typescript
// Implement:
// - getAllNotesAdmin(db): Get all notes with topic names, ordered by updatedAt
// - deleteNote(db, noteId): Delete note and its relations
// - getAllTopics(db): For filter dropdown (reuse from topics)
```

### Step 5.2: Create Notes List Route
**File**: `/app/routes/admin.notes/route.tsx`

```typescript
// Loader:
// - requireAdmin check
// - Fetch all notes with topic info
// - Fetch all topics for filter

// Action:
// - intent: 'delete' - Delete note (validate confirmName)

// Component:
// - Filter by topic (optional)
// - Table: Title, Topic, Status (badge), Updated, Actions
// - Status badges: "Draft" (gray) / "Published" (green)
// - "New Note" button → /admin/notes/new
// - Edit link → /admin/notes/:id
// - Delete button → DeleteConfirmationModal
```

### Step 5.3: Verify Notes List
```bash
bun run typecheck
bun run dev
# Test: View notes list, delete a note
```

**Deliverables**:
- [ ] Notes list page at /admin/notes
- [ ] Status badges showing draft/published
- [ ] Delete with confirmation working

---

## Phase 6: IndexedDB & Sync Engine

**Goal**: Implement client-side storage and LWW sync logic.

### Step 6.1: Create IndexedDB Setup
**File**: `/app/lib/indexeddb.client.ts`

```typescript
// Implement:
// - NoteDraft interface
// - NotesDatabase class extending Dexie
// - Export db instance
// - Version 1 schema with 'drafts' store
```

### Step 6.2: Create Sync Engine
**File**: `/app/lib/sync-engine.client.ts`

```typescript
// Implement:
// - SyncResult interface
// - resolveConflict(local, server): Compare timestamps
// - pushToServer(draft): POST to server, handle response
// - pullFromServer(noteId): GET from server
// - syncNote(noteId): Full sync cycle with LWW resolution
```

### Step 6.3: Create useIndexedDBSync Hook
**File**: `/app/hooks/useIndexedDBSync.ts`

```typescript
// Implement:
// - Load draft from IndexedDB on mount
// - Initialize from server data if no local draft
// - Apply LWW on load if both exist
// - updateDraft(): Save to IndexedDB immediately
// - save(): Force sync to server
// - Set up 30s interval for auto-sync
// - Track syncStatus state
// - Handle online/offline events
```

### Step 6.4: Create useSyncStatus Hook
**File**: `/app/hooks/useSyncStatus.ts`

```typescript
// Implement:
// - Subscribe to online/offline events
// - Expose isOnline state
// - Format lastSyncedAt for display
```

### Step 6.5: Verify Hooks (Manual Testing)
```bash
bun run typecheck
# Will do integration testing with Notes form
```

**Deliverables**:
- [ ] IndexedDB database configured
- [ ] Sync engine with LWW logic
- [ ] useIndexedDBSync hook ready
- [ ] useSyncStatus hook ready

---

## Phase 7: Markdown Editor

**Goal**: Create tabbed Write/Preview markdown editor component.

### Step 7.1: Create MarkdownEditor Component
**File**: `/app/components/admin/MarkdownEditor.tsx`

```typescript
// Component structure:
// - Tabs component with "Write" and "Preview" tabs
// - Write tab: TextArea with monospace font, full height
// - Preview tab: MarkdownView component with parsed content
// - Parse markdown client-side for preview (markdownParser works in browser)
// - Preserve content between tab switches

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Implementation notes:
// - Import Tabs, TabList, Tab, TabPanel from /app/components/ui/Tabs.tsx
// - Import MarkdownView from /app/components/markdown.tsx
// - Import markdownParser from /app/utils/md.server.ts (works client-side too)
// - Use useState for active tab
// - TextArea should have: font-mono, resize-none, min-height
```

### Step 7.2: Verify MarkdownEditor
```bash
bun run typecheck
# Will test with NoteForm
```

**Deliverables**:
- [ ] MarkdownEditor with Write/Preview tabs
- [ ] Syntax highlighting in preview
- [ ] Smooth tab switching

---

## Phase 8: Notes Form & CRUD

**Goal**: Complete notes create/edit with all fields and sync.

### Step 8.1: Create NoteForm Component
**File**: `/app/components/admin/NoteForm.tsx`

```typescript
// Component structure:
// - Title: TextField
// - Topic: Select dropdown
// - Status: Select with Draft/Published options
// - Content: MarkdownEditor
// - Related Notes: RelatedNotesSelector (Phase 9)
// - SyncStatusIndicator
// - Save button (triggers sync)

// Integration with useIndexedDBSync:
// - Initialize hook with noteId and initialData
// - Call updateDraft on any field change
// - Call save on Save button click
// - Display syncStatus via SyncStatusIndicator

interface NoteFormProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialData?: NoteData;
  topics: Array<{ id: string; name: string }>;
  allNotes: Array<{ id: string; title: string }>;
}
```

### Step 8.2: Create Note Edit Queries
**File**: `/app/routes/admin.notes.$noteId/queries.server.ts`

```typescript
// Implement:
// - getNote(db, noteId): Get full note data
// - updateNote(db, noteId, data): Update note fields + updatedAt
// - getNoteRelations(db, noteId): Get related notes
// - getAllNotesForSelection(db, excludeId): Get notes for relation picker
// - syncNote(db, noteId, data, clientUpdatedAt): LWW-aware update
```

### Step 8.3: Create New Note Route
**File**: `/app/routes/admin.notes.new/route.tsx`

```typescript
// Loader:
// - requireAdmin check
// - Fetch all topics
// - Fetch all notes (for relations)

// Action:
// - intent: 'create' - Create note
//   - Generate UUID
//   - Insert note with provided fields
//   - Handle relatedNoteIds (insert into noteRelations)
//   - Return created note data for sync confirmation

// Component:
// - Page title "Create Note"
// - NoteForm in create mode
```

### Step 8.4: Create Edit Note Route
**File**: `/app/routes/admin.notes.$noteId/route.tsx`

```typescript
// Loader:
// - requireAdmin check
// - Fetch note by ID
// - Fetch related notes
// - Fetch all topics
// - Fetch all notes for selection
// - Return 404 if note not found

// Action:
// - intent: 'update' - Standard form update
// - intent: 'sync' - LWW sync from IndexedDB
//   - Compare clientUpdatedAt with server updatedAt
//   - If server newer: return conflict: true with server data
//   - If client newer: update server, return success

// Component:
// - Page title "Edit Note"
// - NoteForm in edit mode with initialData
```

### Step 8.5: Verify Notes CRUD
```bash
bun run typecheck
bun run dev
# Test: Create note, edit note, save, check IndexedDB in DevTools
```

**Deliverables**:
- [ ] Create note at /admin/notes/new
- [ ] Edit note at /admin/notes/:id
- [ ] IndexedDB auto-save working
- [ ] 30s periodic sync working
- [ ] Manual save button working
- [ ] LWW conflict resolution working

---

## Phase 9: Related Notes Feature

**Goal**: Add note-to-note relationship management.

### Step 9.1: Create RelatedNotesSelector Component
**File**: `/app/components/admin/RelatedNotesSelector.tsx`

```typescript
// Component structure:
// - ComboBox for searching notes
// - TagGroup showing selected notes as removable chips
// - Filter out current note and already selected
// - onChange callback with selected IDs array

interface RelatedNotesSelectorProps {
  selectedNotes: Array<{ id: string; title: string }>;
  availableNotes: Array<{ id: string; title: string }>;
  currentNoteId?: string;
  onChange: (selectedIds: string[]) => void;
}

// Implementation:
// - Use ComboBox from /app/components/ui/ComboBox.tsx
// - Use TagGroup from /app/components/ui/TagGroup.tsx
// - Filter availableNotes to exclude selected and current
// - On select: add to selectedNotes
// - On tag remove: filter from selectedNotes
```

### Step 9.2: Integrate into NoteForm
**File**: `/app/components/admin/NoteForm.tsx`

- Add RelatedNotesSelector below Content
- Pass allNotes and current selections
- Update draft.relatedNoteIds on change

### Step 9.3: Update Note Actions for Relations
**File**: `/app/routes/admin.notes.$noteId/route.tsx`

```typescript
// In action, after updating note:
// 1. Delete existing relations for this note
// 2. Insert new relations from relatedNoteIds array
```

### Step 9.4: Update Create Note for Relations
**File**: `/app/routes/admin.notes.new/route.tsx`

```typescript
// In action, after creating note:
// 1. Insert relations from relatedNoteIds array
```

### Step 9.5: Verify Related Notes
```bash
bun run typecheck
bun run dev
# Test: Add relations, remove relations, verify in DB
```

**Deliverables**:
- [ ] RelatedNotesSelector component working
- [ ] Can add/remove note relations
- [ ] Relations persisted to database

---

## Phase 10: Admin Navigation & Polish

**Goal**: Add navigation links and final polish.

### Step 10.1: Update Admin Layout
**File**: `/app/routes/admin.tsx`

```typescript
// Add navigation links in header/sidebar:
// - Notes (/admin/notes)
// - Topics (/admin/topics)
// - Blog Posts (/admin/blogpost) - existing

// Highlight active route
```

### Step 10.2: Add Empty States
- Notes list: "No notes yet. Create your first note."
- Topics list: "No topics yet. Create your first topic."

### Step 10.3: Add Loading States
- Use Suspense boundaries where appropriate
- Add loading indicators for async operations

### Step 10.4: Final Type Check
```bash
bun run typecheck
```

### Step 10.5: Lint and Format
```bash
bunx biome check --fix
```

### Step 10.6: Manual Testing Checklist

**Topics:**
- [ ] Create a new topic
- [ ] Edit topic name
- [ ] Delete topic without notes
- [ ] Try to delete topic with notes (should show warning)
- [ ] Confirm delete by typing exact name

**Notes:**
- [ ] Create a new note (draft)
- [ ] Edit note title, content, topic, status
- [ ] Verify auto-save to IndexedDB (check DevTools > Application > IndexedDB)
- [ ] Wait 30s and verify sync happens
- [ ] Click Save and verify immediate sync
- [ ] Publish note and verify it appears on public /notes page
- [ ] Unpublish note and verify it disappears from public
- [ ] Add related notes
- [ ] Remove related notes
- [ ] Delete note with confirmation

**Sync Scenarios:**
- [ ] Edit note, go offline, continue editing
- [ ] Come back online, verify sync
- [ ] Open same note in two tabs, edit in both, verify LWW resolution

### Step 10.7: Deploy to Production
```bash
bun run db:migrate-production  # Apply migration to prod
bun run deploy
```

**Deliverables**:
- [ ] Admin navigation working
- [ ] All CRUD operations tested
- [ ] Sync working correctly
- [ ] Code passes typecheck and lint
- [ ] Deployed to production

---

## File Summary

### New Files to Create (18 files)

| Phase | File | Description |
|-------|------|-------------|
| 3 | `/app/components/admin/DeleteConfirmationModal.tsx` | Type-to-confirm delete modal |
| 3 | `/app/components/admin/SyncStatusIndicator.tsx` | Sync status display |
| 4 | `/app/routes/admin.topics/queries.server.ts` | Topics database queries |
| 4 | `/app/routes/admin.topics/route.tsx` | Topics list page |
| 4 | `/app/components/admin/TopicForm.tsx` | Topic create/edit form |
| 4 | `/app/routes/admin.topics.new/route.tsx` | Create topic page |
| 4 | `/app/routes/admin.topics.$topicId/queries.server.ts` | Single topic queries |
| 4 | `/app/routes/admin.topics.$topicId/route.tsx` | Edit topic page |
| 5 | `/app/routes/admin.notes/queries.server.ts` | Notes admin queries |
| 5 | `/app/routes/admin.notes/route.tsx` | Notes list page |
| 6 | `/app/lib/indexeddb.client.ts` | Dexie.js database setup |
| 6 | `/app/lib/sync-engine.client.ts` | LWW sync logic |
| 6 | `/app/hooks/useIndexedDBSync.ts` | Main sync hook |
| 6 | `/app/hooks/useSyncStatus.ts` | Online/offline status |
| 7 | `/app/components/admin/MarkdownEditor.tsx` | Tabbed markdown editor |
| 8 | `/app/components/admin/NoteForm.tsx` | Note create/edit form |
| 8 | `/app/routes/admin.notes.$noteId/queries.server.ts` | Single note queries |
| 8 | `/app/routes/admin.notes.$noteId/route.tsx` | Edit note page |
| 8 | `/app/routes/admin.notes.new/route.tsx` | Create note page |
| 9 | `/app/components/admin/RelatedNotesSelector.tsx` | Note relations picker |

### Files to Modify (5 files)

| Phase | File | Change |
|-------|------|--------|
| 1 | `/app/db/schemas/notes.ts` | Add `status` field |
| 1 | `/app/routes/_layout.notes._index/queries.server.ts` | Filter by published |
| 1 | `/app/routes/_.notes.$slug/queries.server.ts` | Filter by published |
| 10 | `/app/routes/admin.tsx` | Add navigation links |

---

## Dependency Graph

```
Phase 1 (DB Migration)
    │
    ▼
Phase 2 (Install Dexie)
    │
    ├─────────────────┐
    ▼                 ▼
Phase 3 (Shared)    Phase 6 (IndexedDB)
    │                 │
    ▼                 ▼
Phase 4 (Topics)    Phase 7 (Editor)
    │                 │
    ▼                 │
Phase 5 (Notes List) │
    │                 │
    └────────┬────────┘
             ▼
      Phase 8 (Notes CRUD)
             │
             ▼
      Phase 9 (Relations)
             │
             ▼
      Phase 10 (Polish)
```

**Parallel Work Possible:**
- Phase 3 (Shared Components) and Phase 6 (IndexedDB) can be done in parallel
- Phase 4 (Topics) and Phase 7 (Editor) can be done in parallel after their dependencies

---

## Estimated Effort

| Phase | Complexity | Notes |
|-------|------------|-------|
| 1 | Low | Schema change + query updates |
| 2 | Trivial | Just `bun add dexie` |
| 3 | Medium | Two components, modal logic |
| 4 | Medium | Full CRUD, establishes patterns |
| 5 | Low | Reuses patterns from Phase 4 |
| 6 | High | Core sync logic, most complex |
| 7 | Medium | Tab switching, markdown parsing |
| 8 | High | Integrates everything |
| 9 | Medium | ComboBox + TagGroup integration |
| 10 | Low | Navigation + testing |
