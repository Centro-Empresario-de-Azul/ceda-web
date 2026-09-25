// Pure validation for prepare-magazine.mjs, kept free of I/O so it can be unit-tested.

export const USAGE =
  'Usage: node scripts/prepare-magazine.mjs <source.pdf> <issue-number> [--force]';

// Workers Static Assets rejects any single file above this.
export const MAX_ASSET_BYTES = 25 * 1024 * 1024;

export function parseArgs(argv, exists) {
  const force = argv.includes('--force');
  const unknown = argv.filter((a) => a.startsWith('--') && a !== '--force');
  if (unknown.length) return { error: `Unknown option: ${unknown.join(', ')}\n${USAGE}` };

  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional.length !== 2) return { error: USAGE };

  const [source, issue] = positional;
  if (!/^\d+$/.test(issue)) {
    return { error: `Issue number must be digits only, got "${issue}".\n${USAGE}` };
  }
  if (!exists(source)) return { error: `Source not found: ${source}` };

  return { source, issue, force };
}

export function checkAssetSize(bytes, max = MAX_ASSET_BYTES) {
  if (bytes <= max) return null;
  const mib = (n) => (n / 1024 / 1024).toFixed(1);
  return `Compressed PDF is ${mib(bytes)} MiB, over the ${mib(max)} MiB per-file cap of Workers Static Assets.`;
}

// PostScript string literal: backslash and parentheses are the only characters that break it.
export const psString = (s) => `(${s.replace(/[\\()]/g, (c) => `\\${c}`)})`;
