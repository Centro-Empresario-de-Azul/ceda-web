// Scoped to events/ deliberately: eager glob *imports* everything it matches, so a wider
// pattern would ship every jpg under assets/img, referenced or not.
const posters = import.meta.glob<{ default: ImageMetadata }>('../assets/img/events/**/*.jpg', {
  eager: true,
});

/** `poster` is the path under src/assets/img/ given in src/data/events.ts. */
export function posterFor(poster: string, title: string): ImageMetadata {
  const entry = posters[`../assets/img/${poster}`];
  if (!entry) {
    throw new Error(
      `Poster not found: src/assets/img/${poster} (referenced by "${title}" in src/data/events.ts) — posters must live under src/assets/img/events/`,
    );
  }
  return entry.default;
}
