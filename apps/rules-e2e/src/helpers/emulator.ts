import { readFileSync } from 'fs'
import { resolve } from 'path'

import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'

const FIRESTORE_RULES_PATH = resolve(__dirname, '../../../rules/src/firestore/firestore.rules')
const STORAGE_RULES_PATH = resolve(__dirname, '../../../rules/src/storage/storage.rules')

const PROJECT_ID = 'demo-hanaemi-rules-e2e'

/**
 * emulator の場所（既定は firebase.json の port。環境変数があればそちらを使う）
 */
const emulatorAddress = (envName: string, defaultPort: number): { host: string; port: number } => {
  const [host, port] = (process.env[envName] ?? `127.0.0.1:${defaultPort}`).split(':')
  return { host: host || '127.0.0.1', port: Number(port) || defaultPort }
}

/** Firestore rules 用のテスト環境を初期化する */
export const initFirestoreTestEnv = async (): Promise<RulesTestEnvironment> =>
  initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(FIRESTORE_RULES_PATH, 'utf-8'),
      ...emulatorAddress('FIRESTORE_EMULATOR_HOST', 8080),
    },
  })

/** Storage rules 用のテスト環境を初期化する */
export const initStorageTestEnv = async (): Promise<RulesTestEnvironment> =>
  initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      rules: readFileSync(STORAGE_RULES_PATH, 'utf-8'),
      ...emulatorAddress('FIREBASE_STORAGE_EMULATOR_HOST', 9199),
    },
  })
