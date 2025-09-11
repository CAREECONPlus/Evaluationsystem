# Firebase Hosting 自動デプロイ設定

## 設定完了チェックリスト

### ✅ 完了済み
- [x] Firebase CLI インストール
- [x] firebase.json 設定
- [x] .firebaserc 設定
- [x] GitHub Actions ワークフロー作成

### 🔄 要設定
- [ ] Firebase サービスアカウントキー生成
- [ ] GitHub Secrets 設定

## Firebase サービスアカウントキー設定手順

### 1. Firebase Console でキー生成
```
URL: https://console.firebase.google.com/project/hyouka-db/settings/serviceaccounts/adminsdk
手順: 「新しい秘密鍵の生成」→ JSONファイルをダウンロード
```

### 2. GitHub Secrets 設定
```
URL: https://github.com/CAREECONPlus/Evaluationsystem/settings/secrets/actions
手順: 
1. "New repository secret" クリック
2. Name: FIREBASE_SERVICE_ACCOUNT_HYOUKA_DB
3. Secret: JSONファイルの全内容を貼り付け
4. "Add secret" クリック
```

## 設定完了後

GitHub Actions が設定されると、main ブランチへのプッシュで自動的に以下が実行されます：

1. Firebase Hosting へのデプロイ
2. デプロイURLの通知コメント
3. CORS問題の完全解決

## アクセスURL

設定完了後、以下のURLでアクセス可能：
- https://hyouka-db.web.app
- https://hyouka-db.firebaseapp.com

## 注意事項

- GitHub Secrets設定後、次回プッシュで自動デプロイが開始されます
- デプロイには2-3分かかります
- Firebase認証のCORS問題が完全に解決されます

## デプロイ状況

🔄 **Firebase Hosting への移行準備完了**
⏰ **更新日時**: $(date)