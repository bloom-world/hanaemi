# hanaemi monorepo

Flutter（iOS / iPad / Android）+ Firebase + React（管理画面）の Nx monorepo。構成は cmonoth に合わせている。

```
apps/
├── api/          Cloud Functions（webpack → dist/apps/api）
├── api-e2e/      Functions を emulator 上でテスト
├── rules/        firestore.rules / firestore.indexes.json / storage.rules + contract.yml
├── rules-e2e/    ルールのテスト（@firebase/rules-unit-testing）
├── mobile/       Flutter（未作成。apps/mobile/README.md）
└── web-admin/    React 管理画面（Vite → Firebase Hosting）
libs/
├── contracts/    contract.yml から生成した型（pnpm generate:contracts）
├── utils/        api・web で共有する処理
└── ui/           web 用 UI
docs/             企画・実装ノート・開発準備ガイド・アーキテクチャ図
```

## セットアップ

```sh
mise install     # node / pnpm / java（.mise.toml で固定）
pnpm install
```

## よく使うコマンド

```sh
pnpm nx run-many -t build lint test typecheck --exclude=mobile
pnpm nx run-many -t e2e --parallel=1   # emulator を立てて rules / Functions をテスト（firebase.e2e.json の port）
pnpm generate:contracts                # contract.yml → libs/contracts
pnpm emulator                          # 開発用の emulator（firebase.json の port）
```
