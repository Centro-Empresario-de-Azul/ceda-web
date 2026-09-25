import { describe, expect, it } from 'vitest';
import { GET } from '../pages/robots.txt';

describe('robots.txt', () => {
  it('points the sitemap at the configured domain', async () => {
    const response = await GET({ site: new URL('https://www.ceda.org.ar') } as never);
    const body = await response.text();
    expect(body).toContain('Sitemap: https://www.ceda.org.ar/sitemap-index.xml');
    expect(body).toMatch(/^User-agent: \*\nAllow: \//);
  });
});
