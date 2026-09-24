import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { Mascot } from '@/components/Mascot';

export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <>
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="shrink-0 sm:hidden">
          <Mascot mood="happy" cosmetic="sunglasses" size={92} />
        </div>
        <img
          src="/profile.webp"
          alt="Jonathan Chiu"
          width={128}
          height={128}
          className="h-32 w-32 rounded-full border-2 border-ink object-cover"
        />
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl">
            Jonathan Chiu
          </h1>
          <p className="mt-2 max-w-measure text-lg">
            CS at UCLA. I build apps that make boring habits worth repeating —
            and I spent this summer at SoFi making sure an AI assistant does not
            say things it should not.
          </p>
          <p className="mt-2 max-w-measure text-muted">
            Currently building BruinChat with{' '}
            <span className="text-ink">UCLA DevX</span>.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <Mascot mood="happy" cosmetic="sunglasses" size={120} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Projects</h2>
        <div className="mt-6 flex flex-col gap-8">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
        <Link
          href="/projects"
          className="mt-6 inline-flex min-h-[44px] items-center text-orange-text underline decoration-2 underline-offset-4"
        >
          All projects
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Elsewhere</h2>
        <ul className="mt-4 flex flex-wrap gap-4">
          {[
            ['GitHub', 'https://github.com/jonathantchiu'],
            ['LinkedIn', 'https://linkedin.com/in/jonathantchiu'],
            ['Email', 'mailto:jonnych1u@g.ucla.edu'],
          ].map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                className="flex min-h-[44px] items-center text-orange-text underline decoration-2 underline-offset-4"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
