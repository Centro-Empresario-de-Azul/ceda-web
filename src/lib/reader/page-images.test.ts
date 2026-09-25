import { describe, expect, it } from 'vitest';
import { issues } from '../../data/magazine';
import { pageSetFor, pageTextsFor } from './page-images';

describe('page images and text', () => {
  it('has pages and text for every published issue, matching its page count', () => {
    for (const issue of issues) {
      expect(pageSetFor(issue.number).ratios, `issue ${issue.number}`).toHaveLength(issue.pages);
      expect(pageTextsFor(issue.number), `issue ${issue.number}`).toHaveLength(issue.pages);
    }
  });

  it('fails loudly for an issue that was never rendered', () => {
    expect(() => pageSetFor(1)).toThrow(/render-magazine-pages/);
    expect(() => pageTextsFor(1)).toThrow(/render-magazine-pages/);
  });
});
