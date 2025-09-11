# Firebase Authentication CORS Issue - Workaround

## 問題
GitHub Pages (`careeconplus.github.io`) でFirebase Authenticationを使用する際、CORSエラーが発生します。

## 根本原因
Firebase Authentication APIは静的ホスティングサービスからの直接アクセスに対してCORS制限があります。

## 解決方法

### 推奨: Firebase Hosting使用
```bash
# Firebase CLI をインストール
npm install -g firebase-tools

# プロジェクトにログイン
firebase login

# プロジェクトを初期化
firebase init hosting

# デプロイ
firebase deploy --only hosting
```

### Firebase Hosting URL
- https://hyouka-db.web.app
- https://hyouka-db.firebaseapp.com

これらのURLでは自動的にCORS問題が解決されます。

### 設定済み承認済みドメイン
- localhost
- hyouka-db.firebaseapp.com ✓
- hyouka-db.web.app ✓  
- careeconplus.github.io (CORS制限あり)

## 現在の状況
GitHub PagesでのCORS問題は技術的制限のため、Firebase Hostingへの移行が必要です。