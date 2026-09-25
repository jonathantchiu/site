import { getAllProjects } from '@/lib/projects';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';

export const metadata = { title: 'Projects — Jonathan Chiu' };

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Projects</h1>
      <p className="mt-3 max-w-measure text-muted">
        Every one of these has a writeup, including the parts that broke.
      </p>

      <div className="mt-10 flex flex-col gap-4">
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
    </>
  );
}
