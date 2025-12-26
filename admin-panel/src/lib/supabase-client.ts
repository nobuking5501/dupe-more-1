/**
 * Legacy Supabase Client (Deprecated)
 *
 * このファイルは後方互換性のために残されています。
 * 新しいコードではFirebaseクライアントを使用してください。
 *
 * @deprecated Use firebase-client.ts instead
 */

// ダミーエクスポート - ビルドエラー回避のため
export function createClient() {
  throw new Error(
    'Supabase client is deprecated. Please use Firebase client instead. ' +
    'Import from @/lib/firebase-client or @/lib/firebase'
  )
}

export default {
  createClient
}
