export type BuiltApp = {
  id: string;
  name: string;
  category: 'Study' | 'Business' | 'Lifestyle' | 'Finance' | 'Personal';
  line: string;
  description: string;
  icon: string;
  color: string;
  monogram: string;
  href?: string;
};

// Add each public URL here when it is ready. Never substitute a guessed address.
export const BUILT_APPS: BuiltApp[] = [
  { id: 'ca-bhaiya', name: 'CA Bhaiya', category: 'Study', line: 'A study companion with a familiar voice.', description: 'An AI-driven companion for CA students, bringing a Hinglish personality to the study journey.', icon: 'ri-graduation-cap-line', color: '#b9a0ff', monogram: 'CA', href: 'https://ca.arpitagarwala.com' },
  { id: 'gurukul', name: 'Gurukul', category: 'Study', line: 'More time teaching. Less time managing.', description: 'An institute workspace connecting admissions, batches, QR attendance, fees, tests and learning progress. Dedicated teacher and student views, plus account-free demos with fictional data.', icon: 'ri-school-line', color: '#a9d6a1', monogram: 'G', href: 'https://gurukul.arpitagarwala.com/' },
  { id: 'vertex-suite', name: 'Vertex Suite', category: 'Business', line: 'A dedicated space for business.', description: 'A business app built around everyday operations. Explore the suite or get in touch to discuss it for your work.', icon: 'ri-stack-line', color: '#78bcff', monogram: 'V', href: 'https://vertex.arpitagarwala.com' },
  { id: 'gita', name: 'Gita for Daily Life', category: 'Lifestyle', line: 'Ancient wisdom. Everyday perspective.', description: 'A dedicated app bringing the Bhagavad Gita into the context of daily life and reflection.', icon: 'ri-book-open-line', color: '#ffc288', monogram: 'गीता', href: 'https://gita.arpitagarwala.com/' },
  { id: 'panchang', name: 'Hindu Panchang', category: 'Lifestyle', line: 'A connection to the traditional calendar.', description: 'A dedicated Hindu Panchang app, created for a closer connection with the rhythm of the Hindu calendar.', icon: 'ri-sun-line', color: '#f2b5d7', monogram: 'ॐ', href: 'https://panchang.arpitagarwala.com/' },
  { id: 'informedecision', name: 'InformeDecision Market Tracker', category: 'Finance', line: 'A place to follow the markets.', description: 'A market-tracking app at the intersection of finance and technology. Get in touch to learn more about the project.', icon: 'ri-line-chart-line', color: '#85dac2', monogram: 'ID', href: 'https://informedecision.arpitagarwala.com/' },
  { id: 'portfolio', name: 'Arpit Agarwala', category: 'Personal', line: 'The home for everything I create.', description: 'My personal corner of the web: projects, tools, designs, notes and the story behind the work. You’re already here.', icon: 'ri-fingerprint-line', color: '#d5ed86', monogram: 'aa', href: 'https://arpitagarwala.com' },
];
