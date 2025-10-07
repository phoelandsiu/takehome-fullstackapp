import React, { useEffect, useState } from "react";
import CommentTable from "./Comments";
// Remove the JSON import unless you actually use it

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

  const addComment = async () => {
    setSaving(true);
    const img = (image || "").trim();
    const commentData = {
      author,
      text,
      date: new Date().toISOString(),
      likes: likes === "" ? 0 : Number(likes),
    };
    if (img) commentData.image = img;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/comments/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), // Django CSRF
        },
        body: JSON.stringify(commentData),
      });

      let created = null;
      try {
        created = await res.json();
      } catch {
        /* 204/empty body is OK */
      }

      if (!res.ok) {
        console.error(
          "POST http://127.0.0.1:8000/api/comments/create/ failed",
          res.status,
          created || (await res.text())
        );
        return; // don't clear/reset if it failed
      }

      // Pass created object up (or fall back to local data)
      onSaved?.(created || { id: Date.now().toString(), ...commentData });

      // clear form
      setAuthor("");
      setImage("");
      setText("");
      setLikes("");
    } catch (e) {
      console.error("Network error creating comment:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // <-- avoid page reload
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
        rows={5} // was 8
        style={{
          width: "95%",
          minHeight: 110, // was 160
          maxHeight: 220, // prevent it from getting too tall
          padding: 8,
          lineHeight: 1.4,
          resize: "vertical", // still let users drag taller if needed
        }}
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

  const fetchComments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/comments/");
      if (!res.ok) {
        console.error(
          "GET http://127.0.0.1:8000/api/comments/ failed",
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
      const url = `${API_BASE}/api/comments/${id}/`; // backend URL, include trailing slash
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(), // if using Django session auth
        },
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("DELETE failed", res.status, body);
        alert("Delete failed: " + res.status);
        return;
      }

      // remove from local state after successful delete
      setComments((prev) => prev.filter((c) => (c.id ?? c._localId) !== id));
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Comments</h1>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <section style={{ flex: 1 }}>
          <table
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th align="left">Author</th>
                <th align="left">Image</th>
                <th align="left">Text</th>
                <th align="left">Date</th>
                <th align="left">Likes</th>
              </tr>
            </thead>
            <tbody>
              <CommentTable comments={comments} onDelete={handleDelete} />
            </tbody>
          </table>
        </section>

        <aside
          style={{
            width: 320,
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
