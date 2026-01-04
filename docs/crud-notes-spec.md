# CRUD Notes and Topics Feature Specification

## Overview

This document specifies the admin CRUD functionality for Notes and Topics, including a markdown editor with live preview, IndexedDB-based auto-save with LWW (Last-Write-Wins) synchronization, and deletion guardrails.

---

## Feature Requirements

### Notes Management
- Create, read, update, delete notes with markdown content
- Notes can be **draft** (hidden from public) or **published**
- Assign notes to topics
- Create relationships between notes (note-to-note linking)
- Markdown editor with tabbed Write/Preview interface (GitLab style)
- Auto-save to IndexedDB with periodic sync to server

### Topics Management
- Create, read, update, delete topics
- Topics are always public (no draft status)
- Flat structure only (ignore hierarchical parentId for now)
- Cannot delete topics that have notes without explicit confirmation

### Deletion Guardrails
- Hard delete (actually removes from database)
- Confirmation modal requiring user to type the exact name of the item
- For topics: show warning if topic has associated notes

---

## Design Decisions

| Feature | Decision | Rationale |
|---------|----------|-----------|
| Auto-save storage | IndexedDB (Dexie.js) | Better offline support, async API, larger storage |
| Sync strategy | LWW (Last-Write-Wins) | Simple, deterministic conflict resolution |
| LWW granularity | Whole note level | Simpler implementation, avoids partial merges |
| Conflict handling | Server auto-overwrites local if newer | Pure LWW, no user intervention needed |
| Sync triggers | Every ~30s + explicit Save button | Balance between data safety and server load |
| Editor style | Tabbed Write/Preview | Clean UI, full width for each mode |
| Relations UI | Search + multi-select dropdown | Easy discovery and selection of related notes |
| Delete confirmation | Type exact name | Maximum protection against accidental deletion |
| Topic status | Always public | Topics are organizational, not content |
| Topic hierarchy | Flat only | Keep initial implementation simple |

---

## Database Schema Changes

### Migration: Add `status` field to notes

**SQL Migration** (`drizzle/XXXX_add_notes_status.sql`):
```sql
ALTER TABLE `notes` ADD COLUMN `status` text DEFAULT 'draft' NOT NULL;
```

**Updated Schema** (`/app/db/schemas/notes.ts`):
```typescript
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { topics } from "./topics";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  status: text("status").notNull().default("draft"), // NEW: 'draft' | 'published'
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});
```

### Existing Schema Reference

**Topics** (`/app/db/schemas/topics.ts`):
```typescript
export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id").references(() => topics.id, { onDelete: "set null" }), // NOT USED initially
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});
```

**Note Relations** (`/app/db/schemas/note-relations.ts`):
```typescript
export const noteRelations = sqliteTable("note_relations", {
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  relatedNoteId: text("related_note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.relatedNoteId] }),
}));
```

---

## File Structure

### New Admin Routes

```
app/routes/
├── admin.notes/
│   ├── route.tsx                 # Notes list page (loader, action, component)
│   └── queries.server.ts         # getAllNotes, deleteNote
├── admin.notes.new/
│   └── route.tsx                 # Create new note
├── admin.notes.$noteId/
│   ├── route.tsx                 # Edit existing note
│   └── queries.server.ts         # getNote, updateNote, getNoteRelations
├── admin.topics/
│   ├── route.tsx                 # Topics list page
│   └── queries.server.ts         # getAllTopics, deleteTopic, getNotesCountByTopic
├── admin.topics.new/
│   └── route.tsx                 # Create new topic
└── admin.topics.$topicId/
    ├── route.tsx                 # Edit existing topic
    └── queries.server.ts         # getTopic, updateTopic
```

### New Components

```
app/components/admin/
├── MarkdownEditor.tsx            # Tabbed Write/Preview markdown editor
├── NoteForm.tsx                  # Complete note form with all fields
├── TopicForm.tsx                 # Simple topic form (name only)
├── DeleteConfirmationModal.tsx   # Type-to-confirm deletion modal
├── RelatedNotesSelector.tsx      # Multi-select for note-to-note relations
└── SyncStatusIndicator.tsx       # Shows sync status (synced/pending/offline)
```

### New Hooks & Utilities

