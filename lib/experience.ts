export interface Role {
  org: string;
  title: string;
  dates: string;
  location: string;
  logo: string;
  bullets: string[];
}

export const ROLES: Role[] = [
  {
    org: 'SoFi',
    title: 'Software Engineering Intern',
    dates: 'June 2026 — Sept 2026',
    location: 'San Francisco, CA',
    logo: '/logos/sofi.webp',
    bullets: [
      'Built a guardrail evaluation pipeline for Coach, SoFi’s AI financial guidance platform serving 10M+ members, reaching 92% recall and 83% precision across 15 rule classes.',
      'Turned internal compliance policy into 15 runtime rules and built 1,500+ labeled examples, so each rule class could be measured instead of guessed at.',
      'Self-hosted a safety classifier on Amazon EKS in observe mode, shadowing production at 150ms p95 across 25K+ candidate responses to produce a coverage matrix for future enforcement.',
    ],
  },
  {
    org: 'UCLA DevX',
    title: 'Developer — BruinChat',
    dates: '2025 — Present',
    location: 'Los Angeles, CA',
    logo: '/logos/devx.webp',
    bullets: [
      'Build BruinChat, a campus app that connects UCLA students through auto-generated group chats for shared courses, on a multi-developer agile team.',
      'Own the backend services for user profiles, class enrollment, and chat-group matching, plus peer code review and sprint planning.',
    ],
  },
  {
    org: 'DECA Inc',
    title: 'Financial Data Analyst & Development Intern',
    dates: 'Sept 2024 — June 2025',
    location: 'Renton, WA',
    logo: '/logos/deca.webp',
    bullets: [
      'Delivered a Java ETL tool that parses, cleans, and visualizes financial data from CSV and Excel, cutting 10+ hours of manual work a week.',
      'Cut pipeline runtime 60% and memory 40% on 10K+ record datasets by replacing linear scans with hash lookups and batching the sort.',
      'Automated 10+ weekly financial reports with visualized KPIs, removing 80% of the manual reporting time.',
    ],
  },
];
