import {pageMetadata} from '@/lib/page-metadata';
import {getSite} from '@/lib/site-server';
import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import styles from './page.module.css';
import Footer from '@/components/Footer/Footer';
import GalleryClient from './GalleryClient';
import {PHOTOS} from '@/data/gallery';
import {personalPhotos,photoUrl} from '@/lib/personal-photos';

export async function generateMetadata():Promise<Metadata> {
  const site=await getSite();
  const photos=personalPhotos(site.gallery.photos);
  return pageMetadata('/gallery',{
    title:`Photos of ${site.profile.name} — Portraits & Gallery`,
    description:`Real photos of ${site.profile.name}, including portraits and travel moments. Browse the personal photo gallery on the official portfolio.`,
    openGraph:{images:photos.slice(0,3).map(photo=>({url:photoUrl(photo),alt:site.profile.name+' — '+photo.alt}))},
  });
}

export default async function GalleryPage() {
  const site=await getSite();
  const photos=site.gallery.photos.filter(photo=>photo.enabled).map(photo=>({...photo,alt:photo.alt||PHOTOS.find(seed=>seed.src===photo.src)?.alt||photo.title}));
  const imageGallery={
    '@context':'https://schema.org',
    '@type':'ImageGallery',
    '@id':'https://arpitagarwala.com/gallery#collection',
    url:'https://arpitagarwala.com/gallery',
    name:`${site.profile.name} — Photo gallery`,
    description:site.gallery.description,
    about:{'@id':'https://arpitagarwala.com/#person'},
    associatedMedia:photos.map(photo=>({
      '@type':'ImageObject',
      '@id':photoUrl(photo)+'#image',
      about:{'@id':'https://arpitagarwala.com/#person'},
      contentUrl:new URL(photo.src,'https://arpitagarwala.com').href,
      thumbnailUrl:new URL(photo.thumb||photo.src,'https://arpitagarwala.com').href,
      name:photo.title,
      caption:`${photo.alt} — from ${site.profile.name}’s gallery`,
      isPartOf:{'@id':'https://arpitagarwala.com/gallery#collection'},
    })),
  };
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(imageGallery).replace(/</g,'\\u003c')}}/>
      <BackButton />
      <div className={styles.shell}>
        <GalleryClient photos={photos.map(photo=>({...photo,alt:`${photo.alt} — from ${site.profile.name}’s gallery`}))} title={site.gallery.title==='Gallery'?`Photos of ${site.profile.name}`:site.gallery.title} description={site.gallery.description}/>
        <Footer />
      </div>
    </div>
  );
}
