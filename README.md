# 建設業従業員評価管理システム
# Construction Industry Employee Evaluation Management System

多言語対応（日本語・ベトナム語・英語）の建設業向け従業員評価管理システムです。

## 🌟 主な機能

### 👥 ユーザー管理
- **4段階のロールベースアクセス制御**
  - 開発者（Developer）: システム全体の管理
  - 管理者（Admin）: テナント内の全権限
  - 評価者（Evaluator）: 評価実施・ユーザー管理
  - 作業員（Worker）: 自己評価・目標設定

### 🏢 マルチテナント機能
- テナント別データ完全分離
- 企業ごとの独立した評価システム

### 🎯 目標設定・承認システム
- 定性的目標の設定（最大5つ）
- ウェイト設定（合計100%）
- 管理者による承認フロー

### 📊 評価システム
- **定量的評価**: 1-5点スケール（技術力、コミュニケーション、チームワーク、問題解決、安全意識）
- **定性的評価**: スコア + コメント
- **目標達成度評価**: 設定目標の達成度評価
- ポリゴンチャートによる視覚化

### 🌐 多言語対応
- 日本語（デフォルト）
- ベトナム語
- 英語

### 📱 レスポンシブデザイン
- モバイル・タブレット・デスクトップ対応

## 🛠 技術スタック

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Charts**: Canvas API (カスタムポリゴンチャート)
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome

## 📁 プロジェクト構造

\`\`\`
construction-evaluation-app/
├── index.html                 # メインHTMLファイル
├── 404.html                   # 404エラーページ
├── styles.css                 # メインスタイルシート
├── app.js                     # アプリケーションメイン
├── router.js                  # ルーティング管理
├── auth.js                    # 認証管理
├── api.js                     # API通信
├── i18n.js                    # 国際化対応
├── components/
│   ├── header.js              # ヘッダーコンポーネント
│   ├── sidebar.js             # サイドバーコンポーネント
│   ├── polygon-chart.js       # ポリゴンチャートコンポーネント
│   └── ui/
│       └── chart.js           # チャート基底クラス
├── pages/
│   ├── login.js               # ログインページ
│   ├── register.js            # ユーザー登録ページ
│   ├── register-admin.js      # 管理者登録ページ
│   ├── dashboard.js           # ダッシュボード
│   ├── user-management.js     # ユーザー管理
│   ├── goal-setting.js        # 目標設定
│   ├── goal-approvals.js      # 目標承認
│   ├── evaluation-form.js     # 評価フォーム
│   ├── evaluations.js         # 評価一覧
│   ├── settings.js            # 設定
│   └── developer.js           # 開発者ページ
├── locales/
│   ├── ja.json                # 日本語翻訳
│   ├── en.json                # 英語翻訳
│   └── vi.json                # ベトナム語翻訳
├── scripts/
│   └── firestore-security-rules.js # Firestoreセキュリティルール生成
├── firebase.json              # Firebase設定
├── firestore.indexes.json     # Firestoreインデックス設定
└── README.md                  # このファイル
\`\`\`

## 🚀 セットアップ

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication、Firestore Database、Hostingを有効化
3. プロジェクト設定からFirebase SDKの設定情報を取得

### 2. Firebase設定の更新

`auth.js`ファイルの設定を実際の値に更新：

\`\`\`javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
}
\`\`\`

### 3. Firestoreセキュリティルールの設定

\`\`\`bash
# セキュリティルール生成スクリプトを実行
node scripts/firestore-security-rules.js
\`\`\`

生成されたルールをFirebase Consoleで設定するか、Firebase CLIを使用：

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

### 4. Firestoreインデックスの設定

\`\`\`bash
firebase deploy --only firestore:indexes
\`\`\`

### 5. 開発サーバーの起動

\`\`\`bash
# ローカル開発サーバー
firebase serve

# または、シンプルなHTTPサーバー
python -m http.server 8000
# または
npx serve .
\`\`\`

### 6. デプロイ

\`\`\`bash
firebase deploy
\`\`\`

## 🔐 セキュリティ

### ロールベースアクセス制御

| ロール | 権限 |
|--------|------|
| Developer | システム全体の管理、全テナントアクセス |
| Admin | テナント内の全権限、ユーザー管理、評価管理 |
| Evaluator | 評価実施、部下の管理、レポート閲覧 |
| Worker | 自己評価、目標設定、自分の評価閲覧 |

### データ分離

- テナントIDによる完全なデータ分離
- Firestoreセキュリティルールによるアクセス制御
- クライアントサイドでの権限チェック

## 📊 評価システム

### 定量的評価項目

1. **技術力** (Technical Skills)
2. **コミュニケーション** (Communication)
3. **チームワーク** (Teamwork)
4. **問題解決** (Problem Solving)
5. **安全意識** (Safety Awareness)

各項目1-5点で評価

### 定性的目標

- 最大5つの目標設定
- 各目標にウェイト設定（合計100%）
- 達成度評価（1-5点）
- コメント記入

### 視覚化

- ポリゴンチャートによる評価結果の視覚化
- 前回評価との比較表示
- 部門平均との比較

## 🌐 多言語対応

### サポート言語

- **日本語** (ja): デフォルト言語
- **ベトナム語** (vi): ベトナム人労働者向け
- **英語** (en): 国際対応

### 翻訳ファイル

翻訳は`locales/`フォルダ内のJSONファイルで管理：

\`\`\`javascript
// 使用例
i18n.t('login.title') // "ログイン" (ja) / "Đăng nhập" (vi) / "Login" (en)
\`\`\`

## 🧪 テスト

### 手動テスト項目

#### 認証テスト
- [ ] ログイン機能
- [ ] ログアウト機能
- [ ] パスワードリセット
- [ ] 権限チェック

#### 評価機能テスト
- [ ] 目標設定
- [ ] 目標承認
- [ ] 評価入力
- [ ] 評価結果表示

#### 多言語テスト
- [ ] 言語切り替え
- [ ] 翻訳表示確認
- [ ] 日付・数値フォーマット

#### レスポンシブテスト
- [ ] モバイル表示
- [ ] タブレット表示
- [ ] デスクトップ表示

## 📝 開発ガイド

### 新しいページの追加

1. `pages/`フォルダに新しいJSファイルを作成
2. `router.js`にルートを追加
3. 必要に応じて翻訳ファイルを更新

### 新しい言語の追加

1. `locales/`フォルダに新しいJSONファイルを作成
2. `i18n.js`の`supportedLanguages`に追加
3. 全ての翻訳キーを翻訳

### カスタムコンポーネントの作成

1. `components/`フォルダに新しいJSファイルを作成
2. クラスベースのコンポーネントとして実装
3. `window`オブジェクトにエクスポート

## 🐛 トラブルシューティング

### よくある問題

#### Firebase接続エラー
- Firebase設定が正しいか確認
- APIキーの権限設定を確認
- ネットワーク接続を確認

#### 認証エラー
- Firebaseプロジェクトで認証が有効化されているか確認
- 認証プロバイダーの設定を確認

#### データ取得エラー
- Firestoreセキュリティルールを確認
- ユーザーの権限を確認
- インデックスが作成されているか確認

## 📞 サポート

技術的な問題や機能要望については、開発チームまでお問い合わせください。

## 📄 ライセンス

このプロジェクトは社内利用のためのものです。

---

**最終更新**: 2024年1月
**バージョン**: 1.0.0
\`\`\`

Now let me also complete the chart component:
