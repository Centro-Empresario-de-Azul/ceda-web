import type { SpreadTurn } from './pager';

const DURATION_MS = 650;

/**
 * A light 3D page turn for desktop spreads. The pager jumps to the next spread at once;
 * a leaf built from copies of the two images involved folds over the gutter on top of
 * it, so the reader sees the page turn while the real pages are already in place.
 * Declines (returns false) whenever it can't do that cleanly — the pager then slides.
 */
export function createPageTurn(stage: HTMLElement): (turn: SpreadTurn) => boolean {
  // The turn in progress. A second click lands before it ends; its overlays would then sit
  // over pages that are no longer there, so they go at once and the new turn starts.
  let active: (() => void) | null = null;

  return ({ direction, from, to, jump }) => {
    active?.();
    // Only between two full spreads: the lone covers don't fold.
    if (from.length !== 2 || to.length !== 2) return false;
    if (![...from, ...to].every((img) => img.complete && img.naturalWidth > 0)) return false;
    if (typeof stage.animate !== 'function') return false;

    const next = direction === 'next';
    // Turning forward lifts the right-hand page and lays it down on the left, showing
    // the next spread's left page on its back; turning back mirrors that.
    const [turning, stays] = next ? [from[1], from[0]] : [from[0], from[1]];
    const back = next ? to[0] : to[1];
    const stageRect = stage.getBoundingClientRect();
    const place = (el: HTMLElement, img: HTMLImageElement) => {
      const r = img.getBoundingClientRect();
      Object.assign(el.style, {
        left: `${r.left - stageRect.left}px`,
        top: `${r.top - stageRect.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
    };
    const face = (img: HTMLImageElement, className: string) => {
      const copy = new Image();
      copy.src = img.currentSrc || img.src;
      copy.alt = '';
      copy.className = className;
      return copy;
    };

    // Covers the page that stays put until the leaf lands on it, so the destination
    // spread underneath doesn't show through early.
    const still = document.createElement('div');
    still.className = 'page-turn-still';
    still.appendChild(face(stays, 'page-turn-face'));
    place(still, stays);

    const leaf = document.createElement('div');
    leaf.className = 'page-turn-leaf';
    leaf.style.transformOrigin = next ? 'left center' : 'right center';
    leaf.appendChild(face(turning, 'page-turn-face'));
    leaf.appendChild(face(back, 'page-turn-face page-turn-back'));
    place(leaf, turning);

    const shade = document.createElement('div');
    shade.className = 'page-turn-shade';
    leaf.appendChild(shade);

    stage.append(still, leaf);
    jump();

    const angle = next ? -180 : 180;
    const animation = leaf.animate(
      [
        { transform: 'perspective(2400px) rotateY(0deg)' },
        { transform: `perspective(2400px) rotateY(${angle}deg)` },
      ],
      { duration: DURATION_MS, easing: 'cubic-bezier(0.45, 0.05, 0.25, 1)', fill: 'forwards' },
    );
    shade.animate([{ opacity: 0 }, { opacity: 0.35, offset: 0.5 }, { opacity: 0 }], {
      duration: DURATION_MS,
    });

    const cleanUp = () => {
      still.remove();
      leaf.remove();
      if (active === cleanUp) active = null;
    };
    active = cleanUp;
    animation.finished.then(cleanUp, cleanUp);
    return true;
  };
}
