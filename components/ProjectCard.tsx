import Link from 'next/link';
import { Screenshot } from './Screenshot';
import type { Project } from '@/lib/projects';

// Real pixel dimensions of each project's cover screenshot at the 768w
// breakpoint, measured from the source files. Bento's captures are portrait
// phone screens; Cognify's are landscape desktop screens. Passing the real
// ratio here (instead of Screenshot's generic default) keeps the card's
// reserved space matching the image that actually loads, so nothing shifts.
const COVER_DIMENSIONS: Record<string, { width: number; height: number }> = {
  bento: { width: 768, height: 1588 },
  cognify: { width: 768, height: 562 },
};

export function ProjectCard({ project }: { project: Project }) {
  const dimensions = COVER_DIMENSIONS[project.slug];

  return (
    <article className="rounded-card border-2 border-ink bg-sand p-4 shadow-offset transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-offset-lg sm:p-6">
      <Screenshot
        base={project.cover}
        alt={`${project.title} screenshot`}
        width={dimensions?.width}
        height={dimensions?.height}
      />

      <div className="mt-4">
        <h3 className="text-2xl font-bold">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-block py-2 underline decoration-orange decoration-2 underline-offset-4"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">{project.year}</p>
        <p className="mt-2 max-w-measure">{project.hook}</p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border-2 border-ink px-3 py-1 text-sm"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
