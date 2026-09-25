import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/projects';
import { ROLES } from '@/lib/experience';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';
import { BoxReveal } from '@/components/BoxReveal';
import { MascotScene } from '@/components/MascotScene';
import { TravelingCat } from '@/components/TravelingCat';
import { assetPath } from '@/lib/assetPath';

// Empty, purely structural slot the one traveling cat portals itself into
// once this section becomes the active one (see TravelingCat.tsx). Always
// rendered — it carries no visual content of its own (no svg, no image),
// so it costs nothing in the static export — and sized to the cat's own
// hero dimensions up front so its arrival never shifts layout. It sits
// outside BoxReveal's own container, never inside it, so it is never
// covered by the box overlay and never fights it for z-index.
function CatAnchor({ id }: { id: string }) {
  return (
    <div
      id={id}
      aria-hidden="true"
      className="h-[92px] w-[92px] shrink-0 sm:h-[120px] sm:w-[120px]"
    />
  );
}

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
            CS at UCLA. I build apps that make boring habits worth repeating.
            This summer I was at SoFi, working out how to keep an AI assistant
            from saying things it should not.
          </p>
          <p className="mt-2 max-w-measure text-muted">
            Currently building BruinChat with{' '}
            <span className="text-ink">UCLA DevX</span>.
          </p>
        </div>
        <MascotScene />
      </section>

      <section id="experience" className="mt-14">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
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
          </div>
          <CatAnchor id="experience-cat-anchor" />
        </div>
      </section>

      <section id="projects" className="mt-14">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
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
          </div>
          <CatAnchor id="projects-cat-anchor" />
        </div>
      </section>

      <section id="elsewhere" className="mt-14">
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

      <TravelingCat />
    </>
  );
}
