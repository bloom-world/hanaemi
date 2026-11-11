import { assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { getBytes, ref, uploadString } from 'firebase/storage'

import { initStorageTestEnv } from './helpers/emulator'

describe('storage.rules', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initStorageTestEnv()
  })

  afterEach(async () => {
    await testEnv.clearStorage()
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  it('許可していないパスは、ログインしていても読み書きできない', async () => {
    const storage = testEnv.authenticatedContext('user-1').storage()
    await assertFails(uploadString(ref(storage, 'anything/file.txt'), 'x'))
    await assertFails(getBytes(ref(storage, 'anything/file.txt')))
  })
})
