import type { ReactNode } from 'react';
import s from './theme.module.css';

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <div className={s.scope}>{children}</div>;
}
