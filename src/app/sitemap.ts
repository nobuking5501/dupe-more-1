import { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebaseAdmin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dupe-and-more.com'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/concept`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/owner-message`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shorts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
  ]

  // Dynamic shorts pages - get latest shorts from Firebase
  let shortPages: MetadataRoute.Sitemap = []

  try {
    const storiesSnapshot = await adminDb
      .collection('short_stories')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    if (!storiesSnapshot.empty) {
      shortPages = storiesSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          url: `${baseUrl}/shorts#${doc.id}`,
          lastModified: data.createdAt?.toDate() || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }
      })
    }
  } catch (error) {
    console.error('Error generating shorts sitemap entries:', error)
    // Continue with static pages even if shorts fails
  }

  return [...staticPages, ...shortPages]
}