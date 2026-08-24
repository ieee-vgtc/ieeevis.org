/**
 * The top-level replies, animated when their order changes.
 *
 * Sorting by "Most liked" reorders the list as likes come in, and the reader
 * can flip the sort outright; either way a bare re-render would make posts jump.
 * A dependency-free FLIP keeps them followable: each frame we remember where
 * every reply sat, and when the next render puts it somewhere new we start it
 * from the old spot (an inverting transform) and let it transition home. Only
 * these top-level items reorder — nested replies stay chronological — so the
 * animation lives here and not in `ReplyThread`.
 *
 * Positions are measured relative to the list container, so scrolling the page
 * between renders does not read as movement. Readers who ask for reduced motion
 * get the plain jump.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { PostLikeContext } from "./PostCard";
import ReplyThread from "./ReplyThread";
import type { ShapedPost } from "./types";

const DURATION_MS = 200;

interface ReplyListProps {
  replies: ShapedPost[];
  maxDepth: number;
  like?: PostLikeContext;
}

interface Point {
  left: number;
  top: number;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ReplyList({ replies, maxDepth, like }: ReplyListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodes = useRef<Map<string, HTMLDivElement>>(new Map());
  const previous = useRef<Map<string, Point>>(new Map());
  // The pending "play to zero" frame for each animating node, so an interrupting
  // render can cancel it before it fights the next invert.
  const plays = useRef<Map<string, number>>(new Map());
  // Where each node last rested before its most recent move, timestamped. A move
  // that lands a node back on this spot within one animation's span is a
  // round-trip (a like then unlike, or a poll that reordered and reverted) rather
  // than travel, so it settles in place instead of sliding out and back.
  const settledAt = useRef<Map<string, { point: Point; at: number }>>(
    new Map(),
  );

  const setNode = (key: string) => (element: HTMLDivElement | null) => {
    if (element) {
      nodes.current.set(key, element);
    } else {
      nodes.current.delete(key);
    }
  };

  // Positions relative to the container, so page scroll cancels out. Any
  // in-flight FLIP transform is stripped before reading, so the rect is the
  // element's true resting layout position rather than a mid-animation offset —
  // measuring a still-translating element would otherwise yield a wild delta and
  // fling it out of the list. Clearing a transform does not move siblings (it is
  // a paint-only offset), and the effect re-applies the invert synchronously
  // before paint, so this never flashes.
  const measure = (): Map<string, Point> => {
    const points = new Map<string, Point>();
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) {
      return points;
    }
    for (const [key, element] of nodes.current) {
      element.style.transition = "none";
      element.style.transform = "";
      const rect = element.getBoundingClientRect();
      points.set(key, {
        left: rect.left - container.left,
        top: rect.top - container.top,
      });
    }
    return points;
  };

  useLayoutEffect(() => {
    // Drop any plays still queued from an interrupted reorder before measuring,
    // so a stale frame cannot land on top of the invert we are about to set.
    for (const id of plays.current.values()) {
      cancelAnimationFrame(id);
    }
    plays.current.clear();

    const current = measure();
    const reduced = prefersReducedMotion();
    const now = Date.now();

    for (const [key, element] of nodes.current) {
      const before = previous.current.get(key);
      const after = current.get(key);
      if (!before || !after) {
        continue; // newly added — let it appear in place
      }
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (dx === 0 && dy === 0) {
        continue; // unmoved
      }

      // A move that returns a node to where it rested moments ago is a
      // round-trip, not travel: a like immediately undone, or a poll that
      // reordered the list and reverted. Its resting spot never truly changed —
      // `measure` has already stripped the transform and put it in place — so let
      // it settle rather than sliding it out and back. Bounding this to one
      // animation's span keeps a genuine later move back to the same spot
      // (someone re-likes) animating as usual.
      const origin = settledAt.current.get(key);
      const returned =
        origin !== undefined &&
        now - origin.at < DURATION_MS &&
        origin.point.left === after.left &&
        origin.point.top === after.top;
      if (returned) {
        settledAt.current.delete(key);
        continue;
      }

      if (reduced) {
        continue; // reduced motion — plain jump, no invert
      }

      // Record the spot being left, so an undo within the span above is caught.
      settledAt.current.set(key, { point: before, at: now });

      // Invert: jump back to the old spot with no transition…
      element.style.transition = "none";
      element.style.transform = `translate(${dx}px, ${dy}px)`;
      // …then play forward to zero on the next frame.
      const id = requestAnimationFrame(() => {
        plays.current.delete(key);
        element.style.transition = `transform ${DURATION_MS}ms ease`;
        element.style.transform = "";
      });
      plays.current.set(key, id);
    }

    previous.current = current;
  });

  // Cancel any queued play on unmount so it cannot touch a detached node.
  useEffect(() => {
    const queued = plays.current;
    return () => {
      for (const id of queued.values()) {
        cancelAnimationFrame(id);
      }
      queued.clear();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {replies.map((reply, index) => {
        const key = reply.uri || `root-${index}`;
        return (
          <div key={key} ref={setNode(key)}>
            <ReplyThread
              depth={0}
              like={like}
              maxDepth={maxDepth}
              post={reply}
            />
          </div>
        );
      })}
    </div>
  );
}
