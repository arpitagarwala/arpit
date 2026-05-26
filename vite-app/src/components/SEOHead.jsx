import { useEffect } from 'react';

/**
 * Sets document <title> and meta description dynamically.
 * For full SSR-level SEO, consider react-helmet-async.
 */
export default function SEOHead({ title, description, canonical }) {
  useEffect(() => {
    document.title = title || 'Arpit Agarwala – Portfolio';
    const desc = document.querySelector('meta[name="description"]');
    if (desc && description) desc.setAttribute('content', description);
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon && canonical) canon.setAttribute('href', canonical);
  }, [title, description, canonical]);

  return null;
}
