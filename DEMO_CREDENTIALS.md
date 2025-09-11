# 🔐 デモ認証アカウント

## 一時認証システム用デモアカウント

Firebase Console設定完了まで、以下のデモアカウントをご利用ください：

### 👑 管理者アカウント
- **Email**: `admin@demo.com`
- **Password**: `admin123`
- **権限**: 全機能アクセス可能

### 👥 評価者アカウント  
- **Email**: `evaluator@demo.com`
- **Password**: `eval123`
- **権限**: 評価機能、レポート閲覧

### 👷 作業員アカウント
- **Email**: `worker@demo.com` 
- **Password**: `work123`
- **権限**: 基本機能、自分の評価閲覧

## 🚨 重要な注意事項

1. **一時的なシステム**: Firebase Console設定完了後、通常認証に自動切替
2. **デモデータ**: ログイン後はデモデータが表示されます
3. **ローカル保存**: ブラウザのローカルストレージに保存（安全）

## 🔧 Firebase Console 設定

完全な機能利用のため、以下の設定を行ってください：

```
URL: https://console.firebase.google.com/project/hyouka-db/authentication/settings

承認済みドメインに追加:
- hyouka-db.web.app
- hyouka-db.firebaseapp.com
```

設定完了後、自動的に通常のFirebase認証に切り替わります。

## 🎯 テスト手順

1. https://hyouka-db.web.app にアクセス
2. 上記デモアカウントでログイン
3. 各機能の動作確認
4. Firebase Console設定完了後の動作確認