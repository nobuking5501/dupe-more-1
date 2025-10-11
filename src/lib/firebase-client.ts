import db from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'

// 型定義
export interface DailyReport {
  id: string
  staffId?: string
  staffName: string
  reportDate: string
  weatherTemperature?: string
  customerAttributes?: string
  visitReasonPurpose?: string
  treatmentDetails?: string
  customerBeforeTreatment?: string
  customerAfterTreatment?: string
  salonAtmosphere?: string
  insightsInnovations?: string
  kanaePersonalThoughts?: string
  createdAt: string
  updatedAt: string
}

export interface MonthlyMessage {
  id: string
  yearMonth: string
  message: string
  generatedAt: string
  sourceReportsCount: number
  isArchived: boolean
}

export interface BlogPost {
  id: string
  title: string
  content: string
  slug?: string
  weekStartDate?: string
  weekEndDate?: string
  sourceReportsCount: number
  status: 'draft' | 'published'
  authorName: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OwnerMessage {
  id: string
  yearMonth: string
  title: string
  bodyMd: string
  highlights: string[]
  sources: string[]
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// Firestore Timestamp → ISO string 変換ヘルパー
function timestampToString(timestamp: any): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  return timestamp || new Date().toISOString()
}

export class FirebaseService {
  // Get published owner messages for public site
  static async getPublishedOwnerMessages(): Promise<{ data: OwnerMessage[] | null, error: any }> {
    try {
      const q = query(
        collection(db, 'owner_messages'),
        where('status', '==', 'published'),
        orderBy('yearMonth', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          yearMonth: docData.yearMonth,
          title: docData.title,
          bodyMd: docData.bodyMd,
          highlights: docData.highlights || [],
          sources: docData.sources || [],
          status: docData.status,
          createdAt: timestampToString(docData.createdAt),
          updatedAt: timestampToString(docData.updatedAt),
          publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
        } as OwnerMessage
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching owner messages:', error)
      return { data: null, error }
    }
  }

  // Get specific owner message by year-month
  static async getOwnerMessage(yearMonth: string): Promise<{ data: OwnerMessage | null, error: any }> {
    try {
      const q = query(
        collection(db, 'owner_messages'),
        where('yearMonth', '==', yearMonth),
        where('status', '==', 'published'),
        limit(1)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return { data: null, error: { code: 'not-found', message: 'Document not found' } }
      }

      const doc = querySnapshot.docs[0]
      const docData = doc.data()

      const data = {
        id: doc.id,
        yearMonth: docData.yearMonth,
        title: docData.title,
        bodyMd: docData.bodyMd,
        highlights: docData.highlights || [],
        sources: docData.sources || [],
        status: docData.status,
        createdAt: timestampToString(docData.createdAt),
        updatedAt: timestampToString(docData.updatedAt),
        publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
      } as OwnerMessage

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching owner message:', error)
      return { data: null, error }
    }
  }

  // Get blog posts (updated for new schema)
  static async getBlogPosts(status: 'published' | 'draft' = 'published'): Promise<{ data: any[] | null, error: any }> {
    try {
      let q = query(
        collection(db, 'blog_posts'),
        orderBy('createdAt', 'desc')
      )

      if (status === 'published') {
        q = query(
          collection(db, 'blog_posts'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        )
      }

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          title: docData.title,
          content: docData.content,
          slug: docData.slug,
          weekStartDate: docData.weekStartDate,
          weekEndDate: docData.weekEndDate,
          sourceReportsCount: docData.sourceReportsCount || 0,
          status: docData.status,
          authorName: docData.authorName || 'かなえ',
          publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : null,
          createdAt: timestampToString(docData.createdAt),
          updatedAt: timestampToString(docData.updatedAt),
          published: docData.status === 'published',
          staff: { name: docData.authorName || 'かなえ' },
        }
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return { data: null, error }
    }
  }

  // Get specific blog post by ID
  static async getBlogPost(id: string): Promise<{ data: any | null, error: any }> {
    try {
      const docRef = doc(db, 'blog_posts', id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return { data: null, error: { code: 'not-found', message: 'Document not found' } }
      }

      const docData = docSnap.data()

      // 公開済みのみ返す
      if (docData.status !== 'published') {
        return { data: null, error: { code: 'not-published', message: 'Document not published' } }
      }

      const data = {
        id: docSnap.id,
        title: docData.title,
        content: docData.content,
        slug: docData.slug,
        weekStartDate: docData.weekStartDate,
        weekEndDate: docData.weekEndDate,
        sourceReportsCount: docData.sourceReportsCount || 0,
        status: docData.status,
        authorName: docData.authorName || 'かなえ',
        publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : null,
        createdAt: timestampToString(docData.createdAt),
        updatedAt: timestampToString(docData.updatedAt),
        published: docData.status === 'published',
        staff: { name: docData.authorName || 'かなえ' },
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return { data: null, error }
    }
  }

  // Get specific blog post by slug
  static async getBlogPostBySlug(slug: string): Promise<{ data: any | null, error: any }> {
    try {
      console.log('Fetching blog post by slug:', slug)

      const q = query(
        collection(db, 'blog_posts'),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
      )

      const querySnapshot = await getDocs(q)

      console.log('Blog post query result:', { empty: querySnapshot.empty })

      if (querySnapshot.empty) {
        return { data: null, error: { code: 'not-found', message: 'Document not found' } }
      }

      const docSnap = querySnapshot.docs[0]
      const docData = docSnap.data()

      const data = {
        id: docSnap.id,
        title: docData.title,
        content: docData.content,
        slug: docData.slug,
        weekStartDate: docData.weekStartDate,
        weekEndDate: docData.weekEndDate,
        sourceReportsCount: docData.sourceReportsCount || 0,
        status: docData.status,
        authorName: docData.authorName || 'かなえ',
        publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : timestampToString(docData.createdAt),
        createdAt: timestampToString(docData.createdAt),
        updatedAt: timestampToString(docData.updatedAt),
        published: docData.status === 'published',
        published_at: docData.publishedAt ? timestampToString(docData.publishedAt) : timestampToString(docData.createdAt),
        staff: { name: docData.authorName || 'かなえ' },
      }

      console.log('Formatted blog post data:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Service error:', error)
      return { data: null, error }
    }
  }
}
