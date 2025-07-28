import React, { useEffect, useState } from "react";
import "./App.css";

/**
 * A simple notes manager:
 * - Top nav with "Personal Notes"
 * - Notes listed in the main panel
 * - Create/Edit via modal
 * - Minimal light theme using the provided color scheme.
 */

/*********************
 * Utility/API Layer
 *********************/

// PUBLIC_INTERFACE
const NOTES_API_URL = "/api/notes"; // Update as appropriate to match backend

// PUBLIC_INTERFACE
async function fetchNotes() {
  /** Fetch all notes from backend */
  const res = await fetch(NOTES_API_URL);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// PUBLIC_INTERFACE
async function createNote(note) {
  /** Create a new note */
  const res = await fetch(NOTES_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

// PUBLIC_INTERFACE
async function updateNote(noteId, note) {
  /** Update an existing note */
  const res = await fetch(`${NOTES_API_URL}/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// PUBLIC_INTERFACE
async function deleteNote(noteId) {
  /** Delete a note */
  const res = await fetch(`${NOTES_API_URL}/${noteId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}

/*********************
 * UI COMPONENTS
 *********************/

// Top navigation bar
function TopNav({ onNew }) {
  return (
    <nav
      style={{
        width: "100%",
        background: "var(--bg-secondary)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        borderBottom: "1px solid var(--border-color)",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "fixed",
        top: 0,
        zIndex: 2,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "#1976d2",
          letterSpacing: ".5px",
          fontFamily: "inherit",
        }}
      >
        Personal Notes
      </span>
      <button
        className="accent"
        style={{
          background: "#ff9800",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 20px",
          fontWeight: 600,
          fontSize: 15,
          cursor: "pointer",
          transition: ".2s",
        }}
        onClick={onNew}
        aria-label="Add note"
      >
        + New note
      </button>
    </nav>
  );
}

// Note List Main Panel
function NoteList({ notes, onEdit, onDelete }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="notes-empty" style={{ color: "#aaa", marginTop: 40 }}>
        No notes yet. Click <b>+ New note</b> to add one.
      </div>
    );
  }
  return (
    <ul className="notes-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {notes.map((note) => (
        <li
          className="note-item"
          key={note.id}
          style={{
            background: "var(--bg-secondary)",
            margin: "16px 0",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            border: "1px solid var(--border-color)",
            padding: "20px 32px 16px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            transition: "box-shadow .2s",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <div className="note-title" style={{ fontWeight: 600, fontSize: "1.18rem", color: "#424242" }}>
              {note.title}
            </div>
            <div className="note-body" style={{ color: "#282c34", fontSize: 16, marginTop: 6, whiteSpace: "pre-wrap" }}>
              {note.body}
            </div>
          </div>
          <div className="note-actions" style={{ alignSelf: "flex-end", marginTop: 18 }}>
            <button
              aria-label="Edit"
              className="small-btn"
              style={{
                marginRight: 8,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "5px 15px",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: ".15s",
              }}
              onClick={() => onEdit(note)}
            >
              Edit
            </button>
            <button
              className="small-btn"
              aria-label="Delete"
              style={{
                background: "#fff",
                color: "#e53935",
                border: "1px solid #e53935",
                borderRadius: 6,
                padding: "5px 15px",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: ".15s",
                marginLeft: 2,
              }}
              onClick={() => onDelete(note)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Modal for create/edit
function NoteModal({ open, mode, note, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [body, setBody] = useState(note ? note.body : "");

  // Reset fields when opened/new note loaded
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [note, open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        zIndex: 9,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="modal-body"
        style={{
          background: "#fff",
          minWidth: 340,
          width: "90%",
          maxWidth: 410,
          borderRadius: 12,
          padding: "30px 32px 24px 32px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        <h3 style={{ margin: 0, color: "#1976d2" }}>
          {mode === "edit" ? "Edit Note" : "Create Note"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ title, body });
          }}
        >
          <div style={{ margin: "22px 0 12px" }}>
            <label htmlFor="note-title" style={{ display: "block", color: "#888", fontSize: 14 }}>
              Title
            </label>
            <input
              id="note-title"
              type="text"
              style={{
                boxSizing: "border-box",
                width: "100%",
                fontSize: 15,
                padding: "10px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                marginTop: 3,
                fontWeight: 500,
                background: "#fafbfc",
              }}
              maxLength={48}
              value={title}
              required
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              placeholder="Note title"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="note-body" style={{ display: "block", color: "#888", fontSize: 14 }}>
              Body
            </label>
            <textarea
              id="note-body"
              style={{
                boxSizing: "border-box",
                width: "100%",
                minHeight: 70,
                maxHeight: 220,
                fontSize: 15,
                padding: "10px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                marginTop: 3,
                fontWeight: 400,
                background: "#fafbfc",
                resize: "vertical",
              }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={1024}
              disabled={saving}
              placeholder="Type your note here..."
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "#fff",
                color: "#1976d2",
                border: "1px solid #1976d2",
                borderRadius: 6,
                padding: "7px 20px",
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer",
                transition: ".15s",
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "#ff9800",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "7px 20px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: ".15s",
                opacity: saving ? 0.6 : 1,
              }}
              disabled={saving}
            >
              {mode === "edit" ? "Save" : "Create"}
            </button>
          </div>
        </form>
        <button
          aria-label="Close modal"
          onClick={onCancel}
          style={{
            position: "absolute",
            top: 14,
            right: 22,
            background: "none",
            border: "none",
            fontSize: 20,
            color: "#bcbcbc",
            cursor: "pointer",
            padding: 0,
            transition: "color .15s",
          }}
          tabIndex={-1}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/*********************
 * MAIN APP COMPONENT
 *********************/

// PUBLIC_INTERFACE
function App() {
  // ----- State -----
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // or "edit"
  const [modalNote, setModalNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ----- Fetch notes on mount -----
  useEffect(() => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((e) => {
        setError("Unable to load notes.");
        setLoading(false);
      });
  }, []);

  // ----- Modal Handlers -----
  function openCreateModal() {
    setModalNote(null);
    setModalMode("create");
    setModalOpen(true);
    setError("");
  }
  function openEditModal(note) {
    setModalNote(note);
    setModalMode("edit");
    setModalOpen(true);
    setError("");
  }
  function closeModal() {
    setModalOpen(false);
    setModalNote(null);
    setError("");
  }

  // ----- Save/Create Note Submit Handler -----
  async function handleSaveNote(form) {
    setSaving(true);
    setError("");
    try {
      let result;
      if (modalMode === "edit" && modalNote) {
        result = await updateNote(modalNote.id, form);
        setNotes((prev) =>
          prev.map((n) => (n.id === modalNote.id ? result : n))
        );
      } else {
        result = await createNote(form);
        setNotes((prev) => [result, ...prev]);
      }
      closeModal();
    } catch (e) {
      setError(e.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  // ----- Delete Handler -----
  async function handleDeleteNote(note) {
    if (
      window.confirm(
        "Delete this note? This cannot be undone."
      )
    ) {
      try {
        await deleteNote(note.id);
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
      } catch (e) {
        setError(e.message || "Delete failed.");
      }
    }
  }

  // ----- Render -----
  return (
    <div
      className="App"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      <TopNav onNew={openCreateModal} />
      <div
        style={{
          maxWidth: 600,
          margin: "78px auto 0 auto",
          padding: "0 18px",
        }}
      >
        {error && (
          <div
            style={{
              background: "#fff3e0",
              color: "#e53935",
              padding: "10px 18px",
              border: "1px solid #ffeacc",
              borderRadius: 7,
              margin: "26px 0 6px",
              fontWeight: 500,
              letterSpacing: ".2px",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa", marginTop: 60 }}>
            Loading notes...
          </div>
        ) : (
          <NoteList notes={notes} onEdit={openEditModal} onDelete={handleDeleteNote} />
        )}
      </div>
      <NoteModal
        open={modalOpen}
        mode={modalMode}
        note={modalNote}
        saving={saving}
        onSave={handleSaveNote}
        onCancel={closeModal}
      />
      <footer
        style={{
          textAlign: "center",
          color: "#ccc",
          fontSize: 13,
          marginTop: 56,
          padding: 32,
        }}
      >
        &copy; {new Date().getFullYear()} Minimal Notes App
      </footer>
    </div>
  );
}

export default App;
