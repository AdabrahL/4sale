import { useEffect } from "react";

/**
 * useStickySidebar(sidebarRef, containerRef, options)
 *
 * Keeps sidebar visible while scrolling (like position: sticky),
 * and prevents it from overlapping the container's bottom.
 *
 * Options:
 *  - topOffset: number px from top when pinned (default 90)
 *  - bottomSpacing: px gap above container bottom when pinned (default 12)
 *
 * Works by listening to scroll/resize and toggling inline styles on the sidebar element.
 * This approach is compatible across browsers and lets the page remain fully scrollable.
 */
export default function useStickySidebar(sidebarRef, containerRef, options = {}) {
  const topOffset = options.topOffset ?? 90;
  const bottomSpacing = options.bottomSpacing ?? 12;

  useEffect(() => {
    const sidebarEl = sidebarRef?.current;
    const containerEl = containerRef?.current;
    if (!sidebarEl || !containerEl) return;

    let ticking = false;

    function update() {
      ticking = false;
      const containerRect = containerEl.getBoundingClientRect();
      const sidebarRect = sidebarEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const sidebarHeight = sidebarRect.height;
      const containerTop = containerRect.top + window.scrollY;
      const containerBottom = containerRect.bottom + window.scrollY;

      const scrollY = window.scrollY;
      const pinTop = containerTop - topOffset;
      const stopAt = containerBottom - bottomSpacing - sidebarHeight;

      if (scrollY >= pinTop && scrollY < stopAt) {
        // stick to viewport top
        Object.assign(sidebarEl.style, {
          position: "fixed",
          top: `${topOffset}px`,
          width: `${sidebarRect.width}px`,
          left: `${sidebarRect.left}px`,
          bottom: "auto",
        });
      } else if (scrollY >= stopAt) {
        // reached end: place absolute at bottom of container
        Object.assign(sidebarEl.style, {
          position: "absolute",
          top: `${containerBottom - containerTop - sidebarHeight - bottomSpacing}px`,
          left: "auto",
          width: `${sidebarRect.width}px`,
          bottom: "auto",
        });
      } else {
        // natural position
        Object.assign(sidebarEl.style, {
          position: "relative",
          top: "auto",
          left: "auto",
          width: "auto",
        });
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    // run initial
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    // Recompute on images load (in case sidebar width/height changes)
    const imgs = containerEl.querySelectorAll("img");
    imgs.forEach(img => img.addEventListener("load", update));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      imgs.forEach(img => img.removeEventListener("load", update));
      // clear inline styles on cleanup
      if (sidebarEl) {
        sidebarEl.style.position = "";
        sidebarEl.style.top = "";
        sidebarEl.style.left = "";
        sidebarEl.style.width = "";
      }
    };
  }, [sidebarRef, containerRef, topOffset, bottomSpacing]);
}