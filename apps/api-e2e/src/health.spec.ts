const FUNCTIONS_BASE = process.env['FUNCTIONS_BASE_URL'] ?? 'http://127.0.0.1:5001/demo-hanaemi/asia-northeast1'

describe('health', () => {
  it('ok を返す', async () => {
    const res = await fetch(`${FUNCTIONS_BASE}/health`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
