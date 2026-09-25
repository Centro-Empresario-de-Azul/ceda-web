import { describe, expect, it } from 'vitest';
import { advocacy, entriesSchema } from './advocacy';

const entry = (over: Record<string, unknown> = {}) => ({
  date: '2026-08-31',
  title: 'T',
  body: 'B',
  source: { label: 'L', href: 'https://example.test/' },
  ...over,
});

describe('advocacy', () => {
  it('rejects impossible dates', () => {
    expect(entriesSchema.safeParse([entry({ date: '2026-13-45' })]).success).toBe(false);
    expect(entriesSchema.safeParse([entry()]).success).toBe(true);
  });

  it('only cites magazine issues that are published', () => {
    const cite = (href: string) => entry({ source: { label: 'Revista', href } });
    expect(entriesSchema.safeParse([cite('/revista/318')]).success).toBe(true);
    expect(entriesSchema.safeParse([cite('/revista/1')]).success).toBe(false);
  });

  it('credits CEDA unless told otherwise', () => {
    expect(entriesSchema.parse([entry()])[0].by).toBe('CEDA');
  });

  it('credits the Fundación wherever the entry says it ran the activity', () => {
    for (const g of advocacy.filter((e) => e.body.startsWith('La Fundación CEDA'))) {
      expect(g.by, g.title).toBe('Fundación CEDA');
    }
  });
});
