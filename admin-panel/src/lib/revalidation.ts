// Utility functions for triggering public site revalidation

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export async function revalidatePublicSite(paths: string[] = ['/'], tags: string[] = []) {
  if (!REVALIDATE_SECRET) {
    console.warn('REVALIDATE_SECRET not configured, skipping public site revalidation')
    return false
  }

  try {
    console.log('🔄 Triggering public site revalidation...', { paths, tags })
    
    const response = await fetch(`${PUBLIC_SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REVALIDATE_SECRET}`
      },
      body: JSON.stringify({
        paths,
        tags,
        type: 'shorts'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Public site revalidation failed:', response.status, errorText)
      return false
    }

    const result = await response.json()
    console.log('✅ Public site revalidation successful:', result)
    return true
  } catch (error) {
    console.error('❌ Public site revalidation error:', error)
    return false
  }
}

// export async function revalidateAfterStoryGeneration() {
//   // Revalidate pages that show shorts/stories
//   return await revalidatePublicSite(
//     ['/', '/shorts'], // Homepage and shorts page
//     ['shorts', 'stories'] // Cache tags
//   )
// }

// export async function revalidateAfterBlogGeneration() {
//   // Revalidate pages that show blog posts
//   return await revalidatePublicSite(
//     ['/', '/blog'], // Homepage and blog page
//     ['blog', 'posts'] // Cache tags
//   )
// }