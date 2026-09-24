import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/projects';
import { ROLES } from '@/lib/experience';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';
import { BoxReveal } from '@/components/BoxReveal';
import { MascotScene } from '@/components/MascotScene';
import { assetPath } from '@/lib/assetPath';

export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <>
      <section id="hero" className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <img
          src={assetPath('/profile.webp')}
          alt="Jonathan Chiu"
          width={128}
          height={128}
          className="h-32 w-32 rounded-full border border-hairline object-cover"
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
        <MascotScene />
      </section>

      <section className="mt-14">
        <BoxReveal>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Experience</h2>
          <div className="mt-6 flex flex-col gap-4">
            {ROLES.map((role, i) => (
              <Reveal key={role.id} delay={i * 0.08}>
                <EntryRow
                  href={`/experience#${role.id}`}
                  logo={role.logo}
                  title={role.org}
                  subtitle={role.title}
                  date={role.dates}
                  blurb={role.blurb}
                />
              </Reveal>
            ))}
          </div>
          <Link
            href="/experience"
            className="mt-6 inline-flex min-h-[44px] items-center text-accent-text underline decoration-2 underline-offset-4"
          >
            All experience
          </Link>
        </BoxReveal>
      </section>

      <section className="mt-14">
        <BoxReveal>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">Projects</h2>
          <div className="mt-6 flex flex-col gap-4">
            {featured.map((project, i) => (
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
          <Link
            href="/projects"
            className="mt-6 inline-flex min-h-[44px] items-center text-accent-text underline decoration-2 underline-offset-4"
          >
            All projects
          </Link>
        </BoxReveal>
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
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-accent-text underline decoration-2 underline-offset-4"
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
