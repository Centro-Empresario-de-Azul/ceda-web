import { describe, expect, it } from 'vitest';
import { issuesSchema } from './magazine';

const issue = (number: number, iso: string, over: Record<string, unknown> = {}) => ({
  number,
  date: 'Septiembre 2026',
  iso,
  headline: 'Titular',
  pages: 20,
  pdf: `/revista/imagen-ceda-${number}-web.pdf`,
  cover: `cover-${number}.jpg`,
  ...over,
});

describe('issuesSchema', () => {
  it('accepts issues newest first with files named after them', () => {
    expect(issuesSchema.safeParse([issue(318, '2026-09'), issue(317, '2026-08')]).success).toBe(
      true,
    );
  });

  it('rejects a repeated issue number', () => {
    expect(issuesSchema.safeParse([issue(318, '2026-09'), issue(318, '2026-08')]).success).toBe(
      false,
    );
  });

  it('rejects files that belong to another issue', () => {
    const copied = issue(319, '2026-10', { cover: 'cover-318.jpg' });
    expect(issuesSchema.safeParse([copied]).success).toBe(false);
    const wrongPdf = issue(319, '2026-10', { pdf: '/revista/imagen-ceda-318-web.pdf' });
    expect(issuesSchema.safeParse([wrongPdf]).success).toBe(false);
  });

  it('rejects issues out of order', () => {
    expect(issuesSchema.safeParse([issue(317, '2026-08'), issue(318, '2026-09')]).success).toBe(
      false,
    );
  });
});
