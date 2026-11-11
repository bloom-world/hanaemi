import { setGlobalOptions } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

// Firestore・Functions のリージョンは asia-northeast1（setup-guide 06 章で決めた値）
setGlobalOptions({ region: 'asia-northeast1' })

/** 疎通確認用。エンドポイントが増えたら消す */
export const health = onRequest((_req, res) => {
  res.json({ ok: true })
})
