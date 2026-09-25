import { describe, expect, it } from 'vitest';
import { pageFromHash, readerHash } from './reader-hash';

describe('reader page links', () => {
  it('round-trips a page through the hash', () => {
    expect(pageFromHash(readerHash(7), 21)).toBe(7);
  });

  it('ignores missing, malformed and out-of-range hashes', () => {
    expect(pageFromHash('', 21)).toBeNull();
    expect(pageFromHash('#contenido', 21)).toBeNull();
    expect(pageFromHash('#p=0', 21)).toBeNull();
    expect(pageFromHash('#p=22', 21)).toBeNull();
  });
});
