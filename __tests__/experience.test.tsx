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
});

describe('ExperienceItem', () => {
  it('renders the org, title, dates, and bullets', () => {
    render(<ExperienceItem role={ROLES[0]} />);
    expect(screen.getByText('SoFi')).toBeTruthy();
    expect(screen.getByText(ROLES[0].title)).toBeTruthy();
    expect(screen.getByText(ROLES[0].dates)).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBe(ROLES[0].bullets.length);
  });

  it('marks the logo decorative, since the org name is already text', () => {
    const { container } = render(<ExperienceItem role={ROLES[0]} />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });
});
