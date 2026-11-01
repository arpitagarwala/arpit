import { TOOLS, type Category } from '../lib/finance.ts';

export interface Project {
  href: string;
  title: string;
  sub: string;
  icon: string;
  gradient: string;
  category: string;
  featured: boolean;
  tags: string[];
  financeCategory?: Category;
}

const ORIGINAL_PROJECTS: Project[] = [
  {
    href: '/projects/ai-assistant',
    title: "Arpit's AI Avatar",
    sub: 'Simulated chatbot interface',
    icon: 'ri-robot-2-fill',
    gradient: 'from-indigo-600 to-violet-700',
    category: 'Utility',
    featured: true,
    tags: ['AI', 'Simulation', 'Chat Interface'],
  },
  {
    href: '/projects/expense-splitter',
    title: 'Bill Splitter',
    sub: 'Split expenses with friends',
    icon: 'ri-group-line',
    gradient: 'from-violet-500 to-purple-600',
    category: 'Finance',
    featured: false,
    tags: ['Bill Splitting', 'Export', 'Finance'],
  },
  {
    href: '/projects/calculator',
    title: 'Calculator',
    sub: 'Keyboard-ready with history',
    icon: 'ri-calculator-line',
    gradient: 'from-orange-500 to-red-500',
    category: 'Utility',
    featured: true,
    tags: ['Keyboard', 'History Log', 'Glassmorphism'],
  },
  {
    href: '/projects/clock',
    title: 'Clock',
    sub: 'Your time, beautifully in sync',
    icon: 'ri-time-line',
    gradient: 'from-slate-500 to-slate-700',
    category: 'Utility',
    featured: false,
    tags: ['Real-time', 'Analog', 'World Clocks'],
  },
  {
    href: '/projects/github-readme-maker',
    title: 'README Studio',
    sub: 'Profiles, project guides & reusable drafts',
    icon: 'ri-github-fill',
    gradient: 'from-gray-700 to-gray-900',
    category: 'Utility',
    featured: false,
    tags: ['Profile & Project', 'Markdown', 'GitHub Import'],
  },
  {
    href: '/projects/typing',
    title: 'Typing Test',
    sub: 'Live WPM & accuracy tracker',
    icon: 'ri-keyboard-line',
    gradient: 'from-cyan-400 to-blue-500',
    category: 'Utility',
    featured: true,
    tags: ['Educational', 'Skill', 'WPM'],
  },
];

const FINANCE_ICONS: Record<string, string> = {
  sip: 'ri-line-chart-line',
  'compound-growth': 'ri-funds-line',
  'goal-planner': 'ri-focus-3-line',
  emi: 'ri-home-4-line',
  'fixed-deposit': 'ri-bank-line',
  'trade-journal': 'ri-book-open-line',
  'position-size': 'ri-shield-check-line',
};

export const PROJECTS: Project[] = [
  ...ORIGINAL_PROJECTS,
  ...TOOLS.filter(tool => tool.slug !== 'compound-growth').map(tool => ({
    href: `/projects/finance/${tool.slug}`,
    title: tool.title,
    sub: tool.description,
    icon: FINANCE_ICONS[tool.slug] ?? 'ri-calculator-line',
    gradient: tool.category === 'Capital markets' ? 'from-indigo-500 to-purple-600' : 'from-cyan-500 to-blue-600',
    category: 'Finance',
    financeCategory: tool.category,
    featured: true,
    tags: tool.slug === 'sip' ? ['Lumpsum', 'SIP', 'Step-up', 'Investment Planning', 'CSV Export'] : tool.slug === 'trade-journal' ? ['Trade Journal', 'Trading Psychology', 'Strategy Review', 'JSON Backup', 'CSV Export'] : tool.slug === 'position-size' ? ['Lot Size', 'Risk Management', 'Position Sizing', 'Trading'] : [tool.category, 'Calculator', 'CSV Export'],
  })),
];
