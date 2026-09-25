// Eager so each issue resolves its own cover by filename; covers are small and every one
// is shown on /revista anyway.
const covers = import.meta.glob<{ default: ImageMetadata }>('../assets/magazine/*.jpg', {
  eager: true,
});

export function coverFor(file: string): ImageMetadata {
  const entry = covers[`../assets/magazine/${file}`];
  if (!entry) {
    throw new Error(
      `Cover not found: src/assets/magazine/${file}. Add the image, or fix \`cover\` in src/data/magazine.ts.`,
    );
  }
  return entry.default;
}
