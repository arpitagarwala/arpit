import {PHOTOS, type Photo} from '../data/gallery.ts';

const baseUrl = 'https://arpitagarwala.com';
const originalPaths = [
  '/photos/arpit-agarwala-flight-portrait.jpg',
  '/photos/arpit-agarwala-riverside.jpg',
  '/photos/arpit-agarwala-boat-trip.jpg',
  '/photos/arpit-agarwala-boat-deck.jpg',
  '/photos/arpit-agarwala-formal-portrait.jpg',
  '/photos/arpit-agarwala-travel-photo.jpg',
  '/photos/arpit-agarwala-portrait.jpg',
  '/photos/arpit-agarwala-airport.jpg',
  '/photos/arpit-agarwala-traditional-outfit.jpg',
];

const paths = PHOTOS.map((photo, index) => photo.publicSrc || originalPaths[index]);
export const PRIMARY_PHOTO = '/photos/arpit-agarwala-studio-portrait.png';

function knownPhotoIndex(src: string) {
  return PHOTOS.findIndex((photo, index) => photo.src === src || paths[index] === src || baseUrl + paths[index] === src);
}

/** Keep saved gallery items and their visibility while giving the existing photos stable first-party URLs. */
export function publicPhoto<T extends Photo>(photo: T): T {
  const index = knownPhotoIndex(photo.src);
  if (index < 0) return photo;
  return {...photo, src: paths[index], thumb: paths[index], alt: photo.alt || PHOTOS[index].alt};
}

/** Only published personal photos may represent the person in metadata. */
export function personalPhotos(photos: (Photo & {enabled: boolean})[]) {
  const visible = photos.filter(photo => photo.enabled && knownPhotoIndex(photo.src) >= 0).map(publicPhoto);
  return [...visible.filter(photo => photo.src === PRIMARY_PHOTO), ...visible.filter(photo => photo.src !== PRIMARY_PHOTO)];
}

export function photoUrl(photo: Photo) {
  return new URL(photo.src, baseUrl).href;
}
