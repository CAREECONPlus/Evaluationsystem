# デプロイメントガイド

## 環境変数設定（セキュリティ向上）

### 問題の概要
以前のバージョンでは、Firebase APIキーがソースコードにハードコードされていましたが、これはセキュリティリスクでした。新しいバージョンでは環境変数システムを導入してセキュリティを向上させました。

### 新しい環境変数システム

#### 開発環境
開発環境では従来通り動作しますが、`env.js`の一時的な設定を使用しています。

#### 本番環境の設定方法

##### 方法1: メタタグ設定（推奨）
`index.html`のheadセクションに以下を追加：

```html
<meta name="firebase-api-key" content="your_firebase_api_key">
<meta name="firebase-auth-domain" content="your_project_id.firebaseapp.com">
<meta name="firebase-project-id" content="your_project_id">
<meta name="firebase-storage-bucket" content="your_project_id.appspot.com">
<meta name="firebase-messaging-sender-id" content="your_messaging_sender_id">
<meta name="firebase-app-id" content="your_app_id">
```

##### 方法2: 設定JSONファイル
`public/.well-known/config.json`ファイルを作成：

```json
{
  "FIREBASE_API_KEY": "your_firebase_api_key_here",
  "FIREBASE_AUTH_DOMAIN": "your_project_id.firebaseapp.com",
  // ... その他の設定
}
```

### セットアップ手順

#### 1. 設定ファイルの準備

```bash
# .env.exampleをコピー
cp .env.example .env

# 設定値を編集
nano .env
```

#### 2. Firebase設定の取得

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト設定 > 全般タブ > アプリセクション
3. 「Firebase SDK snippet」から設定をコピー

#### 3. 本番環境への反映

**方法A: メタタグ（推奨）**
```html
<!-- index.htmlに追加 -->
<meta name="firebase-api-key" content="実際のAPIキー">
<meta name="firebase-auth-domain" content="実際のドメイン">
<!-- ... その他 -->
```

**方法B: 設定ファイル**
```bash
# 本番用設定ファイル作成
cp public/.well-known/config.json.example public/.well-known/config.json
nano public/.well-known/config.json
```

#### 4. Firebase Hostingデプロイ

```bash
# ビルドとデプロイ
firebase deploy --only hosting

# セキュリティルールも更新
firebase deploy --only firestore:rules
```

### セキュリティのベストプラクティス

#### 1. APIキー管理
- APIキーはクライアントサイド用なので公開されても基本的に安全
- ただし、Firebase Consoleでドメイン制限を設定することを推奨
- セキュリティルールで適切なアクセス制御を実装

#### 2. Firebaseセキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // テナント分離
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && resource.data.tenantId == request.auth.token.tenantId;
    }
    
    // 管理者権限チェック
    match /admin/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.token.role == 'admin';
    }
  }
}
```

#### 3. HTTPS強制
```json
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security", 
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

### トラブルシューティング

#### よくある問題

1. **設定が読み込まれない**
   - ブラウザのコンソールで`window.env.debug()`を実行
   - ネットワークタブで設定ファイルの読み込み状況を確認

2. **Firebase初期化エラー**
   - Firebase設定が正確かコンソールで確認
   - プロジェクトIDが正しいか確認

3. **認証エラー** 
   - セキュリティルールが適切か確認
   - ドメイン制限の設定を確認

#### デバッグコマンド

```javascript
// ブラウザコンソールで実行
window.env.debug()           // 環境変数情報表示
window.env.getEnvironment()  // 現在の環境確認
```

### 今後の改善予定

1. **TypeScript導入**: 型安全性の向上
2. **環境変数検証**: 起動時の設定チェック強化  
3. **CI/CD**: 自動デプロイパイプライン
4. **監視**: エラー監視とアラート
5. **セキュリティテスト**: 定期的な脆弱性チェック

### サポート

問題が発生した場合は、以下の情報を含めて報告してください：

1. 環境（開発/本番）
2. ブラウザとバージョン
3. コンソールエラーメッセージ
4. `window.env.debug()`の出力