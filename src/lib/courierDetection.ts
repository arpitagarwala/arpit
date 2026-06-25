export interface CourierInfo {
  id: string;
  tcSlug: string;
  name: string;
  color: string;
  textColor: string;
  emoji: string;
  trackUrl: string;
}

export const COURIERS: Record<string, CourierInfo> = {
  ups: {
    id: 'ups',
    tcSlug: 'ups',
    name: 'UPS',
    color: '#8B4513',
    textColor: '#fff',
    emoji: '📦',
    trackUrl: 'https://www.ups.com/track?tracknum=',
  },
  fedex: {
    id: 'fedex',
    tcSlug: 'fedex-courier',
    name: 'FedEx',
    color: '#4D148C',
    textColor: '#fff',
    emoji: '🚀',
    trackUrl: 'https://www.fedex.com/fedextrack/?tracknumbers=',
  },
  dhl: {
    id: 'dhl',
    tcSlug: 'dhl-express',
    name: 'DHL',
    color: '#FFCC00',
    textColor: '#D40511',
    emoji: '✈️',
    trackUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
  },
  usps: {
    id: 'usps',
    tcSlug: 'usps',
    name: 'USPS',
    color: '#004B87',
    textColor: '#fff',
    emoji: '📬',
    trackUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  },
  bluedart: {
    id: 'bluedart',
    tcSlug: 'blue-dart-courier',
    name: 'Blue Dart',
    color: '#003087',
    textColor: '#fff',
    emoji: '🎯',
    trackUrl: 'https://www.bluedart.com/tracking',
  },
  dtdc: {
    id: 'dtdc',
    tcSlug: 'dtdc',
    name: 'DTDC',
    color: '#E31837',
    textColor: '#fff',
    emoji: '📮',
    trackUrl: 'https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awbno&strCnno=',
  },
  delhivery: {
    id: 'delhivery',
    tcSlug: 'delhivery-courier',
    name: 'Delhivery',
    color: '#D71920',
    textColor: '#fff',
    emoji: '🛵',
    trackUrl: 'https://www.delhivery.com/track/package/',
  },
  aramex: {
    id: 'aramex',
    tcSlug: 'aramex-courier',
    name: 'Aramex',
    color: '#C8102E',
    textColor: '#fff',
    emoji: '🌍',
    trackUrl: 'https://www.aramex.com/us/en/track/results?ShipmentNumber=',
  },
  ekart: {
    id: 'ekart',
    tcSlug: 'ekart-logistics-courier',
    name: 'Ekart (Flipkart)',
    color: '#F74040',
    textColor: '#fff',
    emoji: '🛒',
    trackUrl: 'https://ekartlogistics.com/track/',
  },
  ecomexpress: {
    id: 'ecomexpress',
    tcSlug: 'ecom-express-courier',
    name: 'Ecom Express',
    color: '#00AEEF',
    textColor: '#fff',
    emoji: '📲',
    trackUrl: 'https://ecomexpress.in/tracking/',
  },
  xpressbees: {
    id: 'xpressbees',
    tcSlug: 'xpressbees',
    name: 'XpressBees',
    color: '#F7941D',
    textColor: '#fff',
    emoji: '🐝',
    trackUrl: 'https://www.xpressbees.com/shipment/tracking',
  },
  shadowfax: {
    id: 'shadowfax',
    tcSlug: 'shadowfax',
    name: 'Shadowfax',
    color: '#FF6B35',
    textColor: '#fff',
    emoji: '⚡',
    trackUrl: 'https://www.shadowfax.in/tracking',
  },
  shiprocket: {
    id: 'shiprocket',
    tcSlug: 'shiprocket',
    name: 'Shiprocket',
    color: '#FF6600',
    textColor: '#fff',
    emoji: '🚀',
    trackUrl: 'https://app.shiprocket.in/tracking/',
  },
  india_post: {
    id: 'india_post',
    tcSlug: 'india-post-domestic',
    name: 'India Post',
    color: '#CC0000',
    textColor: '#fff',
    emoji: '🇮🇳',
    trackUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
  },
  amazon_logistics: {
    id: 'amazon_logistics',
    tcSlug: 'ats-amazon-shipping',
    name: 'Amazon Logistics',
    color: '#FF9900',
    textColor: '#131921',
    emoji: '📦',
    trackUrl: 'https://track.amazon.in/tracking/',
  },
  tirupati: {
    id: 'tirupati',
    tcSlug: 'shree-tirupati-courier',
    name: 'Tirupati Courier',
    color: '#FF8C00',
    textColor: '#fff',
    emoji: '🏛️',
    trackUrl: 'https://www.tirupaticourier.com/tracking',
  },
  professional: {
    id: 'professional',
    tcSlug: 'professional-courier',
    name: 'Professional Courier',
    color: '#1A237E',
    textColor: '#fff',
    emoji: '🏢',
    trackUrl: 'https://www.tpcindia.com/tracking',
  },
  gati: {
    id: 'gati',
    tcSlug: 'gati-courier',
    name: 'Gati',
    color: '#E65100',
    textColor: '#fff',
    emoji: '🚛',
    trackUrl: 'https://www.gati.com/track',
  },
  trackon: {
    id: 'trackon',
    tcSlug: 'trackon-courier',
    name: 'Trackon',
    color: '#006064',
    textColor: '#fff',
    emoji: '📡',
    trackUrl: 'https://www.trackoncourier.com/tracking',
  },
};


