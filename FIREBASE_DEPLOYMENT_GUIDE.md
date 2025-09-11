# Firebase Hosting デプロイメントガイド

## 🔧 GitHub Actions による自動デプロイ設定

### 1. Firebase サービスアカウントキー設定

#### Firebase Console での作業:
```
URL: https://console.firebase.google.com/project/hyouka-db/settings/serviceaccounts/adminsdk

手順:
1. 「新しい秘密鍵の生成」をクリック
2. 警告を確認して「キーを生成」をクリック
3. ダウンロードされたJSONファイルの全内容をコピー
```

#### GitHub Secrets での作業:
```
URL: https://github.com/CAREECONPlus/Evaluationsystem/settings/secrets/actions

手順:
1. 「New repository secret」をクリック
2. Name: FIREBASE_SERVICE_ACCOUNT_HYOUKA_DB
3. Secret: JSONファイルの全内容を貼り付け
4. 「Add secret」をクリック
```

### 2. Firebase Hosting 有効化確認

#### Firebase Console での確認:
```
URL: https://console.firebase.google.com/project/hyouka-db/hosting

確認事項:
- Hosting サービスが有効になっている
- ドメインが設定されている（hyouka-db.web.app）
```

### 3. デプロイメントの実行

設定完了後、以下のいずれかでデプロイが実行されます:

#### 自動デプロイ (GitHub Actions):
- main ブランチへのプッシュで自動実行
- 実行状況: https://github.com/CAREECONPlus/Evaluationsystem/actions
- 成功時: コミットにデプロイURL付きコメントが追加される

#### 手動デプロイ (バックアップ):
```bash
# ローカル環境で実行
./deploy.sh
```

### 4. デプロイ完了後の確認

#### アクセスURL:
- Primary: https://hyouka-db.web.app
- Alternative: https://hyouka-db.firebaseapp.com

#### 動作確認:
- [x] ページの正常表示
- [x] Firebase Authentication ログイン
- [x] CORS エラーの解消
- [x] PWA 機能の動作

### 5. トラブルシューティング

#### Site Not Found エラー:
- Firebase Hosting が有効か確認
- デプロイが完了しているか確認
- プロジェクトIDが正しいか確認 (hyouka-db)

#### GitHub Actions 失敗:
- Firebase サービスアカウントキーが正しく設定されているか確認
- JSON形式が正しいか確認
- プロジェクトIDが一致しているか確認

#### 認証エラー:
- Firebase Console で承認済みドメインを確認
- hyouka-db.web.app が追加されているか確認

## 🚀 デプロイメント状況

- [x] GitHub Actions ワークフロー設定完了
- [ ] Firebase サービスアカウントキー設定
- [ ] GitHub Secrets 設定
- [ ] 初回デプロイメント実行
- [ ] デプロイメント成功確認
- [ ] Firebase Hosting URL アクセス確認