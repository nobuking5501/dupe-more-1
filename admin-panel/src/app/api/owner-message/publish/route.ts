import { NextRequest, NextResponse } from 'next/server'

/**
 * Owner Message Publish API (Deprecated)
 *
 * この機能は廃止されました。
 * このファイルはVercelのビルドキャッシュ対応のため残されています。
 *
 * @deprecated This feature has been removed
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'この機能は廃止されました。Owner Message機能は削除されています。',
      deprecated: true
    },
    { status: 410 } // 410 Gone
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'この機能は廃止されました。Owner Message機能は削除されています。',
      deprecated: true
    },
    { status: 410 }
  )
}