interface DetectionRule {
  courierId: string;
  pattern: RegExp;
}

const DETECTION_RULES: DetectionRule[] = [
  // UPS – starts with 1Z, 18 chars total
  { courierId: 'ups', pattern: /^1Z[A-Z0-9]{16}$/i },

  // FedEx – 12 or 15 digit numeric
  { courierId: 'fedex', pattern: /^\d{15}$/ },
  { courierId: 'fedex', pattern: /^\d{12}$/ },
  { courierId: 'fedex', pattern: /^\d{20}$/ },

  // DHL – 10 digit, or JD followed by 18 digits (DHL eCommerce)
  { courierId: 'dhl', pattern: /^\d{10}$/ },
  { courierId: 'dhl', pattern: /^JD\d{18}$/i },
  { courierId: 'dhl', pattern: /^GM\d{16}$/i },

  // USPS – 22 chars with specific prefix patterns
  { courierId: 'usps', pattern: /^9[2345]\d{20}$/ },
  { courierId: 'usps', pattern: /^[A-Z]{2}\d{9}US$/i },

  // Blue Dart – 11 digit numeric
  { courierId: 'bluedart', pattern: /^\d{11}$/ },

  // DTDC – Letter + 8–9 chars (e.g., Z12345678 or A123456789)
  { courierId: 'dtdc', pattern: /^[A-Z]\d{8,9}$/i },

  // Delhivery – 16 digit numeric, or starts with DL
  { courierId: 'delhivery', pattern: /^\d{16}$/ },
  { courierId: 'delhivery', pattern: /^DL\d{9,12}$/i },
  { courierId: 'delhivery', pattern: /^[0-9]{13}$/ },

  // Aramex – starts with 1 followed by 13 digits
  { courierId: 'aramex', pattern: /^1\d{13}$/ },
  { courierId: 'aramex', pattern: /^\d{5,10}$/ },

  // Ekart / Flipkart
  { courierId: 'ekart', pattern: /^FMPP\d{10,14}$/i },
  { courierId: 'ekart', pattern: /^MP[A-Z0-9]{8,12}$/i },

  // Ecom Express
  { courierId: 'ecomexpress', pattern: /^LS\d{12}$/i },
  { courierId: 'ecomexpress', pattern: /^ECOM\d{9,12}$/i },

  // XpressBees
  { courierId: 'xpressbees', pattern: /^XB\d{9,12}$/i },

  // Shadowfax
  { courierId: 'shadowfax', pattern: /^SF[0-9]{9,12}$/i },

  // Shiprocket
  { courierId: 'shiprocket', pattern: /^SR[0-9]{8,12}$/i },

  // India Post – 2 letters + 8 digits + 2 letters (registered post)
  { courierId: 'india_post', pattern: /^[A-Z]{2}\d{8}[A-Z]{2}$/i },
  { courierId: 'india_post', pattern: /^[A-Z]{2}\d{9}IN$/i },

  // Amazon Logistics
  { courierId: 'amazon_logistics', pattern: /^TBA\d{12,18}$/i },
];

export function detectCourier(trackingId: string): CourierInfo | null {
  const cleaned = trackingId.trim().toUpperCase();
  if (!cleaned || cleaned.length < 5) return null;

  for (const rule of DETECTION_RULES) {
    if (rule.pattern.test(cleaned)) {
      return COURIERS[rule.courierId] ?? null;
    }
  }

  return null;
}
