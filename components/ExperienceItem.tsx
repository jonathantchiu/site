import type { Role } from '@/lib/experience';
import { assetPath } from '@/lib/assetPath';

export function ExperienceItem({ role }: { role: Role }) {
  return (
    <article className="rounded-card border-2 border-ink bg-sand p-4 shadow-offset sm:p-6">
      <div className="flex items-center gap-3">
        <img
          src={assetPath(role.logo)}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded object-contain"
        />
        <h2 className="text-2xl font-bold">{role.org}</h2>
      </div>

      <p className="mt-2 text-lg">{role.title}</p>
      {/* dates on their own line so a phone never compresses a two-column row */}
      <p className="text-[17px] text-muted">
        <span>{role.dates}</span> · <span>{role.location}</span>
      </p>

      <ul className="mt-4 flex max-w-measure list-disc flex-col gap-2 pl-5">
        {role.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}
