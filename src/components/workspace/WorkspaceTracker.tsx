'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export default function WorkspaceTracker() {
  const path = usePathname();
  useEffect(() => {
    if (
      !/^\/(games|productivity|projects)\/.+/.test(path) ||
      /\/(progress|analysis)$/.test(path)
    )
      return;
    try {
      localStorage.setItem('workspace-last-tool', path);
    } catch {}
  }, [path]);
  return null;
}
