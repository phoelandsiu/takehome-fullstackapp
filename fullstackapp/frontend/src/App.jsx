import React, { useEffect, useState } from "react";
import CommentTable from "./Comments";
// Remove the JSON import unless you actually use it

const API_BASE = "http://127.0.0.1:8000";

function getCsrfToken(name = "csrftoken") {
  const m = document.cookie.match(new RegExp(`(^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : "";
}

function CommentForm({ onSaved }) {
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [text, setText] = useState("");
  const [likes, setLikes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const onEdit = (c) => setEditing(c);

  const addComment = async () => {
    setSaving(true);

    try {
      // Build data to send
      const data = {
        author: author.trim(),
        text: text.trim(),
        date: new Date().toISOString(),
        likes: likes === "" ? 0 : Math.max(0, Number(likes)),
        ...(image.trim() ? { image: image.trim() } : {}),
      };

      const res = await fetch(`${API_BASE}/api/comments/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        alert("Save failed. Please check your inputs and try again.");
        setSaving(false);
        return;
      }

      const created = await res
        .json()
        .catch(() => ({ id: Date.now.toString(), ...data }));
      onSaved?.(created);

      // Clear the form
      setAuthor("");
      setImage("");
      setText("");
      setLikes("");
      setSaving(false);
    } catch (err) {
      console.error("addComment error:", err);
      if (err.name === "AbortError") alert("Request timed out. Try again.");
      else alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault(); // <-- avoid page reload
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    addComment();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <input
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <input
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <textarea
        placeholder="Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        minLength={3}
        rows={5}
      />
      <input
        type="number"
        placeholder="Likes"
        min={0}
        step={1}
        value={likes} // "" => placeholder shows
        onChange={(e) => setLikes(e.target.value)}
      />
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add Comment"}
      </button>
    </form>
  );
}

function App() {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");

  function startEdit(c) {
    setEditingId(c.id);
    setDraftText(c.text ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftText("");
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/`);
      if (!res.ok) {
        console.error(
          `GET ${API_BASE}/api/comments/ failed`,
          res.status,
          await res.text()
        );
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.comments ?? [];
      setComments(list);
    } catch (e) {
      console.error("Network error fetching comments:", e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSaved = (created) => {
    // optimistic update
    if (created) setComments((prev) => [created, ...prev]);
    // reconcile with backend (optional but recommended)
    fetchComments();
  };

  async function handleDelete(id) {
    try {
      const url = `${API_BASE}/api/comments/${id}/`; // backend URL that maps to comment
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
      });

      if (res.ok) {
        setComments(prev => prev.filter(c => (c.id ?? c._localId) !== id));
      }
      else {
        alert(`Delete failed ${res.status}`);
      }
    } catch (err) {
      console.error("DELETE error:", err);
      alert("Error deleting comment");
    } 
  }

  async function handleEdit(id) {
    const text = draftText.trim();
    if (!text) return alert("Text cannot be empty");

    try {
      const updates = { text };
      const url = `${API_BASE}/api/comments/${id}/`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const raw = await res.text();
      if (!res.ok) return alert(`Edit failed (${res.status}): ${raw || res.statusText}`);

      const updated = raw ? JSON.parse(raw) : null;
      setComments(prev => prev.map(c => (c.id === id ? (updated ?? {...c, ...updates }) : c)));
      cancelEdit();
    } catch (err) {
      console.error("Error with Edit:", err);
    }
  }

  return (
    <main style={{ padding: 50 }}>
      <h1>Comments</h1>
      <div style={{ display: "flex", gap: 24, flexWrap: "nowrap" }}>
        <section style={{ width: 950 }}>
          <table
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th align="left">Author</th>
                <th align="left">Image</th>
                <th align="left">Text</th>
                <th align="left">Date</th>
                <th align="left">Likes</th>
              </tr>
            </thead>
            <tbody>
              <CommentTable
                comments={comments}
                onEdit={startEdit}
                onSave={() => handleEdit(editingId)}
                onCancel={cancelEdit}
                editingId={editingId}
                draftText={draftText}
                onChangeDraft={setDraftText}
                onDelete={handleDelete}
              />
            </tbody>
          </table>
        </section>

        <aside
          style={{
            width: 320,
            flex: "0 0 320px",
            border: "1px solid #fff",
            borderRadius: 12,
            padding: 16,
            background: "",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <h3>Comment Form</h3>
          <CommentForm onSaved={handleSaved} />
        </aside>
      </div>
    </main>
  );
}

export default App;
