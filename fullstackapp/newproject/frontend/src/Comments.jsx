import React from 'react'

export default function CommentTable({ comments = [] }) {
  if (!comments.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={4}>No comments yet</td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} />
      ))}
    </tbody>
  )
}

function CommentRow({ comment }) {
  const { author, text, date, likes } = comment
  const authorName =
    typeof author === 'string' ? author : author?.name ?? 'Unknown'

  return (
    <tr>
      <td>{authorName}</td>
      <td>{text}</td>
      <td>{date ? new Date(date).toLocaleDateString() : ''}</td>
      <td>{likes ?? 0}</td>
    </tr>
  )
}

export { CommentTable, CommentRow }