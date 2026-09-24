import Link from 'next/link';
import { Screenshot } from './Screenshot';
import type { Project } from '@/lib/projects';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-card border-2 border-ink bg-sand p-4 shadow-offset transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-offset-lg sm:p-6">
      <Screenshot
        base={project.cover}
        alt={`${project.title} screenshot`}
        width={project.coverWidth}
        height={project.coverHeight}
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
        <p className="text-[17px] text-muted">{project.year}</p>
        <p className="mt-2 max-w-measure">{project.hook}</p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border-2 border-ink px-3 py-1 text-[17px]"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
