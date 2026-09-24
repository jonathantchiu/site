import { ROLES } from '@/lib/experience';
import { ExperienceItem } from '@/components/ExperienceItem';
import { Reveal } from '@/components/Reveal';

export const metadata = { title: 'Experience — Jonathan Chiu' };

export default function ExperiencePage() {
  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Experience</h1>

      <div className="mt-10 flex flex-col gap-8">
        {ROLES.map((role, i) => (
          <Reveal key={role.org} delay={i * 0.08}>
            <ExperienceItem role={role} />
          </Reveal>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Education</h2>
        <div className="mt-4 rounded-card border border-hairline p-4 sm:p-6">
          <p className="text-lg">University of California, Los Angeles</p>
          <p className="text-muted">
            BS Computer Science, Henry Samueli School of Engineering · Expected June 2028
          </p>
        </div>
      </section>
    </>
  );
}