```
app/hooks/
├── useIndexedDBSync.ts           # Main sync hook for notes
└── useSyncStatus.ts              # Reactive sync status

app/lib/
├── indexeddb.client.ts           # Dexie.js database setup
└── sync-engine.client.ts         # LWW sync logic
```

---

## IndexedDB Schema & Sync Strategy

### Dexie.js Database Setup

**File**: `/app/lib/indexeddb.client.ts`

```typescript
import Dexie, { type Table } from 'dexie';

export interface NoteDraft {
  id: string;                          // note ID or 'new-{uuid}' for new notes
  title: string;
  content: string;
  topicId: string;
  status: 'draft' | 'published';
  relatedNoteIds: string[];
  updatedAt: number;                   // Unix timestamp (ms) for LWW comparison
  syncStatus: 'synced' | 'pending';
  serverUpdatedAt: number | null;      // Last known server timestamp
}

export class NotesDatabase extends Dexie {
  drafts!: Table<NoteDraft, string>;

  constructor() {
    super('notes-admin-db');
    this.version(1).stores({
      drafts: 'id, syncStatus, updatedAt'
    });
  }
}

export const db = new NotesDatabase();
```

### LWW Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNC FLOW DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER EDITS NOTE                                                │
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────┐                                           │
│  │ Save to IndexedDB│  updatedAt = Date.now()                  │
│  │ syncStatus=pending│                                          │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐     Every 30s OR on Save click            │
│  │  Sync Timer /   │◄────────────────────────────              │
│  │  Save Button    │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Push to Server  │  POST /admin/notes/:id (action)           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Server Response │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│     ┌─────┴─────┐                                              │
│     ▼           ▼                                              │
│  SUCCESS     CONFLICT (server has newer)                       │
│     │           │                                              │
│     ▼           ▼                                              │
│  Update      Overwrite local with                              │
│  serverUpdatedAt   server data (LWW)                           │
│  syncStatus=synced                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sync Engine Logic

**File**: `/app/lib/sync-engine.client.ts`

```typescript
interface SyncResult {
  status: 'synced' | 'conflict-resolved' | 'error';
  data?: NoteDraft;
  error?: string;
}

// Compare timestamps and determine winner
function resolveConflict(local: NoteDraft, server: ServerNote): 'local' | 'server' {
  const serverTimestamp = new Date(server.updatedAt).getTime();
  return local.updatedAt > serverTimestamp ? 'local' : 'server';
}

// Push local changes to server
async function pushToServer(draft: NoteDraft): Promise<SyncResult> {
  const response = await fetch(`/admin/notes/${draft.id}`, {
    method: 'POST',
    body: JSON.stringify({
      intent: 'sync',
      ...draft,
      clientUpdatedAt: draft.updatedAt
    })
  });

  if (!response.ok) {
    return { status: 'error', error: 'Failed to sync' };
  }

  const serverData = await response.json();

  // Check if server had newer data
  if (serverData.conflict) {
    // Server wins - update local with server data
    await db.drafts.put({
      ...serverData.note,
      updatedAt: new Date(serverData.note.updatedAt).getTime(),
      serverUpdatedAt: new Date(serverData.note.updatedAt).getTime(),
      syncStatus: 'synced'
    });
    return { status: 'conflict-resolved', data: serverData.note };
  }

  // Success - update local sync status
  await db.drafts.update(draft.id, {
    serverUpdatedAt: new Date(serverData.updatedAt).getTime(),
    syncStatus: 'synced'
  });

  return { status: 'synced' };
}
```

### useIndexedDBSync Hook

**File**: `/app/hooks/useIndexedDBSync.ts`

```typescript
interface UseIndexedDBSyncOptions {
  noteId: string | 'new';
  initialData?: ServerNote;
  syncInterval?: number; // default 30000ms
}

interface UseIndexedDBSyncReturn {
  draft: NoteDraft | null;
  updateDraft: (updates: Partial<NoteDraft>) => Promise<void>;
  save: () => Promise<SyncResult>;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error' | 'offline';
  lastSyncedAt: Date | null;
}

function useIndexedDBSync(options: UseIndexedDBSyncOptions): UseIndexedDBSyncReturn {
  // Implementation:
  // 1. On mount: Load from IndexedDB or initialize from server data
  // 2. Compare timestamps if both exist, apply LWW
  // 3. Set up 30s interval for auto-sync
  // 4. Expose updateDraft for immediate IndexedDB saves
  // 5. Expose save for manual sync trigger
  // 6. Track online/offline status
}
```

