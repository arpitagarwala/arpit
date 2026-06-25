import { NextRequest, NextResponse } from 'next/server';
import { computePanchang } from '@/lib/panchang';

const DEFAULT_LAT = 22.5726;
const DEFAULT_LON = 88.3639;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat   = parseFloat(searchParams.get('lat')   ?? '') || DEFAULT_LAT;
  const lon   = parseFloat(searchParams.get('lon')   ?? '') || DEFAULT_LON;
  const year  = parseInt(searchParams.get('year')  ?? '') || new Date().getFullYear();
  const month = parseInt(searchParams.get('month') ?? '') || (new Date().getMonth() + 1);

  const daysInMonth = new Date(year, month, 0).getDate();
  const results = [];

  for (let day = 1; day <= daysInMonth; day++) {
    try {
      // Use noon to avoid DST edge cases
      const date = new Date(year, month - 1, day, 12, 0, 0);
      results.push(computePanchang(lat, lon, date));
    } catch {
      results.push(null);
    }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
