import db from './firebase'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore'

export interface Short {
  id: string
  title: string
  bodyMd: string
  tags: string[]
  status: 'draft' | 'pending_review' | 'published'
  piiRiskScore: number
  sourceReportIds: string[]
  createdAt: string
  publishedAt?: string
  updatedAt: string
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

export class FirebaseShortsClient {
  // Get published shorts for public display
  static async getPublishedShorts(limitCount?: number): Promise<{ data: Short[] | null, error: any }> {
    try {
      let q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      if (limitCount) {
        q = query(q, firestoreLimit(limitCount))
      }

      const querySnapshot = await getDocs(q)
      let data = querySnapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          title: docData.title,
          bodyMd: docData.bodyMd,
          tags: docData.tags || [],
          status: docData.status,
          piiRiskScore: docData.piiRiskScore || 0,
          sourceReportIds: docData.sourceReportIds || [],
          createdAt: timestampToString(docData.createdAt),
          publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
          updatedAt: timestampToString(docData.updatedAt),
        } as Short
      })

      // shortsテーブルにデータがない場合、short_storiesテーブルから取得
      if (!data || data.length === 0) {
        console.log('No shorts data found, trying short_stories table')
        try {
          let storiesQuery = query(
            collection(db, 'short_stories'),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
          )

          if (limitCount) {
            storiesQuery = query(storiesQuery, firestoreLimit(limitCount))
          }

          const storiesSnapshot = await getDocs(storiesQuery)

          if (storiesSnapshot.docs.length > 0) {
            // short_storiesのデータをShortsの形式に変換
            const convertedData = storiesSnapshot.docs.map(doc => {
              const docData = doc.data()
              return {
                id: doc.id,
                title: docData.title,
                bodyMd: docData.content,
                tags: [docData.emotionalTone],
                status: 'published' as const,
                piiRiskScore: 0,
                sourceReportIds: [docData.sourceReportId],
                createdAt: timestampToString(docData.createdAt),
                publishedAt: timestampToString(docData.createdAt),
                updatedAt: timestampToString(docData.updatedAt || docData.createdAt),
              } as Short
            })

            console.log('Using short_stories data:', convertedData.length, 'items')
            return { data: convertedData, error: null }
          }
        } catch (storiesError) {
          console.error('Error fetching short stories:', storiesError)
        }

        // short_storiesもない場合、admin-generated shortsを取得
        try {
          const adminResponse = await fetch('/api/admin-shorts')
          if (adminResponse.ok) {
            const adminData = await adminResponse.json()
            if (adminData && adminData.length > 0) {
              console.log('Using admin-generated shorts:', adminData.length, 'items')
              return { data: adminData.slice(0, limitCount || adminData.length), error: null }
            }
          }
        } catch (adminError) {
          console.error('Error fetching admin shorts:', adminError)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching published shorts:', error)
      return { data: null, error }
    }
  }

  // Get latest published short (for homepage)
  static async getLatestShort(): Promise<{ data: Short | null, error: any }> {
    try {
      const q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(1)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return { data: null, error: { code: 'not-found', message: 'No published shorts found' } }
      }

      const doc = querySnapshot.docs[0]
      const docData = doc.data()

      const data = {
        id: doc.id,
        title: docData.title,
        bodyMd: docData.bodyMd,
        tags: docData.tags || [],
        status: docData.status,
        piiRiskScore: docData.piiRiskScore || 0,
        sourceReportIds: docData.sourceReportIds || [],
        createdAt: timestampToString(docData.createdAt),
        publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
        updatedAt: timestampToString(docData.updatedAt),
      } as Short

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching latest short:', error)
      return { data: null, error }
    }
  }

  // Search shorts by text or tags
  static async searchShorts(searchQuery: string): Promise<{ data: Short[] | null, error: any }> {
    try {
      // Firestoreは全文検索が弱いため、全データを取得してフィルタリング
      // 本番環境ではAlgoliaなどの外部検索サービス推奨
      const q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const searchTerm = searchQuery.toLowerCase()

      const data = querySnapshot.docs
        .map(doc => {
          const docData = doc.data()
          return {
            id: doc.id,
            title: docData.title,
            bodyMd: docData.bodyMd,
            tags: docData.tags || [],
            status: docData.status,
            piiRiskScore: docData.piiRiskScore || 0,
            sourceReportIds: docData.sourceReportIds || [],
            createdAt: timestampToString(docData.createdAt),
            publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
            updatedAt: timestampToString(docData.updatedAt),
          } as Short
        })
        .filter(short =>
          short.title.toLowerCase().includes(searchTerm) ||
          short.bodyMd.toLowerCase().includes(searchTerm)
        )

      return { data, error: null }
    } catch (error) {
      console.error('Service error searching shorts:', error)
      return { data: null, error }
    }
  }

  // Get shorts by tag
  static async getShortsByTag(tag: string): Promise<{ data: Short[] | null, error: any }> {
    try {
      const q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published'),
        where('tags', 'array-contains', tag),
        orderBy('publishedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          title: docData.title,
          bodyMd: docData.bodyMd,
          tags: docData.tags || [],
          status: docData.status,
          piiRiskScore: docData.piiRiskScore || 0,
          sourceReportIds: docData.sourceReportIds || [],
          createdAt: timestampToString(docData.createdAt),
          publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
          updatedAt: timestampToString(docData.updatedAt),
        } as Short
      })

      return { data, error: null }
    } catch (error) {
      console.error('Service error fetching shorts by tag:', error)
      return { data: null, error }
    }
  }

  // Get paginated shorts
  static async getPaginatedShorts(page: number = 1, pageSize: number = 10): Promise<{
    data: Short[] | null,
    error: any,
    totalCount: number,
    totalPages: number,
    currentPage: number
  }> {
    try {
      // Firestoreには直接的なページネーションカウント機能がないため、
      // 全データを取得してクライアント側でページネーション
      const q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const allData = querySnapshot.docs.map(doc => {
        const docData = doc.data()
        return {
          id: doc.id,
          title: docData.title,
          bodyMd: docData.bodyMd,
          tags: docData.tags || [],
          status: docData.status,
          piiRiskScore: docData.piiRiskScore || 0,
          sourceReportIds: docData.sourceReportIds || [],
          createdAt: timestampToString(docData.createdAt),
          publishedAt: docData.publishedAt ? timestampToString(docData.publishedAt) : undefined,
          updatedAt: timestampToString(docData.updatedAt),
        } as Short
      })

      const totalCount = allData.length
      const totalPages = Math.ceil(totalCount / pageSize)
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const data = allData.slice(start, end)

      return {
        data,
        error: null,
        totalCount,
        totalPages,
        currentPage: page
      }
    } catch (error) {
      console.error('Service error fetching paginated shorts:', error)
      return {
        data: null,
        error,
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  }

  // Get all unique tags from published shorts
  static async getTags(): Promise<{ data: string[] | null, error: any }> {
    try {
      const q = query(
        collection(db, 'shorts'),
        where('status', '==', 'published')
      )

      const querySnapshot = await getDocs(q)

      // Extract unique tags
      const allTags = querySnapshot.docs
        .flatMap(doc => doc.data().tags || [])
      const uniqueTags = Array.from(new Set(allTags)).sort()

      return { data: uniqueTags, error: null }
    } catch (error) {
      console.error('Service error fetching tags:', error)
      return { data: null, error }
    }
  }
}
