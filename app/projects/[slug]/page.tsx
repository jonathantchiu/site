import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getProject, getProjectSlugs } from '@/lib/projects';
import { Screenshot } from '@/components/Screenshot';

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project ? `${project.title} — Jonathan Chiu` : 'Not found' };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="heading-page text-ink">{project.title}</h1>
      <p className="mt-2 text-muted">{project.year}</p>
      <p className="mt-3 max-w-measure text-lg">{project.hook}</p>

      <div className="mt-8 border-t border-hairline" />

      <ul className="mt-8 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech} className="rounded-full border border-hairline px-3 py-1 text-[17px]">
            {tech}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Screenshot
          base={project.cover}
          alt={`${project.title} screenshot`}
          width={project.coverWidth}
          height={project.coverHeight}
        />
      </div>

      <div className="prose-custom mt-10 max-w-measure [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:mt-4">
        <MDXRemote source={project.content} components={{ Screenshot }} />
      </div>

      <a
        href={project.repo}
        className="mt-10 inline-flex min-h-[44px] items-center rounded-card border border-hairline bg-card px-5 shadow-soft"
      >
        View the code on GitHub
      </a>
    </article>
  );
}
