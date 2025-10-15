import React from 'react'

export default function CommentTable({ comments = [], onDelete }) {
  if (!comments.length) {
    return (
      <tr>
        <td colSpan={5}>No comments yet</td>
      </tr>
    )
  }
  return comments.map((c,i) => {
    const key = c.id ?? i;
    const showRule = i < comments.length - 1;

    return (
      <React.Fragment key={key}>
        <CommentRow comment={c} onDelete={onDelete} />
        {showRule && (
          <tr>
            <td colSpan={6} style={{ padding: 0 }}>
              <div style={{ height: 1, background: "#d3d3d36b" }}/>
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  })
}

function CommentRow({ comment, onDelete }) {
  const { id, author, text, date, likes, image } = comment;
  const authorName = typeof author === 'string' ? author : (author?.name ?? 'Unknown');

  return (
    <tr>
      <td>{authorName}</td>
      <td> {image && 
        <img src={image} 
          alt="" 
          width={48} 
          height={48} 
          loading="lazy" 
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          />}
        </td>
      <td>{text || ""}</td>
      <td>{date ? new Date(date).toLocaleDateString() : ""}</td>
      <td>{likes ?? 0}</td>
      <td>
        <button 
          type="button"
          onClick={() => id && window.confirm("Delete this comment?") && onDelete?.(id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
