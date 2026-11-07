'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

const surfaces = 'main header, main section, main .card, main [data-analytics-section]';

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    function followSection(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.href.includes('#')) return;
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = id ? document.getElementById(id) : document.documentElement;
      if (!target) return;
      event.preventDefault();
      if (url.href !== location.href) window.history.pushState(null, '', url.href);
      // Keep keyboard navigation at the destination without introducing a tab stop.
      if (target !== document.documentElement) {
        const temporaryTabIndex = !target.hasAttribute('tabindex') && !target.matches('a[href], button, input, select, textarea, summary');
        if (temporaryTabIndex) target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
        if (temporaryTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
      }
      target.scrollIntoView({block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
    // Capture also covers Next Links before the router performs its instant hash jump.
    document.addEventListener('click', followSection, true);
    return () => document.removeEventListener('click', followSection, true);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window)) return;
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // Content stays visible even before hydration or if animation is unsupported.
        if (preference.matches || !entry.target.animate || entry.target.getAnimations().length) continue;
        const animation = entry.target.animate(
          [{opacity: 0.94, translate: '0 4px'}, {opacity: 1, translate: '0 0'}],
          {duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)'},
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, {threshold: 0, rootMargin: '0px 0px -20px 0px'});

    function observeSurfaces() {
      document.querySelectorAll(surfaces).forEach(element => {
        if (seen.has(element) || element.parentElement?.closest(surfaces)) return;
        seen.add(element);
        observer.observe(element);
      });
    }
    observeSurfaces();
    // Include streamed route content and sections mounted by client-side views.
    const mutations = new MutationObserver(records => {
      if (records.some(record => Array.from(record.addedNodes).some(node => node instanceof Element))) observeSurfaces();
    });
    mutations.observe(document.body, {childList: true, subtree: true});
    const stopMotion = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener('change', stopMotion);
      animations.forEach(animation => animation.cancel());
    };
  }, [pathname]);

  return null;
}
