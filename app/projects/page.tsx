import { getAllProjects } from '@/lib/projects';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';

export const metadata = { title: 'Projects — Jonathan Chiu' };

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="heading-page text-ink">Projects</h1>
      <p className="mt-4 max-w-measure text-muted">
        Every one of these has a writeup, including the parts that broke.
      </p>

      <div className="mt-8 border-t border-hairline" />

      <div className="mt-8 flex flex-col">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.08}>
            <EntryRow
              href={`/projects/${project.slug}`}
              logo={`${project.cover}-480.webp`}
              title={project.title}
              subtitle={project.hook}
              date={project.year}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
