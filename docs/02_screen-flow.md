# 02. 画面遷移

## 2.1 最新フロー（UI画面整理（開発向け））

ボードのコネクタ（矢印）の接続関係から起こした遷移図。

```mermaid
flowchart TD
    Start([アプリ起動<br/>オープニングサウンド]) --> Entry[ログイン / 新規登録]

    %% ログイン
    Entry --> Login[ログイン<br/>①ID・パスワード ②SNS連携<br/>※ログイン済みならスキップ]
    Login --> LoginSNS[外部連携<br/>Google / Apple]
    Login --> Today
    LoginSNS --> Today

    %% 新規登録
    Entry --> Signup[新規登録<br/>①メール・パスワード ②SNS連携<br/>利用規約・プライバシーポリシーに同意]
    Signup -.-> Terms[利用規約]
    Signup -.-> Privacy[プライバシーポリシー]
    Signup --> SignupSNS[外部連携<br/>Google / Apple]
    Signup --> Basic1
    SignupSNS --> Basic1[基本情報入力1<br/>姓名]
    Basic1 --> Basic2[基本情報2<br/>性別・生年月日・居住エリア・職種]
    Basic2 --> Basic3[基本情報3<br/>起床時間・就寝時間・オフ時間帯]
    Basic3 --> PreReg[アカウント仮登録完了]
    PreReg -.-> Mail[[認証メール送信]]
    PreReg --> Verified[アカウント認証完了<br/>スタートボタン]

    %% 初期設定
    Verified --> Trainer[トレーナー選択<br/>フローラ / サクヤ / サザンカ / ロータス]
    Trainer --> TrainerDetail[トレーナー詳細説明<br/>声優ボイス・サウンド]
    TrainerDetail --> TriIntro
    Trainer --> TriIntro[トリニティ設問説明<br/>体・心・精神]
    TriIntro --> TriQ1[トリニティ設問① 体]
    TriQ1 --> TriQ2[トリニティ設問② 心]
    TriQ2 --> TriQ3[トリニティ設問③ 精神]
    TriQ3 --> TriLoading[トリニティ判定中<br/>Loading...]
    TriLoading --> TriResult[トリニティ判定完了<br/>結果表示]
    TriResult --> Today[今日の状態設問<br/>1日1回、晴れ・曇り・雨・雷]

    %% ホーム
    Today --> Home{{ホーム画面}}
    Home --> VitalInput[体重・体温入力<br/>1日に複数回の入力・保存が可能]
    Home --> TriRetry[トリニティ<br/>何度でも設問をやり直せる]
    TriRetry --> TriIntro
    Home --> Recommend[おすすめセルフワーク]

    %% タブ
    Home -->|タブ| SW[セルフワーク一覧<br/>瞑想・ヨガ・ジャーナリング…]
    Home -->|タブ| Graph[グラフ<br/>体重・体温・セルフワーク<br/>日/週/月/年]
    Home -->|タブ| Account[アカウント設定]

    %% セルフワーク
    Recommend --> CourseSetting
    SW --> CourseSetting[コース設定<br/>瞑想 / ヨガ / ワークアウト<br/>3分・5分・10分]
    CourseSetting --> Guide[トレーナーのスタートガイド<br/>「目を閉じて！準備はいい？」→「よーい、スタート」]
    Guide --> Play[コース再生<br/>瞑想=音声 / ヨガ・ワークアウト=動画]
    Play --> Rating[コース終了<br/>5つ星で評価（スキップ可）]
    Rating --> Badge[達成・バッジ獲得]
    Badge --> Report[レポート<br/>トレーニング時間・継続日数・トリニティ状態]
    Report --> Weekly[鍛えた曜日の記録<br/>月〜日にチェック]
    Weekly -->|もっと探索する| SW
    Play -->|左上の×| QuitDialog[終了する前に<br/>別のコーチ/プログラムに変えますか]
```

- ボード上では「アカウント認証完了 → トレーナー選択 → トリニティ設問説明」の後ろに、デザインカンプとして「回答説明（体）」「回答説明（心・精神）」「今日の状態へのつなぎ設問」が挟まっている（[03_screens.md](03_screens.md) 参照）
- 「今日の状態設問」は、**翌日 0 時を過ぎてから初めてアプリを起動したとき**に表示する（付箋より）

![オンボーディングのフロー](images/11_dev-flow-onboarding.jpg)
![ホームとセルフワークのフロー](images/12_dev-flow-home-selfwork.jpg)

## 2.2 ボトムタブ

最新カンプのタブは次の 4 つ。

| タブ | 遷移先 |
|---|---|
| ホーム | ホーム画面 |
| ダッシュボード（＝グラフ） | グラフ画面 |
| セルフワーク | セルフワーク一覧 |
| アカウント | 設定画面 |

> ワイヤーフレームではタブ名が「ダッシュボード」と「グラフ」の 2 通りある。フロー図では「グラフ」、カンプのタブラベルでは「ダッシュボード」になっている（[07_open-issues.md](07_open-issues.md)）。

## 2.3 アカウント設定配下

```mermaid
flowchart LR
    Settings[設定] --> Info[アカウント情報<br/>編集・確定/キャンセル] --> InfoDone[設定完了<br/>ホームに戻る]
    Info --> PW[パスワード再設定<br/>旧・新・新確認] --> PWConfirm[確認画面<br/>確定/キャンセル] --> PWDone[再設定完了<br/>ホームに戻る]
    Info --> Withdraw[退会確認<br/>注意事項] --> WithdrawDone[退会完了]
    Settings --> Alarm[アラーム]
    Settings --> Notice[アプリ内通知]
    Settings --> Chara[キャラクター]
    Settings --> News[お知らせ一覧]
    Settings --> Terms[利用規約]
    Settings --> Privacy[プライバシーポリシー]
    Settings --> Logout[ログアウト]
```

![アカウント設定まわり](images/16_dev-account-settings.jpg)

## 2.4 初期案の画面遷移フロー（参考）

ボード左上の「画面遷移フロー」フレーム。

```
ログイン前の画面（新規登録 / ログイン）→ 新規アカウント作成 → キャラクター選択 → キャラクター選択
→ マインドフルネス判定（簡易設問回答）→ 判定結果（おすすめのセルフワークを提示）
→ トップページ（おすすめセルフワーク）→ 選択したセルフワークの画面
→ セルフワーク完了（達成した円グラフを再度表示）→ アプリのトップページ
```

![初期の画面遷移フロー](images/01_screen-flow-early.jpg)

## 2.5 初期のサイトマップ（マインドマップ）

```
ログイン画面
└ 初期登録者？
   ├ Yes → キャラクター選択 → トリニティ状態を診断する初回24設問画面（BGMあり）→ 最低1つを答える → ホーム画面
   └ No ─────────────────────────────────────────────→ ホーム画面
ホーム画面（オリジナル曲を流す）
├ 「今日の状態」を計る（BGMあり）→ 体重・体温を記入する（BGMあり）→ おすすめのセルフワークを選択
│     ├ 瞑想 ─ インストラクター（声優）
│     ├ ヨガ ─ 映像に合わせて行う（ヨガのインストラクター）
│     └ ジャーナリング ─ インストラクター（声優）
├ ダッシュボード
├ セルフワーク（オリジナル曲を流す）
└ アカウント ─ アラーム設定
      ├ ON → （声優）"おはよう" → スヌーズ → "早く起きよう！"（声優）
      └ OFF
```

![サイトマップ](images/02_sitemap-mindmap-overview.jpg)
