export interface Photo {
  src: string;
  thumb: string;
  title: string;
  category?: string;
  alt?: string;
  publicSrc?: string;
}

const ORIGINAL_PHOTOS: Photo[] = [
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894901/WhatsApp_Image_2026-03-07_at_8.03.13_PM_kvvxso.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894901/WhatsApp_Image_2026-03-07_at_8.03.13_PM_kvvxso.jpg',
    title: 'Moment 01',
    alt: 'Seated beside an airplane window during a flight',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894900/WhatsApp_Image_2026-03-07_at_8.01.51_PM_oq4kkf.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894900/WhatsApp_Image_2026-03-07_at_8.01.51_PM_oq4kkf.jpg',
    title: 'Moment 02',
    alt: 'Standing by a riverside with boats in the background',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894899/WhatsApp_Image_2026-03-07_at_8.02.54_PM_1_clkjsu.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894899/WhatsApp_Image_2026-03-07_at_8.02.54_PM_1_clkjsu.jpg',
    title: 'Moment 03',
    alt: 'Sitting on a wooden boat wearing an orange life jacket',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894899/WhatsApp_Image_2026-03-07_at_8.02.54_PM_pa7ebr.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894899/WhatsApp_Image_2026-03-07_at_8.02.54_PM_pa7ebr.jpg',
    title: 'Moment 04',
    alt: 'Relaxing on the deck of a boat beside riverside steps',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894896/WhatsApp_Image_2026-03-07_at_7.54.14_PM_d5wdun.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894896/WhatsApp_Image_2026-03-07_at_7.54.14_PM_d5wdun.jpg',
    title: 'Moment 05',
    alt: 'Standing beside a glass railing inside a shopping mall',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894898/WhatsApp_Image_2026-03-07_at_8.02.35_PM_ncn6ib.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894898/WhatsApp_Image_2026-03-07_at_8.02.35_PM_ncn6ib.jpg',
    title: 'Moment 06',
    alt: 'Smiling on a boat with a large folded-hands sculpture behind',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894898/WhatsApp_Image_2026-03-07_at_8.01.35_PM_cehcpv.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894898/WhatsApp_Image_2026-03-07_at_8.01.35_PM_cehcpv.jpg',
    title: 'Moment 07',
    alt: 'Portrait on a wooden boat with a folded-hands sculpture in the background',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894897/WhatsApp_Image_2026-03-07_at_7.53.41_PM_f49pkm.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894897/WhatsApp_Image_2026-03-07_at_7.53.41_PM_f49pkm.jpg',
    title: 'Moment 08',
    alt: 'Standing on an airport apron with an aircraft in the background',
    category: 'Moments',
  },
  {
    src: 'https://res.cloudinary.com/dxsja3wy5/image/upload/v1772894896/WhatsApp_Image_2026-03-07_at_7.56.25_PM_qnavfl.jpg',
    thumb: 'https://res.cloudinary.com/dxsja3wy5/image/upload/w_600,q_auto,f_auto/v1772894896/WhatsApp_Image_2026-03-07_at_7.56.25_PM_qnavfl.jpg',
    title: 'Moment 09',
    alt: 'Seated in a maroon kurta beneath colourful decorative fabrics',
  },
];

