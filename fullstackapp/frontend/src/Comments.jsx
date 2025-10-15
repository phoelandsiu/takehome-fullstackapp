import React from 'react'

export default function CommentTable({ comments = [], editingId, draftText, onChangeDraft, onEdit, onSave, onCancel, onDelete }) {
  if (!comments.length) {
    return (
      <tr>
        <td colSpan={5}>No comments yet</td>
      </tr>
    )
  }
  return comments.map((c, i) => (
    <React.Fragment key={c.id ?? i}>
      <CommentRow
        comment={c}
        editing={editingId === c.id}
        draftText={draftText}
        onChangeDraft={onChangeDraft}
        onEdit={() => onEdit(c)}
        onSave={() => onSave(c.id)}
        onCancel={onCancel}
        onDelete={onDelete}
      />
      {i < comments.length - 1 && (
        <tr><td colSpan={6} style={{ padding: 0 }}><div style={{ height: 1, background: "#2e2e2e" }}/></td></tr>
      )}
    </React.Fragment>
  ));
}

function CommentRow({ comment, editing, draftText, onChangeDraft, onEdit, onSave, onCancel, onDelete }) {
  const { id, author, date, likes, image } = comment;
  const authorName = typeof author === "string" ? author : (author?.name ?? "Unknown");

  return (
    <tr>
      <td>{authorName}</td>
      <td>{image?.trim() && 
        <img src={image.trim()} 
          alt="" 
          width={48} 
          height={48} 
          loading="lazy" 
          onError={(e) => { e.currentTarget.style.display = "none"; } }
        />}
      </td>
      <td style={{ maxWidth: 720 }}>
        {editing ? (
          <textarea
            value={draftText}
            onChange={(e) => onChangeDraft(e.target.value)}
            rows={4}
            style={{ width: "100%" }}
            autoFocus
          />
        ) : (
          comment.text || ""
        )}
      </td>

      <td>{date ? new Date(date).toLocaleDateString() : ""}</td>
      <td>{likes ?? 0}</td>

      <td style={{ whiteSpace: "nowrap", display: "flex", gap: 8 }}>
        {editing ? (
          <>
            <button type="button" onClick={onSave}>Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button type="button" disabled={!id} onClick={onEdit}>Edit</button>
            <button
              type="button"
              onClick={() => id && window.confirm("Delete this comment?") && onDelete?.(id)}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
