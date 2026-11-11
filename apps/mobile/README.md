# mobile

hanaemi の Flutter アプリ（iOS / iPad / Android）。

## まだ未作成

Flutter の SDK を入れたあと、このフォルダで Flutter プロジェクトを作る。

```sh
# Flutter の版を .mise.toml に固定してから
flutter create --org <Bundle ID の接頭辞> --project-name hanaemi --platforms ios,android .
```

- フレーバーは dev / stg / prod（docs/setup-guide.html の Bundle ID と揃える）
- Firestore のモデルは `lib/gen/contracts/` に生成する予定（firebase-contract の dart generator。
  https://github.com/cilly-yllic/my-packages/issues/32）
