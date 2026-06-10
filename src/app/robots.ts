import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'http://localhost:3000'; // Sesuaikan jika dalam production

  return {
    rules: {
      userAgent: '*',
      allow: ['/landing', '/auth/login', '/map'],
      disallow: ['/admin/', '/profile/', '/api/', '/auth/staff/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
