/**
 * A reply and everything under it, indented by depth. Past `maxDepth` the
 * nesting is dropped rather than flattened — a deep argument reads better on
 * Bluesky than as a column two characters wide.
 */

import PostCard from "./PostCard";
import type { PostLikeContext } from "./PostCard";
import type { ShapedPost } from "./types";

interface ReplyThreadProps {
  post: ShapedPost;
  depth: number;
  maxDepth: number;
  /** Shared like state, threaded down so every reply gets its own control. */
  like?: PostLikeContext;
}

export default function ReplyThread({
  post,
  depth,
  maxDepth,
  like,
}: ReplyThreadProps) {
  const replies = post.replies || [];

  return (
    <div
      style={{
        marginTop: "0.75rem",
        marginLeft: depth * 12,
        borderLeft: depth > 0 ? "2px solid #e5e7eb" : "none",
        paddingLeft: depth > 0 ? "0.75rem" : 0,
      }}
    >
      <PostCard like={like} post={post} />

      {depth < maxDepth &&
        replies.map((reply, index) => (
          <ReplyThread
            depth={depth + 1}
            key={reply.uri || `${depth}-${index}`}
            like={like}
            maxDepth={maxDepth}
            post={reply}
          />
        ))}

      {depth >= maxDepth && replies.length > 0 && (
        <small
          style={{ display: "block", marginTop: "0.4rem", color: "#6b7280" }}
        >
          Further replies are shown on Bluesky.
        </small>
      )}
    </div>
  );
}
