import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ROLES } from '@/lib/experience';
import { ExperienceItem } from '@/components/ExperienceItem';

describe('ROLES', () => {
  it('lists every role newest first', () => {
    expect(ROLES.map((r) => r.org)).toEqual(['SoFi', 'UCLA DevX', 'DECA Inc']);
  });

  it('gives every role a logo and at least one bullet', () => {
    for (const role of ROLES) {
      expect(role.logo, `${role.org} logo`).toMatch(/^\/logos\/.+\.webp$/);
      expect(role.bullets.length, `${role.org} bullets`).toBeGreaterThan(0);
    }
  });

  it('gives every role a unique id and a one-sentence blurb', () => {
    const ids = new Set(ROLES.map((r) => r.id));
    expect(ids.size).toBe(ROLES.length);
    for (const role of ROLES) {
      expect(role.blurb, `${role.org} blurb`).toBeTruthy();
      expect(role.blurb.length, `${role.org} blurb length`).toBeLessThan(300);
    }
  });
});

describe('ExperienceItem', () => {
  it('renders the retained detail bullets for a role', () => {
    render(<ExperienceItem role={ROLES[0]} />);
    expect(screen.getAllByRole('listitem').length).toBe(ROLES[0].bullets.length);
    for (const bullet of ROLES[0].bullets) {
      expect(screen.getByText(bullet)).toBeTruthy();
    }
  });
});
