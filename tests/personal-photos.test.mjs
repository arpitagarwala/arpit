import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSite, siteDefaults} from '../src/lib/site-config.ts';
import {PHOTOS} from '../src/data/gallery.ts';
import {personalPhotos, publicPhoto, PRIMARY_PHOTO} from '../src/lib/personal-photos.ts';

test('saved CDN gallery records migrate without changing visibility or owner captions', () => {
  const saved=siteDefaults();
  const index=saved.gallery.photos.findIndex(photo=>photo.id==='photo-0');
  saved.gallery.photos[index]={...saved.gallery.photos[index],src:PHOTOS[0].src,thumb:PHOTOS[0].thumb,title:'My flight',enabled:false};
  const upgraded=normalizeSite(saved);
  assert.equal(upgraded.gallery.photos[index].src,'/photos/arpit-agarwala-flight-portrait.jpg');
  assert.equal(upgraded.gallery.photos[index].title,'My flight');
  assert.equal(upgraded.gallery.photos[index].enabled,false);
  assert.equal(saved.gallery.photos[index].src,PHOTOS[0].src);
  assert.ok(!personalPhotos(upgraded.gallery.photos).some(photo=>photo.src===upgraded.gallery.photos[index].src));
});

test('custom uploads are preserved and hidden portraits cannot represent the public profile', () => {
  const custom={src:'https://example.org/another-photo.jpg',thumb:'https://example.org/thumb.jpg',title:'Custom'};
  assert.deepEqual(publicPhoto(custom),custom);
  const saved=siteDefaults();
  saved.gallery.photos=saved.gallery.photos.map(photo=>({...photo,enabled:false}));
  assert.deepEqual(personalPhotos(saved.gallery.photos),[]);
  const portrait=saved.gallery.photos.find(photo=>photo.src===PRIMARY_PHOTO);
  portrait.enabled=true;
  assert.equal(personalPhotos(saved.gallery.photos)[0].src,PRIMARY_PHOTO);
});


test('legacy gallery receives the new photos once while preserving owner decisions', () => {
  const saved=siteDefaults();
  delete saved.galleryRevision;
  saved.gallery.photos=saved.gallery.photos.filter(photo=>Number(photo.id.slice(6))<9);
  saved.gallery.photos[0].enabled=false;
  saved.gallery.photos[0].title='Owner caption';
  saved.gallery.photos.push({id:'photo-9',src:'https://example.org/custom.jpg',thumb:'https://example.org/custom.jpg',title:'Custom upload',enabled:true});
  const upgraded=normalizeSite(saved);
  assert.equal(upgraded.galleryRevision,1);
  assert.equal(upgraded.gallery.photos.length,32);
  assert.equal(new Set(upgraded.gallery.photos.map(photo=>photo.id)).size,32);
  assert.equal(personalPhotos(upgraded.gallery.photos)[0].src,PRIMARY_PHOTO);
  assert.equal(upgraded.gallery.photos.find(photo=>photo.id==='photo-0').enabled,false);
  assert.equal(upgraded.gallery.photos.find(photo=>photo.id==='photo-0').title,'Owner caption');
  assert.ok(upgraded.gallery.photos.some(photo=>photo.src==='https://example.org/custom.jpg'));
  assert.equal(saved.galleryRevision,undefined);
  assert.equal(saved.gallery.photos.length,10);
  assert.deepEqual(normalizeSite(upgraded),upgraded);
  upgraded.gallery.photos=upgraded.gallery.photos.filter(photo=>photo.src!==PRIMARY_PHOTO);
  assert.ok(!normalizeSite(upgraded).gallery.photos.some(photo=>photo.src===PRIMARY_PHOTO));
});

test('an existing saved new upload keeps its visibility and caption during migration', () => {
  const saved=siteDefaults();
  delete saved.galleryRevision;
  const portrait=saved.gallery.photos.find(photo=>photo.src===PRIMARY_PHOTO);
  portrait.src=PHOTOS.find(photo=>photo.publicSrc===PRIMARY_PHOTO).src;
  portrait.enabled=false;
  portrait.title='My studio photograph';
  const upgraded=normalizeSite(saved);
  assert.equal(upgraded.gallery.photos.length,31);
  const matches=upgraded.gallery.photos.filter(photo=>photo.src===PRIMARY_PHOTO);
  assert.equal(matches.length,1);
  assert.equal(matches[0].enabled,false);
  assert.equal(matches[0].title,'My studio photograph');
  assert.notEqual(personalPhotos(upgraded.gallery.photos)[0].src,PRIMARY_PHOTO);
});
