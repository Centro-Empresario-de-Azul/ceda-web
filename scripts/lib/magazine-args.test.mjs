import { describe, expect, it } from 'vitest';
import {
  MAX_ASSET_BYTES,
  USAGE,
  checkAssetSize,
  issueFromTag,
  parseArgs,
  psString,
} from './magazine-args.mjs';

const exists = () => true;
const missing = () => false;

describe('parseArgs', () => {
  it('accepts a source and a numeric issue', () => {
    expect(parseArgs(['a.pdf', '318'], exists)).toEqual({
      source: 'a.pdf',
      issue: '318',
      force: false,
    });
  });

  it('reads --force in any position', () => {
    expect(parseArgs(['--force', 'a.pdf', '318'], exists).force).toBe(true);
    expect(parseArgs(['a.pdf', '318', '--force'], exists).force).toBe(true);
  });

  it('requires both positional arguments', () => {
    expect(parseArgs([], exists).error).toBe(USAGE);
    expect(parseArgs(['a.pdf'], exists).error).toBe(USAGE);
    expect(parseArgs(['a.pdf', '318', 'extra'], exists).error).toBe(USAGE);
  });

  it.each(['31a', '-1', '3.5', '318 ', 'abc'])('rejects non-numeric issue %j', (issue) => {
    expect(parseArgs(['a.pdf', issue], exists).error).toMatch(/digits only/);
  });

  it('rejects unknown options', () => {
    expect(parseArgs(['a.pdf', '318', '--frce'], exists).error).toMatch(/Unknown option: --frce/);
  });

  it('reports a missing source', () => {
    expect(parseArgs(['nope.pdf', '318'], missing).error).toBe('Source not found: nope.pdf');
  });
});

describe('checkAssetSize', () => {
  it('passes at or under the cap', () => {
    expect(checkAssetSize(MAX_ASSET_BYTES)).toBeNull();
    expect(checkAssetSize(3 * 1024 * 1024)).toBeNull();
  });

  it('fails over the 25 MiB cap', () => {
    expect(checkAssetSize(MAX_ASSET_BYTES + 1)).toMatch(/25\.0 MiB/);
  });
});

describe('psString', () => {
  it('escapes characters that would end a PostScript string', () => {
    expect(psString('/a (1)\\b.pdf')).toBe('(/a \\(1\\)\\\\b.pdf)');
  });
});

describe('issueFromTag', () => {
  it('reads the number from a revista-N tag', () => {
    expect(issueFromTag('revista-319')).toBe('319');
    expect(issueFromTag(' revista-319\n')).toBe('319');
  });

  it('rejects anything else', () => {
    for (const tag of [
      '319',
      'v319',
      'revista-',
      'revista-31a',
      'Revista-319',
      'revista-319-b',
      'revista-0319',
    ]) {
      expect(issueFromTag(tag)).toBeNull();
    }
  });
});
