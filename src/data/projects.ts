export interface Project {
  href: string;
  title: string;
  sub: string;
  icon: string;
  gradient: string;
  category: string;
  featured: boolean;
  tags: string[];
}

export const PROJECTS: Project[] = [
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
    sub: 'Digital + analog world clock',
    icon: 'ri-time-line',
    gradient: 'from-slate-500 to-slate-700',
    category: 'Utility',
    featured: false,
    tags: ['Real-time', 'Analog', 'World Clocks'],
  },
  {
    href: '/projects/network',
    title: 'Neural Network',
    sub: '3D particle system (WebGL)',
    icon: 'ri-shape-2-fill',
    gradient: 'from-slate-700 to-slate-900',
    category: 'Utility',
    featured: true,
    tags: ['Three.js', 'WebGL', 'Physics'],
  },
  {
    href: '/projects/notepad',
    title: 'Notepad',
    sub: 'Private auto-saving notes',
    icon: 'ri-sticky-note-line',
    gradient: 'from-yellow-500 to-amber-500',
    category: 'Utility',
    featured: false,
    tags: ['Privacy', 'Auto-save', 'Local Storage'],
  },
  {
    href: '/projects/pathfinder',
    title: 'Pathfinder',
    sub: 'A* & Dijkstra visualizer',
    icon: 'ri-route-line',
    gradient: 'from-indigo-500 to-purple-600',
    category: 'Utility',
    featured: true,
    tags: ['Algorithms', 'DSA', 'Visualizer'],
  },
  {
    href: '/projects/pomodoro',
    title: 'Pomodoro',
    sub: 'Focus timer with XP & ranks',
    icon: 'ri-fire-fill',
    gradient: 'from-purple-500 to-indigo-600',
    category: 'Utility',
    featured: false,
    tags: ['Productivity', 'Gamification', 'RPG'],
  },
  {
    href: '/projects/github-readme-maker',
    title: 'README Maker',
    sub: 'Auto-generate GitHub READMEs',
    icon: 'ri-github-fill',
    gradient: 'from-gray-700 to-gray-900',
    category: 'Utility',
    featured: false,
    tags: ['Automation', 'Markdown', 'GitHub'],
  },
  {
    href: '/projects/sip',
    title: 'SIP Calculator',
    sub: 'Mutual fund growth simulator',
    icon: 'ri-line-chart-line',
    gradient: 'from-cyan-500 to-blue-600',
    category: 'Finance',
    featured: true,
    tags: ['Chart.js', 'Investing', 'Compound Interest'],
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
