import { NextRequest, NextResponse } from 'next/server';
import { computePanchang } from '@/lib/panchang';

const DEFAULT_LAT = 22.5726;
const DEFAULT_LON = 88.3639;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '') || DEFAULT_LAT;
  const lon = parseFloat(searchParams.get('lon') ?? '') || DEFAULT_LON;
  const dateStr = searchParams.get('date');

  let date: Date;
  if (dateStr) {
    date = new Date(`${dateStr}T12:00:00`);
    if (isNaN(date.getTime())) date = new Date();
  } else {
    date = new Date();
  }

  try {
    const data = computePanchang(lat, lon, date);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
    });
  } catch (err) {
    console.error('[Panchang API]', err);
    return NextResponse.json({ error: 'Computation failed' }, { status: 500 });
  }
}
