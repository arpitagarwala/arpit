import { useEffect } from 'react'

export default function SEOHead({ title, description, canonical, ogImage }) {
  const baseUrl = 'https://arpitagarwala.online'
  const fullTitle = title
    ? `${title} | Arpit Agarwala`
    : 'Arpit Agarwala – Portfolio | BCom Student, CA Aspirant & Web Creator'
  const img = ogImage || `${baseUrl}/assets/images/my-miniature.png`
  const url = canonical ? `${baseUrl}${canonical}` : baseUrl

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', description || 'Personal portfolio of Arpit Agarwala – BCom (Hons) student, CA aspirant from Kolkata.')
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description || '', 'property')
    setMeta('og:image', img, 'property')
    setMeta('og:url', url, 'property')
    setCanonical(url)
  }, [fullTitle, description, img, url])

  return null
}

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
