import React from 'react'

export default function CommentTable({ comments = [], onDelete }) {
  if (!comments.length) {
    return (
      <tr>
        <td colSpan={5}>No comments yet</td>
      </tr>
    );
  }
  return (
    <>
      {comments.map((c, idx) => {
        const key = c.id ?? c._localId ?? idx;
        return <CommentRow key={key} comment={c} onDelete={onDelete} />;
      })}
    </>
  );
}

function CommentRow({ comment, onDelete }) {
  const { id, author, text, date, likes, image } = comment;
  const authorName = typeof author === 'string' ? author : (author?.name ?? 'Unknown');

  return (
    <tr>
      <td>{authorName}</td>
      <td>
        {image ? (
          <img
            src={image}
            alt=""                     // a11y
            loading="lazy"
            width={48}
            height={48}
            style={{ objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
      </td>
      <td>{text}</td>
      <td>{date ? new Date(date).toLocaleDateString() : ''}</td>
      <td>{likes ?? 0}</td>

      <td>
        <button
          type="button"
          onClick={() => {
            if (!id) {
              console.warn('Cannot delete comment without id', comment);
              return;
            }
            if (window.confirm('Delete this comment?')) onDelete?.(id);
          }}
          style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 8px' }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
