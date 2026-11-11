# 09. 技術選定の選択肢

Hanaemi の要件（[03_screens.md](03_screens.md)、[04_features.md](04_features.md)、[07_open-issues.md](07_open-issues.md)）から、層ごとの選択肢を並べる。**対象は iOS / Android の両方、インフラは Supabase** とする。Supabase 前提で決めることは [12 章](#12-supabase-前提で決めること) にまとめた。最終判断は、末尾の「決めるための前提」が揃ってから行う。

## 0. この製品で技術選定に効く要件

| 要件 | 技術的な影響 |
|---|---|
| 目覚ましアラーム（マナーモードでも鳴らす） | OS 固有の API が必要。クロスプラットフォームでもネイティブ実装が残る |
| ガイド音声・BGM はマナーモードでは鳴らさず、イヤホン時は鳴らす | iOS の AVAudioSession / Android の AudioFocus を細かく制御する必要がある |
| 瞑想（静止画＋音声）、ヨガ・ダンス（動画） | 動画配信（ストリーミングかダウンロード）、全画面再生、横画面 |
| トリニティ％、今日の状態、グラフ、カレンダー | 日次のログの集計。データはリレーショナル寄り |
| トレーナー 4 人とボイス | 音声素材が多い。時間別のボイスの組み合わせ |
| SNS ログイン（Google / Apple） | iOS で他社ログインを出すなら Sign in with Apple が必須 |
| 体重・体温・生理周期、Apple Watch / Fitbit 連携の案 | HealthKit / Health Connect との連携 |
| 課金（初期 WF に記載） | アプリ内課金。サブスクなら購読状態の管理 |
| コンテンツの追加・差し替え | 運営向けの管理画面（CMS） |

## 1. モバイルアプリ（クライアント）

| 選択肢 | 向いているケース | 長所 | 短所・注意 |
|---|---|---|---|
| **Flutter** | 少人数で両 OS を同時に出す | UI の再現性が高い（リング型グラフや独自 UI が描きやすい）。1 コードベース | アラーム・オーディオセッション・HealthKit はプラグインかネイティブコード頼み。Dart の人材 |
| **React Native（Expo）** | チームが TypeScript / Web に強い | Web 人材を活かせる。EAS Update で JS 部分を OTA 更新できる | アラームなど OS 固有の機能はネイティブモジュールを自作することになりやすい |
| **ネイティブ（Swift / Kotlin）** | アラームや音声の品質を最優先し、工数を許容できる | OS の機能を制約なく使える（AlarmKit / AlarmManager、HealthKit / Health Connect） | 両 OS で別々に実装するため工数がほぼ 2 倍。担当者も 2 系統必要 |
| **Kotlin Multiplatform（＋Compose Multiplatform）** | Android / Kotlin に強く、ロジックだけ共通化したい | ロジック共有と、ネイティブ UI を両立できる | 情報や人材がまだ少ない。iOS 側の UI は SwiftUI と併用が現実的 |

> **アラームの補足**: iOS は長く「アプリが閉じているときに、マナーモードを無視して鳴らす」手段がなかった。iOS 26 で追加された AlarmKit で可能になったが、対応 OS バージョンや UI の制約は実装前に検証が必要。Android は `AlarmManager` の正確なアラームと、権限（`SCHEDULE_EXACT_ALARM` など）の扱いを確認する。どの選択肢でも、ここはネイティブコードになる前提で見積もる。

## 2. バックエンド

**→ Supabase に決定。** 以下は比較のために残す。

| 選択肢 | 長所 | 短所・注意 |
|---|---|---|
| **Firebase**（Auth / Firestore / Storage / Functions） | 立ち上げが最速。認証、プッシュ、分析、クラッシュ収集まで揃う | Firestore はドキュメント型のため、日次ログの集計やグラフ用のクエリは設計の工夫が必要。ベンダーロックイン |
| **Supabase**（Postgres / Auth / Storage / Edge Functions） | SQL で集計しやすい。データモデル（[05_data-model.md](05_data-model.md)）をそのまま表にできる。行レベルのセキュリティ | Firebase よりプッシュや分析は別サービスで補う必要がある |
| **AWS**（Amplify、または Cognito＋API Gateway＋Lambda＋RDS） | 拡張性と細かい制御。社内に AWS の知見があれば有利 | 構築と運用の負荷が高い。小規模では過剰になりがち |
| **自前 API**（NestJS / Go / Rails など＋Cloud Run / ECS＋Postgres） | ロジック（トリニティ％の算出など）を自由に書ける。移行しやすい | 認証・インフラ・運用を自分たちで持つ |

**判断の軸**: トリニティ％や推奨ロジックを後から調整し続けるなら、計算はサーバー側（Functions / Edge Functions / API）に置き、アプリ更新なしで変えられるようにするのがよい。

## 3. 認証

| 選択肢 | メモ |
|---|---|
| Firebase Auth | メール、Google、Apple に対応。メール認証のリンク送信も標準である |
| Supabase Auth | 同上。Postgres のユーザーと直接結び付く |
| Amazon Cognito | AWS 構成なら。UI のカスタマイズはやや手間 |
| Auth0 / Clerk など | 高機能だが、ユーザー数に応じた費用がかかる |

- 付箋の「メール認証は実装が大変」は、上のいずれかを使えばほぼ解消する
- 初回リリースを SNS ログインのみにする案も選択肢になる

## 4. 動画・音声の配信

| 選択肢 | 長所 | 短所・注意 |
|---|---|---|
| **アプリに同梱** | 実装が最も簡単。オフラインで使える | アプリ容量が増える。差し替えにはアプリ更新が必要 |
| **ストレージ＋CDN**（Firebase Storage、S3＋CloudFront、Cloudflare R2 など） | 安い。MP4 をそのまま配信できる | 回線に応じた画質切り替えはない。視聴の計測は自前 |
| **動画配信サービス**（Mux、Cloudflare Stream など） | HLS への変換、画質の自動切り替え、視聴分析まで任せられる | 視聴時間に応じた従量課金 |
| **AWS MediaConvert＋CloudFront** | 細かく制御できる | 構築の手間 |

- 瞑想は「静止画＋音声」のため、音声ファイルの配信だけで済む
- 動画は 1 種目あたり 2 本程度（5 分 / 10 分）と少ない。初期はストレージ＋CDN か同梱でも足りる可能性が高い
- 早朝の利用が中心なので、事前ダウンロード（オフライン再生）を入れるかも検討する

## 5. コンテンツ管理（運営向け）

| 選択肢 | メモ |
|---|---|
| BaaS の管理画面を直接使う | 費用ゼロ。運営が非エンジニアだと危ない |
| ヘッドレス CMS（microCMS、Contentful、Sanity など） | セルフワーク、お知らせ、設問文の管理に向く。microCMS は日本語の UI と請求に対応 |
| 社内ツールの作成サービス（Retool など） | DB に直接つなぐ管理画面をすぐ作れる |
| 自作の管理画面 | 自由度は最大、工数も最大 |

## 6. 課金

| 選択肢 | メモ |
|---|---|
| **RevenueCat** | StoreKit と Google Play Billing をまとめて扱え、購読状態を一元管理できる。一定の売上を超えると手数料がかかる |
| StoreKit 2 / Play Billing を直接使う | 手数料なし。レシートの検証とサーバー通知の処理を自前で持つ |

- 課金をするかどうか自体が未決（[07_open-issues.md](07_open-issues.md) B-13）

## 7. 通知・ヘルスケア連携

- **通知**: アプリ内リマインドはローカル通知で足りる。運営からのお知らせは FCM（Firebase Cloud Messaging）か APNs を使う
- **ヘルスケア**: iOS は HealthKit、Android は Health Connect（Google Fit API は終了方向）。Fitbit は Web API で別途連携
- 生理周期データは特にセンシティブなため、扱う場合は保存先と同意の取り方を先に決める

## 8. 分析・品質

| 用途 | 選択肢 |
|---|---|
| 行動分析（継続率、セルフワーク完了率） | Firebase Analytics、Amplitude、Mixpanel |
| クラッシュ・エラー収集 | Firebase Crashlytics、Sentry |
| A/B テスト・設定値の切り替え | Firebase Remote Config など |

## 9. ビルド・配信

| クライアント | 選択肢 |
|---|---|
| Flutter | Codemagic、GitHub Actions＋fastlane。コードの OTA 更新は Shorebird |
| React Native | EAS Build / EAS Update |
| ネイティブ | Xcode Cloud、GitHub Actions＋fastlane |

## 10. 構成案（組み合わせ）

| 案 | 構成 | 向いているケース |
|---|---|---|
| **A. 速度重視** | Flutter＋Supabase（supabase_flutter）＋FCM＋RevenueCat＋Sentry | UI の統一感とリリース速度を優先する |
| **B. TypeScript 統一** | React Native（Expo）＋Supabase（supabase-js）＋Expo Push / FCM＋RevenueCat＋Sentry | React で管理画面などの Web も本格的に作る |
| **C. ネイティブ個別実装** | Swift（SwiftUI）＋Kotlin（Jetpack Compose）＋Supabase（supabase-swift / supabase-kt）＋FCM＋RevenueCat＋Sentry | OS 固有機能の品質を優先する。ユーザー向けの Web がない、または管理画面が小さい |

どの案でも、アラームとオーディオセッションの部分はネイティブコードになる。A と B を選ぶ場合も、最初にこの部分の技術検証（スパイク）を行うことを勧める。

### 構成案の比較

|  | 案 A: Flutter | 案 B: React Native | 案 C: Swift / Kotlin |
|---|---|---|---|
| **考え方** | 1 つのコードベースで UI とロジックを両 OS 共通にする | Web・アプリ・Edge Functions を TypeScript に統一する | 各 OS を公式の言語・UI フレームワークで個別に実装する |
| **強み** | 同じ画面を一度で作れ、両 OS の差分が生まれにくい。リング型グラフなど独自 UI を描きやすい。ホットリロードで反復が速い | 型・入力チェック・API 呼び出しを Web と共有できる。EAS Update で OTA 更新。Web の人材を活かせる | OS 固有機能を制約なく使え、ブリッジ層がない。単一言語・単一ツールチェーンのため AI の出力も安定しやすい。OS の新機能にすぐ対応できる |
| **品質を保つ仕組み** | ネイティブ機能（アラーム・音声・ヘルスケア）はプラグイン / Platform Channel に分離し、境界のインターフェースを先に決める。使うプラグインの保守状況を選定時に確認する | ネイティブ機能は Expo Modules（Swift / Kotlin）に切り出し、境界を明確にする。Web と共有するコードは monorepo のパッケージにまとめる | 1 つの Issue / PR で両 OS を対応し、PR テンプレートに iOS / Android のチェック欄を置く。デザイントークンを 1 か所で定義して両 OS 向けに書き出す |
| **残るコスト** | ネイティブ部分は Dart＋Swift＋Kotlin の 3 言語になる。ブリッジ部分の不具合は追いにくい。OS の新機能はプラグインの対応待ちになりうる | ネイティブ部分は TypeScript＋Swift＋Kotlin の 3 言語になる。React Native / Expo のバージョン追従。ブリッジ部分の不具合は追いにくい | 実装・レビュー・実機確認・CI・ストア申請が 2 系統。片方だけ直す反映漏れのリスクがある。アプリ側に共有ロジックが大きく残るなら Kotlin Multiplatform を検討 |
| **向いている条件** | UI の統一感とリリース速度を優先する。Dart に抵抗がない | React で管理画面などの Web も本格的に作る | OS 固有機能の品質を優先する。ユーザー向けの Web がない、または管理画面が小さい |

### どの案でも共通の前提

- **AI 駆動開発での見え方**: AI がコードを書く前提では「書く量」の差は縮まり、レビュー・実機確認の量と、構成の分かりやすさ（境界の少なさ）の重みが増す。この観点で 3 案を比べる
- **ロジックは Supabase に寄せる**: トリニティ％や継続日数の計算は Postgres 関数 / Edge Functions に置き、アプリは表示に徹する
- **仕様の正本を 1 つにする**: `docs/` の画面仕様と DB から生成した型を実装の参照元にする
- **E2E テスト**: Maestro など両 OS で同じシナリオを流せるツールで、OS 間の挙動差を検出する
- **選び方の目安**: Web（管理画面）の規模が大きい → B、OS 固有機能の品質を優先 → C、UI の統一とリリース速度を優先 → A。現時点のボードにユーザー向け Web の記載はない

## 11. 決めるための前提（要回答）

| 前提 | 選定への影響 |
|---|---|
| チームの得意技術と人数 | Flutter / React Native / ネイティブの選択（ネイティブなら iOS と Android の担当が別に必要） |
| 初回リリースの範囲と時期 | アラーム、課金、ヘルスケア連携を初回に入れるか |
| アラームは必須か | ネイティブ実装の比重。iOS / Android それぞれの最低対応バージョン |
| コンテンツの更新頻度と運営体制 | 同梱か配信か、CMS の要否 |
| 課金の有無と形式 | RevenueCat か直接実装か |
| 月額の予算 | Supabase のプランとアドオン（PITR など）、動画配信サービスの費用を許容できるか |
| 既存の契約・資産（既存のリポジトリ、使っている SaaS） | 周辺サービス（メール送信、分析、監視）の選択 |

## 12. Supabase 前提で決めること

| 分類 | 項目 | 決めること・選択肢 |
|---|---|---|
| 運用 | プランとリージョン | Free プランは一定期間アクセスがないと停止する。本番は Pro 以上。リージョンは東京（ap-northeast-1）。コンピュートのサイズ |
| 運用 | 環境の分け方 | dev / stg / prod を別プロジェクトにするか、Supabase Branching（PR ごとのプレビュー環境）を使うか |
| 運用 | バックアップ | 日次バックアップで足りるか、PITR（任意時点への復元、有料アドオン）を付けるか。健康データを扱うので PITR 推奨 |
| 開発 | マイグレーション管理 | Supabase CLI のマイグレーションで SQL を Git 管理する。Studio（管理画面）で直接スキーマを変えない運用ルール |
| 開発 | ローカル開発 | Supabase CLI（Docker）でローカルに同じ構成を立てる。シードデータの用意 |
| 開発 | 型の生成 | `supabase gen types` で DB の型を生成する（TypeScript など）。Flutter / ネイティブは型生成の手段を別途選ぶ |
| 開発 | クライアント SDK | Flutter: supabase_flutter / RN: supabase-js（セッション保存先に SecureStore など） / ネイティブ: supabase-swift・supabase-kt |
| DB | スキーマ設計 | 05 のデータモデルを Postgres の表に落とす。ユーザー別データは `auth.users` の ID を外部キーにする |
| DB | RLS（行レベルセキュリティ） | 全テーブルで RLS を有効化し、「本人の行だけ読み書き可」のポリシーを書く。マスタ（設問、セルフワーク）は全員読み取りのみ。RLS のテスト方法（pgTAP など） |
| DB | 日付とタイムゾーン | `timestamptz` で保存し、ユーザーのタイムゾーンを持つ。「今日」の境界（0 時か起床時刻か）を決める（B-5） |
| DB | 集計の持ち方 | グラフ・継続日数・トリニティ％を、都度 SQL で計算するか、日次サマリー表やマテリアライズドビューに持つか |
| ロジック | ロジックの置き場所 | ① Postgres 関数（RPC）・トリガー ② Edge Functions（Deno / TypeScript） ③ 別の API サーバー。トリニティ％の算出はサーバー側に置き、アプリ更新なしで調整できるようにする |
| ロジック | 定期実行 | Supabase Cron（pg_cron）で、曇りアラートの判定、日次集計、退会者データの削除などを回す |
| ロジック | Webhook の受け口 | RevenueCat、ストアのサーバー通知などを Edge Functions で受ける。署名の検証 |
| 認証 | ログイン方式 | Google / Apple はネイティブの SDK でトークンを取り、`signInWithIdToken` で Supabase に渡すのが UX 上よい。Web 画面経由の OAuth にするか |
| 認証 | メール送信（SMTP） | 標準のメール送信は送信数の制限が厳しく本番向きではない。Resend、SendGrid、Amazon SES などの SMTP を設定する。メール文面の日本語化 |
| 認証 | ディープリンク | メール認証・パスワード再設定のリンクからアプリに戻す URL スキーム / Universal Links / App Links とリダイレクト URL の許可設定 |
| 認証 | 退会（アカウント削除） | App Store はアプリ内からの削除を求める。`auth.users` の削除は秘密鍵が必要なので Edge Function 経由。関連テーブルは `ON DELETE CASCADE`、Storage のファイルも削除する |
| 認証 | キーの扱い | アプリに入れるのは公開用のキー（publishable / 旧 anon）だけ。秘密鍵（secret / 旧 service_role）は Edge Functions とサーバーにのみ置く |
| Storage | バケット設計 | セルフワークの素材（全員読める・公開バケットか署名付き URL か）と、ユーザーのファイル（本人のみ）を分ける。Storage にも RLS |
| Storage | 動画を Supabase Storage に置くか | プランごとのファイルサイズ上限と、転送量（egress）の課金を確認する。動画が増えるなら Cloudflare R2 / Stream や Mux に分ける |
| 通知 | プッシュ通知 | Supabase に標準のプッシュはない。FCM（iOS も APNs 経由で送れる）を直接使うか、OneSignal / Expo Push を使う。端末トークンの表と、送信用の Edge Function |
| 課金 | 購読状態の保持 | RevenueCat の Webhook で購読状態の表を更新し、有料コンテンツの RLS や判定に使う |
| オフライン | オフライン対応 | Supabase にはオフライン同期がない。早朝・電波の弱い場所でも記録させるなら、端末側の DB（SQLite / drift / WatermelonDB）や PowerSync を検討 |
| 運用 | 監視・ログ | Supabase のログとレポートに加え、Sentry などでアプリとEdge Functions のエラーを集める |
| 運用 | 管理画面 | Studio を運営に開放するのは危ない。運営用の権限（ロール）と、microCMS / Retool / 自作の管理画面のどれにするか |
| データ | 機微情報の保護 | 体重・体温・生理周期を扱う。保存時暗号化は標準。列単位の暗号化（Vault など）や、閲覧ログが必要か |

- Supabase の仕様（プランの上限、キーの名称、機能の提供状況）は変わりやすい。決定前に公式ドキュメントで確認する
- 最初に固めると後が楽なのは「環境の分け方」「マイグレーション管理」「RLS の方針」「ロジックの置き場所」の 4 つ
