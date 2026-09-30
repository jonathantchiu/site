import Link from 'next/link';
import { getFeaturedProjects } from '@/lib/projects';
import { ROLES } from '@/lib/experience';
import { EntryRow } from '@/components/EntryRow';
import { Reveal } from '@/components/Reveal';
import { SceneCat } from '@/components/SceneCat';
import { Scene } from '@/components/Scene';
import { assetPath } from '@/lib/assetPath';
import { ContactLinks } from '@/components/ContactLinks';
import { CosmeticPickup } from '@/components/CosmeticPickup';
import { Inventory } from '@/components/Inventory';

// Three full-viewport scenes (spec: v3 editorial layout), each on its own
// color band (v3.1 spec: section color bands). Scene owns the
// number/heading/lede/hairline header block and the data-band attribute
// that scopes the band's token overrides in app/globals.css. Each scene
// ends with its own SceneCat, placed in flow at a fixed spot chosen by the
// className passed here, so it never covers content.
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
        lede={<ContactLinks />}
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
        <CosmeticPickup id="sunglasses" sceneId="hero" />
        <SceneCat
          sceneId="hero"
          className="order-first mb-[41px] mt-[-105px] self-end sm:order-none sm:mb-0 sm:-mt-24"
        />
      </Scene>

      <Scene id="experience" number="02" heading="Experience" band="warm">
        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1">
              <div className="flex flex-col">
                {ROLES.map((role, i) => (
                  <Reveal key={role.id} delay={i * 0.08}>
                    <EntryRow
                      compact
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
          </div>
        </div>
        <SceneCat sceneId="experience" className="-mt-11 self-end" />
      </Scene>

      <Scene id="projects" number="03" heading="Projects" band="dark">
        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="min-w-0 flex-1">
              <div className="flex flex-col">
                {featured.map((project, i) => (
                  <Reveal key={project.slug} delay={i * 0.08}>
                    <EntryRow
                      compact
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
          </div>
        </div>
        <CosmeticPickup id="chef-hat" sceneId="projects" />
        <SceneCat sceneId="projects" className="-mt-11 self-end" />
      </Scene>

      <Inventory />
    </>
  );
}
