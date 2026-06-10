import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CW-SmartMonitor | Productivity Meets Vision',
  description: 'Jangan biarkan drama "meja penuh tapi kosong" mengganggu fokusmu. Cek ketersediaan meja real-time di CW Coffee Malang.',
  openGraph: {
    title: 'CW-SmartMonitor | Productivity Meets Vision',
    description: 'Jangan biarkan drama "meja penuh tapi kosong" mengganggu fokusmu. Cek ketersediaan meja real-time di CW Coffee Malang.',
    url: '/landing',
    siteName: 'CW-SmartMonitor',
    images: [
      {
        url: '/CWClub.png',
        width: 800,
        height: 600,
        alt: 'CW Coffee Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD untuk data terstruktur Google (LocalBusiness/CoffeeShop)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CoffeeShop',
    'name': 'CW Coffee Malang',
    'image': 'http://localhost:3000/CW.jpg',
    '@id': 'http://localhost:3000/landing',
    'url': 'http://localhost:3000/landing',
    'telephone': '+62341123456',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Jl. Jakarta No. 10',
      'addressLocality': 'Malang',
      'addressRegion': 'Jawa Timur',
      'postalCode': '65113',
      'addressCountry': 'ID',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': -7.978467,
      'longitude': 112.637848,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      'opens': '08:00',
      'closes': '23:00',
    },
    'sameAs': [
      'https://www.instagram.com/cwcoffee.id',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
