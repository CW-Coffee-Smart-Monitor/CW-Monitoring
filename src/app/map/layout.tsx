import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CW-SmartMonitor | Peta Interaktif & Live Seat Map',
  description: 'Buka peta interaktif kami untuk melihat ketersediaan meja secara real-time dan pesan meja terdekat dengan fasilitas favorit Anda di CW Coffee Malang.',
  openGraph: {
    title: 'CW-SmartMonitor | Peta Interaktif & Live Seat Map',
    description: 'Buka peta interaktif kami untuk melihat ketersediaan meja secara real-time dan pesan meja terdekat dengan fasilitas favorit Anda di CW Coffee Malang.',
    url: '/map',
  },
};

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
