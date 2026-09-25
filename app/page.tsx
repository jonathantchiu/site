import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/projects';
import { ROLES } from '@/lib/experience';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';
import { BoxReveal } from '@/components/BoxReveal';
import { SceneCat } from '@/components/SceneCat';
import { Scene } from '@/components/Scene';
import { assetPath } from '@/lib/assetPath';

// Four full-viewport scenes (spec: v3 editorial layout), each on its own
// color band (v3.1 spec: section color bands) and each showing its own cat
// (v3.1 spec: the cat, reworked — components/SceneCat.tsx). Scene owns the
// number/heading/lede/hairline header block and the data-band attribute
// that scopes the band's token overrides in app/globals.css; SceneCat is
// an absolutely-positioned decoration that never sits inside BoxReveal's
// own container, so it is never covered by the box overlay.
export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <>
      <Scene
        id="hero"
        number="01"
        level="h1"
        band="light"
        heading="Jonathan Chiu"
        lede="CS at UCLA. I build apps that make boring habits worth repeating. This summer I was at SoFi, working out how to keep an AI assistant from saying things it should not."
      >
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={assetPath('/profile.webp')}
              alt="Jonathan Chiu"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-hairline object-cover"
            />
            <p className="max-w-measure text-muted">
              Currently building BruinChat with <span className="text-ink">UCLA DevX</span>.
            </p>
          </div>
        </div>
        <SceneCat sceneId="hero" band="light" startIndex={0} />
      </Scene>

      <Scene id="experience" number="02" heading="Experience" band="warm">
        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1">
            <BoxReveal>
              <div className="flex flex-col">
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
        </div>
        <SceneCat sceneId="experience" band="warm" startIndex={2} />
      </Scene>

      <Scene id="projects" number="03" heading="Projects" band="dark">
        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1">
            <BoxReveal>
              <div className="flex flex-col">
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
        </div>
        <SceneCat sceneId="projects" band="dark" startIndex={5} />
      </Scene>

      <Scene id="elsewhere" number="04" heading="Elsewhere" band="light">
        <ul className="flex flex-wrap gap-4">
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
        <SceneCat sceneId="elsewhere" band="light" startIndex={7} />
      </Scene>
    </>
  );
}
