import { getAllProjects } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';

export const metadata = { title: 'Projects — Jonathan Chiu' };

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Projects</h1>
      <p className="mt-3 max-w-measure text-muted">
        Things I built, why I built them, and what broke along the way.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.08}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
