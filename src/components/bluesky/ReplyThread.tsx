/**
 * A reply and everything under it, indented by depth. Past `maxDepth` the
 * nesting is dropped rather than flattened — a deep argument reads better on
 * Bluesky than as a column two characters wide. For the same reason a post at
 * `maxDepth` offers no Reply: its replies would not show here.
 */

import PostCard from "./PostCard";
import type {
  PostLikeContext,
  PostOwnContext,
  PostReplyContext,
} from "./PostCard";
import type { ShapedPost } from "./types";

interface ReplyThreadProps {
  post: ShapedPost;
  depth: number;
  maxDepth: number;
  /** Shared like state, threaded down so every reply gets its own control. */
  like?: PostLikeContext;
  /** Shared own-comment state, threaded down the same way. */
  own?: PostOwnContext;
  /** Shared reply state; absent where the reader may not write. */
  reply?: PostReplyContext;
}

export default function ReplyThread({
  post,
  depth,
  maxDepth,
  like,
  own,
  reply,
}: ReplyThreadProps) {
  const replies = post.replies || [];
  const replyHere = depth < maxDepth ? reply : undefined;

  return (
    <div
      style={{
        marginTop: "0.75rem",
        marginLeft: depth * 12,
        borderLeft: depth > 0 ? "2px solid #e5e7eb" : "none",
        paddingLeft: depth > 0 ? "0.75rem" : 0,
      }}
    >
      <PostCard like={like} own={own} post={post} reply={replyHere} />
      {replyHere?.openUri === post.uri && replyHere.renderComposer(post)}

      {depth < maxDepth &&
        replies.map((child, index) => (
          <ReplyThread
            depth={depth + 1}
            key={child.uri || `${depth}-${index}`}
            like={like}
            maxDepth={maxDepth}
            own={own}
            post={child}
            reply={reply}
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