---

## Component Specifications

### MarkdownEditor

**Props**:
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}
```

**Behavior**:
- Two tabs: "Write" and "Preview"
- Write tab: `<TextArea>` with monospace font for markdown editing
- Preview tab: Renders markdown using existing `markdownParser` + `MarkdownView`
- Preserves scroll position when switching tabs
- Uses existing Tabs component from `/app/components/ui/Tabs.tsx`

### NoteForm

**Props**:
```typescript
interface NoteFormProps {
  mode: 'create' | 'edit';
  noteId?: string;
  initialData?: {
    title: string;
    content: string;
    topicId: string;
    status: 'draft' | 'published';
    relatedNotes: Array<{ id: string; title: string }>;
  };
  topics: Array<{ id: string; name: string }>;
  allNotes: Array<{ id: string; title: string }>; // For related notes selection
}
```

**Fields**:
| Field | Component | Required |
|-------|-----------|----------|
| Title | TextField | Yes |
| Topic | Select dropdown | Yes |
| Status | Select ('Draft' / 'Published') | Yes |
| Content | MarkdownEditor | No |
| Related Notes | RelatedNotesSelector | No |

**Actions**:
- Save button: Syncs to server immediately
- Auto-save indicator showing sync status

### TopicForm

**Props**:
```typescript
interface TopicFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id: string;
    name: string;
  };
}
```

**Fields**:
| Field | Component | Required |
|-------|-----------|----------|
| Name | TextField | Yes |

### DeleteConfirmationModal

**Props**:
```typescript
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'note' | 'topic';
  warningMessage?: string; // e.g., "This topic has 5 notes"
}
```

**Behavior**:
- Modal overlay with warning message
- TextField where user must type exact item name
- Delete button disabled until input matches `itemName` exactly (case-sensitive)
- Cancel button always enabled
- Shows additional warning for topics with notes

### RelatedNotesSelector

**Props**:
```typescript
interface RelatedNotesSelectorProps {
  selectedNotes: Array<{ id: string; title: string }>;
  availableNotes: Array<{ id: string; title: string }>;
  currentNoteId?: string; // Exclude from selection
  onChange: (selectedIds: string[]) => void;
}
```

**Behavior**:
- Searchable ComboBox dropdown
- Shows selected notes as removable tags/chips
- Filters out already selected notes from dropdown
- Filters out current note (can't relate to self)

### SyncStatusIndicator

**Props**:
```typescript
interface SyncStatusIndicatorProps {
  status: 'synced' | 'pending' | 'syncing' | 'error' | 'offline';
  lastSyncedAt: Date | null;
}
```

**Display**:
| Status | Display |
|--------|---------|
| synced | "Saved" with checkmark, timestamp |
| pending | "Unsaved changes" with warning color |
| syncing | "Saving..." with spinner |
| error | "Save failed" with retry button |
| offline | "Offline - changes saved locally" |

---

## Route Specifications

### GET /admin/notes (List)

**Loader**:
```typescript
export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAdmin(request, context.cloudflare.env.BLOG_DB);
  const db = database(context.cloudflare.env.BLOG_DB);
  const notes = await getAllNotesAdmin(db);
  const topics = await getAllTopics(db);
  return { notes, topics };
}
```

**Response**:
```typescript
{
  notes: Array<{
    id: string;
    title: string;
    status: 'draft' | 'published';
    topicId: string;
    topicName: string;
    updatedAt: string;
  }>;
  topics: Array<{ id: string; name: string }>;
}
```

### POST /admin/notes (Actions)

**Action intents**:
- `intent: 'create'` - Create new note
- `intent: 'delete'` - Delete note (requires `noteId`, `confirmName`)

### GET /admin/notes/:noteId (Edit)

**Loader**:
```typescript
export async function loader({ request, context, params }: Route.LoaderArgs) {
  await requireAdmin(request, context.cloudflare.env.BLOG_DB);
  const db = database(context.cloudflare.env.BLOG_DB);
  const note = await getNote(db, params.noteId);
  const relatedNotes = await getNoteRelations(db, params.noteId);
  const topics = await getAllTopics(db);
  const allNotes = await getAllNotesForSelection(db, params.noteId);
  return { note, relatedNotes, topics, allNotes };
}
```

### POST /admin/notes/:noteId (Update/Sync)

**Action intents**:
- `intent: 'update'` - Full update from form submission
- `intent: 'sync'` - Sync from IndexedDB (includes `clientUpdatedAt` for LWW)

**Sync response**:
```typescript
{
  success: boolean;
  conflict?: boolean;        // true if server had newer data
  note: ServerNote;          // Current server state
  updatedAt: string;         // Server timestamp
}
```

### Topics Routes

Similar structure to notes:
- `GET /admin/topics` - List all topics with note counts
- `POST /admin/topics` - Create topic or delete (with confirmation)
- `GET /admin/topics/:topicId` - Get topic for editing
- `POST /admin/topics/:topicId` - Update topic

---

## Public Query Updates

Update existing public routes to filter by `status = 'published'`:

**File**: `/app/routes/_layout.notes._index/queries.server.ts`
```typescript
export async function getNotes(db: Database, topicFilter?: string) {
  let query = db
    .select({ id: notes.id, title: notes.title, topicId: notes.topicId })
    .from(notes)
    .where(eq(notes.status, 'published')); // ADD THIS FILTER

  if (topicFilter) {
    query = query.where(eq(notes.topicId, topicFilter));
  }

  return query.orderBy(desc(notes.updatedAt)).all();
}
```

**File**: `/app/routes/_.notes.$slug/queries.server.ts`
```typescript
export async function getNote(db: Database, noteId: string) {
  return await db
    .select({ title: notes.title, content: notes.content })
    .from(notes)
    .where(and(
      eq(notes.id, noteId),
      eq(notes.status, 'published') // ADD THIS FILTER
    ))
    .all();
}
```

---

## Implementation Sequence

1. **Database Migration**
   - Add `status` field to notes schema
   - Run `bun run db:generate` and `bun run db:migrate`
   - Update public queries to filter by `status = 'published'`

2. **Install Dependencies**
   - `bun add dexie`

3. **IndexedDB & Sync Engine**
   - Create `/app/lib/indexeddb.client.ts`
   - Create `/app/lib/sync-engine.client.ts`
   - Create `/app/hooks/useIndexedDBSync.ts`
   - Create `/app/hooks/useSyncStatus.ts`

4. **Topics CRUD**
   - Create `/app/routes/admin.topics/` (list + delete)
   - Create `/app/routes/admin.topics.new/` (create)
   - Create `/app/routes/admin.topics.$topicId/` (edit)
   - Create `TopicForm` component
   - Create `DeleteConfirmationModal` component

5. **Notes List**
   - Create `/app/routes/admin.notes/` (list + delete)
   - Show status badges (draft/published)
   - Integrate delete confirmation modal

6. **Notes Form & Editor**
   - Create `MarkdownEditor` component
   - Create `NoteForm` component
   - Create `SyncStatusIndicator` component
   - Create `/app/routes/admin.notes.new/`
   - Create `/app/routes/admin.notes.$noteId/`
   - Integrate IndexedDB sync

7. **Related Notes**
   - Create `RelatedNotesSelector` component
   - Add note relations management to form
   - Handle relation CRUD in actions

8. **Admin Navigation**
   - Update `/app/routes/admin.tsx` with links to Notes and Topics

9. **Testing & Polish**
   - Test all CRUD operations
   - Test offline/online sync scenarios
   - Test delete confirmations
   - Run `bun run typecheck`
   - Run `bunx biome check --fix`

---

## Security Considerations

- All admin routes protected by `requireAdmin()` in both loader and action
- Delete operations require explicit name confirmation
- Sync endpoint validates `clientUpdatedAt` to prevent replay attacks
- IndexedDB data is client-side only, no sensitive data exposed

---

## Future Enhancements (Out of Scope)

- Field-level LWW for partial merges
- Conflict UI for manual resolution
- Hierarchical topics (use parentId)
- Image upload in markdown editor
- Real-time collaboration
- Version history / undo
