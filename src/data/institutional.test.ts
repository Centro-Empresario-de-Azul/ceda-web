import { describe, expect, it } from 'vitest';
import { MAX_FEATURED_BENEFITS, benefitsSchema, featuredBenefits } from './institutional';

const benefit = (featured: boolean) => ({ name: 'X', body: 'Y', tag: 'Sede', featured });

describe('benefits', () => {
  it('feeds the home teaser only from featured entries', () => {
    expect(featuredBenefits.length).toBeGreaterThan(0);
    expect(featuredBenefits.every((b) => b.featured)).toBe(true);
  });

  it('needs at least one and at most a grid of featured benefits', () => {
    expect(benefitsSchema.safeParse([benefit(false)]).success).toBe(false);
    expect(benefitsSchema.safeParse([benefit(true), benefit(false)]).success).toBe(true);
    const tooMany = Array.from({ length: MAX_FEATURED_BENEFITS + 1 }, () => benefit(true));
    expect(benefitsSchema.safeParse(tooMany).success).toBe(false);
  });
});
