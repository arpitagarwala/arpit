/**
 * Panchang computation utility (server-side only)
 * Used via Next.js API route to compute panchang data server-side
 * and send it to the client as JSON.
 *
 * Computes: Tithi, Nakshatra, Yoga, Karana, Vara, Paksha,
 *           Sunrise/Sunset, Brahma Muhurta, Abhijit Muhurta,
 *           Rahu Kalam, Yamagandam, Gulika Kalam, Vikram Samvat
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const SunCalc = require('suncalc');
const Astronomy = require('astronomy-engine');

// ─── Data tables ───────────────────────────────────────────────────────────

export const TITHI_NAMES = [
  'Pratipada','Dvitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
];

export const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha',
  'Ardra','Punarvasu','Pushya','Ashlesha','Magha',
  'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati',
  'Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

export const YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
  'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi',
  'Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
  'Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha',
  'Shukla','Brahma','Indra','Vaidhriti',
];

export const KARANA_NAMES = [
  'Bava','Balava','Kaulava','Taitila','Garija',
  'Vanija','Vishti',
];

export const VARA_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const VARA_NAMES_SA = ['Ravivāra','Somavāra','Maṅgalavāra','Budhavāra','Guruvāra','Śukravāra','Śanivāra'];

export const HINDU_MONTHS = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
  'Ashwin','Kartik','Margashirsha','Paush','Magh','Phalguna',
];

// Rahu Kalam: which 1/8 segment of daylight hours (1-indexed), indexed by weekday (0=Sun)
const RAHU_PART  = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART  = [5, 4, 3, 2, 1, 8, 7];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 8];

// ─── Astronomical helpers ────────────────────────────────────────────────────

function getSunLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const sunPos = Astronomy.SunPosition(time); // {elon, elat, vec}
  return ((sunPos.elon % 360) + 360) % 360;
}

function getMoonLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const moonPos = Astronomy.EclipticGeoMoon(time); // {lon, lat, dist}
  return ((moonPos.lon % 360) + 360) % 360;
}

// ─── Panchang element computations ─────────────────────────────────────────

function computeTithi(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) + 360) % 360;
  const tithiIndex = Math.floor(elongation / 12); // 0-29
  const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const adjustedIndex = tithiIndex % 15;
  let name: string;
  if (adjustedIndex === 14) {
    name = tithiIndex < 15 ? 'Purnima' : 'Amavasya';
  } else {
    name = TITHI_NAMES[adjustedIndex] ?? `Tithi ${adjustedIndex + 1}`;
  }
  return { index: tithiIndex + 1, name, paksha };
}

function computeNakshatra(moonLon: number) {
  const index = Math.floor((moonLon / 360) * 27); // 0-26
  return { index: index + 1, name: NAKSHATRA_NAMES[index] ?? `Nakshatra ${index + 1}` };
}

function computeYoga(sunLon: number, moonLon: number) {
  const combined = (sunLon + moonLon) % 360;
  const index = Math.floor((combined / 360) * 27); // 0-26
  return { index: index + 1, name: YOGA_NAMES[index] ?? `Yoga ${index + 1}` };
}

function computeKarana(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) + 360) % 360;
  const halfTithi = Math.floor(elongation / 6); // 0-59
  let name: string;
  if (halfTithi === 0) {
    name = 'Kinstughna';
  } else if (halfTithi === 57) { name = 'Shakuni'; }
  else if (halfTithi === 58) { name = 'Chatushpada'; }
  else if (halfTithi === 59) { name = 'Naga'; }
  else { name = KARANA_NAMES[(halfTithi - 1) % 7] ?? 'Bava'; }
  return { name };
}

function computeHinduMonth(sunLon: number, date: Date) {
  const monthIndex = Math.floor(sunLon / 30) % 12;
  const samvatYear = date.getFullYear() + 57;
  return { name: HINDU_MONTHS[monthIndex] ?? 'Chaitra', samvat: samvatYear };
}

// ─── Time helpers ────────────────────────────────────────────────────────────

function addMs(date: Date, ms: number): Date { return new Date(date.getTime() + ms); }

function daytimePart(sunrise: Date, sunset: Date, part: number) {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const segMs = dayMs / 8;
  const start = addMs(sunrise, segMs * (part - 1));
  const end   = addMs(start, segMs);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Main export ─────────────────────────────────────────────────────────────

export interface PanchangResult {
  date: string;
  tithi: { index: number; name: string; paksha: string };
  nakshatra: { index: number; name: string };
  yoga: { index: number; name: string };
  karana: { name: string };
  vara: { english: string; sanskrit: string };
  hinduMonth: { name: string; samvat: number };
  sunrise: string;
  sunset: string;
  brahmaMuhurta: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  rahuKalam: { start: string; end: string };
  yamagandam: { start: string; end: string };
  gulikaKalam: { start: string; end: string };
  lat: number;
  lon: number;
}

export function computePanchang(lat: number, lon: number, date?: Date): PanchangResult {
  const d = date ?? new Date();
  const noon = new Date(d);
  noon.setHours(12, 0, 0, 0);

  const sunLon  = getSunLongitude(noon);
  const moonLon = getMoonLongitude(noon);

  const sunTimes = SunCalc.getTimes(d, lat, lon);
  const sunrise  = sunTimes.sunrise as Date;
  const sunset   = sunTimes.sunset as Date;

  const dayOfWeek = d.getDay();

  // Sunrise must be valid
  const sr = isNaN(sunrise.getTime()) ? new Date(d.setHours(6, 0, 0, 0)) : sunrise;
  const ss = isNaN(sunset.getTime())  ? new Date(d.setHours(18, 0, 0, 0)) : sunset;

  const solarNoon = addMs(sr, (ss.getTime() - sr.getTime()) / 2);

  const brahmaMuhurta = {
    start: addMs(sr, -96 * 60000).toISOString(),
    end:   addMs(sr, -48 * 60000).toISOString(),
  };

  const abhijitMuhurta = {
    start: addMs(solarNoon, -24 * 60000).toISOString(),
    end:   addMs(solarNoon, +24 * 60000).toISOString(),
  };

  return {
    date: d.toISOString(),
    tithi: computeTithi(sunLon, moonLon),
    nakshatra: computeNakshatra(moonLon),
    yoga: computeYoga(sunLon, moonLon),
    karana: computeKarana(sunLon, moonLon),
    vara: { english: VARA_NAMES_EN[dayOfWeek], sanskrit: VARA_NAMES_SA[dayOfWeek] },
    hinduMonth: computeHinduMonth(sunLon, d),
    sunrise: sr.toISOString(),
    sunset: ss.toISOString(),
    brahmaMuhurta,
    abhijitMuhurta,
    rahuKalam:   daytimePart(sr, ss, RAHU_PART[dayOfWeek]),
    yamagandam:  daytimePart(sr, ss, YAMA_PART[dayOfWeek]),
    gulikaKalam: daytimePart(sr, ss, GULIKA_PART[dayOfWeek]),
    lat,
    lon,
  };
}
