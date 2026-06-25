import type { Metadata } from 'next';
import TrackerClient from './TrackerClient';

export const metadata: Metadata = {
  title: 'Parcel Tracker – Track Any Shipment | Arpit Agarwala',
  description:
    'Free universal package tracking tool. Automatically detects DHL, FedEx, UPS, DTDC, Blue Dart, Delhivery, Aramex, and 10+ more couriers. Just enter your tracking number.',
  keywords: [
    'package tracking', 'parcel tracker', 'courier tracking', 'DTDC tracking',
    'Delhivery tracking', 'Blue Dart tracking', 'DHL tracking', 'FedEx tracking',
    'UPS tracking', 'Aramex tracking', 'shipment tracker', 'India courier',
  ],
  openGraph: {
    title: 'Universal Parcel Tracker',
    description: 'Track parcels from 15+ couriers in one place. Auto-detects your courier.',
    type: 'website',
  },
};

export default function TrackerPage() {
  return <TrackerClient />;
}
