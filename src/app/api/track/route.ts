import { NextRequest, NextResponse } from 'next/server';

// TrackCourier.io REST API
// Endpoint: POST https://api.trackcourier.io/api/v1/track
// Body: { tracking_number, courier_code }
// OR:   { tracking_number } for auto-detect
// Auth: Bearer token in Authorization header

const TRACKCOURIER_KEY = process.env.TRACKCOURIER_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get('id');
  const courierSlug = searchParams.get('courier'); // TrackCourier.io slug

  if (!trackingNumber) {
    return NextResponse.json({ error: 'Tracking number is required.' }, { status: 400 });
  }

  if (!TRACKCOURIER_KEY) {
    return NextResponse.json(
      {
        error: 'API key not configured.',
        setup_guide: 'Add TRACKCOURIER_API_KEY to your .env.local file.',
      },
      { status: 503 }
    );
  }

  // Build request body – include courier_code when we have a confident detection
  const body: Record<string, string> = {
    tracking_number: trackingNumber.trim(),
  };
  if (courierSlug) {
    body.courier_code = courierSlug;
  }

  try {
    const res = await fetch('https://api.trackcourier.io/api/v1/track', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TRACKCOURIER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Don't cache on server so every tracking call is fresh
    });

    const raw = await res.json();

    if (!res.ok) {
      const message =
        raw?.message ?? raw?.error ?? `TrackCourier.io returned status ${res.status}`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json(normalizeTrackCourier(raw));
  } catch (err) {
    console.error('[track/route] fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to reach the tracking service. Please try again.' },
      { status: 502 }
    );
  }
}

// ─────────────────────────────────────────────────────────
// Shared types (also exported so components can import)
// ─────────────────────────────────────────────────────────

export interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  status: 'delivered' | 'out_for_delivery' | 'in_transit' | 'pending' | 'exception';
}

export interface TrackingResult {
  trackingNumber: string;
  courier: string;
  status: string;
  statusLabel: string;
  estimatedDelivery?: string;
  origin?: string;
  destination?: string;
  events: TrackingEvent[];
}

// ─────────────────────────────────────────────────────────
// Normalizer – maps TrackCourier.io response to our shape
// ─────────────────────────────────────────────────────────

function classifyStatus(raw: string): TrackingEvent['status'] {
  const s = (raw ?? '').toLowerCase();
  if (s.includes('delivered')) return 'delivered';
  if ((s.includes('out') && s.includes('delivery')) || s === 'outfordelivery')
    return 'out_for_delivery';
  if (s.includes('exception') || s.includes('failed') || s.includes('hold'))
    return 'exception';
  if (
    s.includes('transit') ||
    s.includes('departed') ||
    s.includes('arrived') ||
    s.includes('picked') ||
    s === 'intransit'
  )
    return 'in_transit';
  return 'pending';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTrackCourier(data: any): TrackingResult {
  // TrackCourier.io wraps in data.tracking or exposes fields directly
  const t = data?.tracking ?? data?.data ?? data;

  const rawEvents =
    t?.checkpoints ?? t?.events ?? t?.tracking_history ?? data?.checkpoints ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: TrackingEvent[] = rawEvents.map((e: any) => ({
    timestamp: e.checkpoint_time ?? e.time ?? e.timestamp ?? e.date ?? '',
    location:
      ([e.city, e.state, (e.country_name ?? e.country)].filter(Boolean).join(', ')) ||
      (e.location ?? ''),
    description: e.message ?? e.description ?? e.status ?? '',
    status: classifyStatus(e.tag ?? e.status ?? e.description ?? ''),
  }));

  return {
    trackingNumber:
      t?.tracking_number ?? data?.tracking_number ?? '',
    courier:
      t?.slug ?? t?.courier ?? data?.courier_name ?? data?.courier ?? '',
    status:
      t?.tag ?? t?.status ?? data?.status ?? '',
    statusLabel:
      t?.subtag_message ?? t?.tag_description ?? t?.status_label ?? t?.tag ?? t?.status ?? '',
    estimatedDelivery:
      t?.expected_delivery ?? t?.estimated_delivery ?? data?.estimated_delivery,
    origin:
      t?.origin_country_iso3 ?? t?.origin ?? data?.origin,
    destination:
      t?.destination_country_iso3 ?? t?.destination ?? data?.destination,
    events,
  };
}
