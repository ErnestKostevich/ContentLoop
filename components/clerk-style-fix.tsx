"use client";

import { useEffect } from "react";

/**
 * Runtime sanitizer for Clerk modal styles that CSS overrides keep
 * missing — currently the diagonal "Development mode" stripe banner.
 *
 * Strategy: MutationObserver watches the DOM. Whenever new nodes are
 * added (e.g. the modal opens), we walk through Clerk's card and
 * neutralize any element whose computed `background-image` contains a
 * repeating gradient. Bulletproof against Clerk's hashed class names
 * since we match on the actual rendered style, not on selectors.
 *
 * Only mounts when Clerk is configured.
 */
export function ClerkStyleFix() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return;

    const flatten = (root: ParentNode) => {
      const nodes = root.querySelectorAll<HTMLElement>(
        ".cl-rootBox *, .cl-card *, .cl-modalContent *"
      );
      nodes.forEach((el) => {
        const bg = getComputedStyle(el).backgroundImage;
        if (
          bg &&
          (bg.includes("repeating-linear-gradient") ||
            bg.includes("repeating-conic-gradient"))
        ) {
          el.style.setProperty("background-image", "none", "important");
          el.style.setProperty(
            "background-color",
            "rgba(251, 191, 36, 0.05)",
            "important"
          );
          el.style.setProperty(
            "border-top",
            "1px solid rgba(251, 191, 36, 0.2)",
            "important"
          );
        }
      });
    };

    // Initial pass — modal might already be in DOM if dev fast-refresh.
    flatten(document);

    // Watch for future modal mounts / re-renders.
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length === 0) continue;
        // Cheap heuristic: only flatten when something Clerk-related lands.
        for (const node of m.addedNodes) {
          if (node instanceof Element) {
            if (
              node.matches?.("[class*='cl-']") ||
              node.querySelector?.("[class*='cl-']")
            ) {
              flatten(document);
              break;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