/** Personal photos uploaded on 31 October 2026; original files are preserved. */
export const NEW_PHOTOS: Photo[] = [
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/v1793437144/Arpit_Agarwala_1_zqhdhz.png",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/v1793437144/Arpit_Agarwala_1_zqhdhz.png",
    "publicSrc": "/photos/arpit-agarwala-studio-portrait.png",
    "title": "Studio portrait",
    "alt": "Maroon shirt and grey trousers against a dark studio backdrop",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_16_h1z7pf",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_16_h1z7pf",
    "publicSrc": "/photos/arpit-agarwala-wooden-boat.png",
    "title": "On the river",
    "alt": "Seated at the front of a wooden boat wearing an orange life jacket",
    "category": "Travel"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_23_lq8evg",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_23_lq8evg",
    "publicSrc": "/photos/arpit-agarwala-courtyard-portrait.png",
    "title": "Courtyard portrait",
    "alt": "Seated in a pink shirt in a black-and-white tiled courtyard",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_22_l2uzup",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_22_l2uzup",
    "publicSrc": "/photos/arpit-agarwala-coffee-house.png",
    "title": "Coffee house",
    "alt": "Pink shirt outside the yellow wall of Roastery Coffee House",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_8_ppewmv",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_8_ppewmv",
    "publicSrc": "/photos/arpit-agarwala-warehouse-evening.png",
    "title": "An evening out",
    "alt": "With a companion beneath the Warehouse sign and warm lights",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_2_yvbzco",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_2_yvbzco",
    "publicSrc": "/photos/arpit-agarwala-garden-courtyard.jpg",
    "title": "Garden courtyard",
    "alt": "Standing in a pink shirt beneath a large tree in a planted courtyard",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_21_rkyunl",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_21_rkyunl",
    "publicSrc": "/photos/arpit-agarwala-outdoor-selfie.png",
    "title": "An outdoor moment",
    "alt": "An outdoor selfie with a companion, both wearing light shirts",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_20_ucznsz",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_20_ucznsz",
    "publicSrc": "/photos/arpit-agarwala-colourful-building.png",
    "title": "Out and about",
    "alt": "A selfie with a companion in front of a colourful building",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_1_omdi5q",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_1_omdi5q",
    "publicSrc": "/photos/arpit-agarwala-teal-shirt-portrait.jpg",
    "title": "Event portrait",
    "alt": "Teal shirt and grey trousers in front of an ornate event backdrop",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_18_zgpvjv",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_18_zgpvjv",
    "publicSrc": "/photos/arpit-agarwala-river-bridge.png",
    "title": "By the bridge",
    "alt": "Seated on a boat with a companion and a bridge in the background",
    "category": "Travel"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_19_sxygvv",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_19_sxygvv",
    "publicSrc": "/photos/arpit-agarwala-tree-lined-walkway.png",
    "title": "A walk together",
    "alt": "With a companion on a tree-lined walkway, both wearing white shirts",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_17_f6p8dg",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_17_f6p8dg",
    "publicSrc": "/photos/arpit-agarwala-life-jacket-selfie.png",
    "title": "Boat-trip selfie",
    "alt": "A close selfie with a companion wearing orange life jackets",
    "category": "Travel"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_15_kvq2zp",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_15_kvq2zp",
    "publicSrc": "/photos/arpit-agarwala-river-sculpture.png",
    "title": "River memories",
    "alt": "White shirt and orange life jacket on a boat beside a folded-hands sculpture",
    "category": "Travel"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_13_d1e1lg",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_13_d1e1lg",
    "publicSrc": "/photos/arpit-agarwala-roastery-courtyard.png",
    "title": "In the courtyard",
    "alt": "Black polo shirt and grey trousers outside the Roastery courtyard",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_14_iqd12n",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_14_iqd12n",
    "publicSrc": "/photos/arpit-agarwala-airport-jacket.png",
    "title": "Airport journey",
    "alt": "Brown jacket, scarf and jeans at the airport",
    "category": "Travel"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_12_iyst16",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_12_iyst16",
    "publicSrc": "/photos/arpit-agarwala-maroon-kurta.png",
    "title": "Traditional style",
    "alt": "Maroon kurta and white trousers outside an apartment building",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_11_oaqotu",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_11_oaqotu",
    "publicSrc": "/photos/arpit-agarwala-garden-seat.png",
    "title": "A quiet moment",
    "alt": "Seated in a pink shirt beside a large tree and potted plants",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_10_ebs4k4",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_10_ebs4k4",
    "publicSrc": "/photos/arpit-agarwala-evening-friends.png",
    "title": "Under the lights",
    "alt": "With two companions beneath warm string lights",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_6_sclecq",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_6_sclecq",
    "publicSrc": "/photos/arpit-agarwala-sculpted-wall.png",
    "title": "A moment to pause",
    "alt": "Seated in a dark shirt in front of a decorative sculpted wall",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_9_phn7yn",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_9_phn7yn",
    "publicSrc": "/photos/arpit-agarwala-mall-moment.png",
    "title": "At the mall",
    "alt": "Posing with a companion inside a shopping mall",
    "category": "Moments"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_2_t3ehgb",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_2_t3ehgb",
    "publicSrc": "/photos/arpit-agarwala-car-portrait.png",
    "title": "Sunlit portrait",
    "alt": "Seated inside a car wearing a seat belt with sunlight across the portrait",
    "category": "Portraits"
  },
  {
    "src": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_5_za7gge",
    "thumb": "https://res.cloudinary.com/dxsja3wy5/image/upload/Arpit_Agarwala_5_za7gge",
    "publicSrc": "/photos/arpit-agarwala-evening-portrait.png",
    "title": "Evening portrait",
    "alt": "Dark shirt and light trousers beside a lit wall and flowers",
    "category": "Portraits"
  }
];

export const PHOTOS: Photo[] = [...ORIGINAL_PHOTOS, ...NEW_PHOTOS];
