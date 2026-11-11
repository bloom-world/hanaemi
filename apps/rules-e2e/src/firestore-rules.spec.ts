import { assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { initFirestoreTestEnv } from './helpers/emulator'

describe('firestore.rules', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initFirestoreTestEnv()
  })

  afterEach(async () => {
    await testEnv.clearFirestore()
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  it('許可していないパスは、ログインしていても読み書きできない', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore()
    await assertFails(getDoc(doc(db, 'anything/doc')))
    await assertFails(setDoc(doc(db, 'anything/doc'), { a: 1 }))
  })

  it('未ログインでは読み書きできない', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'anything/doc')))
  })
})
