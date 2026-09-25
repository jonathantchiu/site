export interface Role {
  id: string;
  org: string;
  title: string;
  dates: string;
  location: string;
  logo: string;
  blurb: string;
  bullets: string[];
}

export const ROLES: Role[] = [
  {
    id: 'sofi',
    org: 'SoFi',
    title: 'Software Engineering Intern',
    dates: 'June 2026 — Sept 2026',
    location: 'San Francisco, CA',
    logo: '/logos/sofi.webp',
    blurb:
      'Worked on guardrails for Coach, SoFi’s AI financial assistant. Turned compliance policy into rules you can measure, then shadow-tested a safety classifier against live production traffic.',
    bullets: [
      'Built a guardrail evaluation pipeline for Coach, SoFi’s AI financial guidance platform for 10M+ members. It reaches 92% recall and 83% precision across 15 rule classes.',
      'Turned internal compliance policy into 15 runtime rules and built a set of 1,500+ labeled examples, so every rule class had a measured score behind it.',
      'Self-hosted a safety classifier on Amazon EKS in observe mode. It shadowed production at 150ms p95 across 25K+ candidate responses and produced a coverage matrix for future enforcement.',
    ],
  },
  {
    id: 'ucla-devx',
    org: 'UCLA DevX',
    title: 'Developer — BruinChat',
    dates: '2025 — Present',
    location: 'Los Angeles, CA',
    logo: '/logos/devx.webp',
    blurb:
      'Building BruinChat, a campus app that turns a shared UCLA course into a group chat nobody had to organize. I own the backend for profiles, enrollment, and chat matching.',
    bullets: [
      'Build BruinChat with a multi-developer agile team. It connects UCLA students through group chats generated from the courses they share.',
      'Own the backend services for user profiles, class enrollment, and chat-group matching, and take part in peer code review and sprint planning.',
    ],
  },
  {
    id: 'deca',
    org: 'DECA Inc',
    title: 'Financial Data Analyst & Development Intern',
    dates: 'Sept 2024 — June 2025',
    location: 'Renton, WA',
    logo: '/logos/deca.webp',
    blurb:
      'Built a Java ETL tool that took over the weekly financial reporting and cut both the manual work and the pipeline runtime on 10K+ record CSV and Excel datasets.',
    bullets: [
      'Delivered a Java ETL tool that parses, cleans, and visualizes financial data from CSV and Excel. It saved 10+ hours of manual work a week.',
      'Replaced linear scans with hash lookups and batched the sort, which cut pipeline runtime 60% and memory 40% on 10K+ record datasets.',
      'Automated 10+ weekly financial reports with visualized KPIs, which removed 80% of the manual reporting time.',
    ],
  },
];
