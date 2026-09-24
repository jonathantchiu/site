import type { Role } from '@/lib/experience';

// Renders only the detail bullets for a role. The org, title, dates, logo,
// and one-sentence blurb are already shown by the EntryRow above this on
// /experience — this component supplies the depth (the SoFi and DECA
// metrics) that the compact home-page row intentionally leaves out.
export function ExperienceItem({ role }: { role: Role }) {
  return (
    <ul className="mt-3 flex max-w-measure list-disc flex-col gap-2 pl-5">
      {role.bullets.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  );
}
