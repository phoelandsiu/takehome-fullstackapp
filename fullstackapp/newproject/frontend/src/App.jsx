import React from "react";
import CommentTable from "./Comments";
import commentsData from "../../Copy of comments.json"

function App() {
  const comments = commentsData["comments"];

  return (
    <main>
      <h1>Comments</h1>

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Author</th>
            <th align="left">Image</th>
            <th align="left">Text</th>
            <th align="left">Date</th>
            <th align="left">Likes</th>
          </tr>
        </thead>
        <CommentTable comments={comments} />
      </table>
    </main>
  );
}

export default App;
