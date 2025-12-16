# Phase 1: データベースマイグレーションガイド

## 概要

このディレクトリには、評価システムのスキルディメンション機能を実装するためのマイグレーションスクリプトが含まれています。

## マイグレーションの目的

1. **評価構造の拡張**: 既存の評価項目にスキルディメンション（technical_skills, communication など）をマッピング
2. **スキルスコアの自動計算**: 既存の評価データに対してスキルディメンションスコアを計算・追加

## 前提条件

- Node.js 18以上がインストールされていること
- Firebase プロジェクトへのアクセス権限があること
- 環境変数が設定されていること

## 環境変数の設定

マイグレーションスクリプトを実行する前に、以下の環境変数を設定してください：

```bash
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-auth-domain"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-storage-bucket"
export FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
export FIREBASE_APP_ID="your-app-id"
```

または、`.env` ファイルを作成して設定することもできます。

## マイグレーション手順

### ステップ 1: 評価構造のマイグレーション

このスクリプトは、既存の評価構造に `skillDimension` フィールドを追加します。

```bash
# 本番実行前にテスト（推奨）
node scripts/migrate-evaluation-structures.js

# 実行
node scripts/migrate-evaluation-structures.js
```

**このスクリプトが行うこと:**
- 各評価項目に `skillDimension` フィールドを追加
- 各カテゴリ・項目に `weight` フィールドを追加
- 評価構造に `version: "2.0"` を設定
- `skillDimensionMapping` の逆引きマップを作成

**出力例:**
```
=========================================
Evaluation Structure Migration Starting...
=========================================

✓ Firebase initialized successfully

Found 5 evaluation structure(s)

Processing: struct_001
  Job Type: job_001
  - Added weight to category: 技術スキル
  - Mapped "専門知識" → technical_skills
  - Mapped "作業効率" → efficiency
  - Set version to 2.0
  - Created skillDimensionMapping
  ✓ Updated successfully

=========================================
Migration Summary:
=========================================
Total structures:  5
Updated:           5
Skipped:           0
Errors:            0
=========================================

✓ Migration completed successfully!
```

### ステップ 2: スキルスコアの再計算

このスクリプトは、既存の評価データに対してスキルディメンションスコアを計算して追加します。

```bash
# DRY RUN モード（実際の更新は行わない）
node scripts/recalculate-skill-scores.js --dry-run

# 本番実行
node scripts/recalculate-skill-scores.js

# 件数を制限して実行（テスト用）
node scripts/recalculate-skill-scores.js --limit=10
```

**このスクリプトが行うこと:**
- 各評価の `ratings` から `skillDimensionScores` を計算
- `categoryScores` を計算
- `finalScore` を計算
- `calculationMetadata` を追加

**出力例:**
```
=========================================
Skill Scores Recalculation Starting...
=========================================

⚠ DRY RUN MODE - No updates will be performed

✓ Firebase initialized successfully

Found 150 evaluation(s)

[1/150] Processing: eval_001
  Target: 山田太郎
  Status: completed
  ✓ Scores calculated:
    - Dimensions: 5
    - Final Score: 3.75
      technical_skills: 3.8
      communication: 3.5
      teamwork: 4.2
      ... and 2 more
  ✓ Would update (dry-run mode)

[2/150] Processing: eval_002
  Target: 佐藤花子
  Status: completed
  - Already has skillDimensionScores, skipping

...

=========================================
Recalculation Summary:
=========================================
Total evaluations: 150
Processed:         150
Updated:           100
Skipped:           45
Errors:            5
=========================================

✓ Recalculation completed successfully!
```

## トラブルシューティング

### エラー: "No structure found for jobType"

**原因**: 評価に紐づく職種の評価構造が存在しない

**解決策**:
1. まず `migrate-evaluation-structures.js` を実行
2. 該当する職種の評価構造を作成

### エラー: "Missing ratings or jobTypeId"

**原因**: 評価データに `ratings` または `jobTypeId` が含まれていない

**解決策**: 該当する評価データを確認し、必要なフィールドを追加

### エラー: Firebase接続エラー

**原因**: 環境変数が正しく設定されていない

**解決策**:
```bash
# 環境変数を確認
echo $FIREBASE_PROJECT_ID

# 再設定
export FIREBASE_PROJECT_ID="your-project-id"
```

## ロールバック手順

マイグレーション後に問題が発生した場合のロールバック方法：

### 評価構造のロールバック

Firestoreコンソールから、以下のフィールドを手動で削除：
- `skillDimension`
- `weight`
- `version`
- `skillDimensionMapping`

### スキルスコアのロールバック

Firestoreコンソールから、以下のフィールドを手動で削除：
- `skillDimensionScores`
- `categoryScores`
- `finalScore`
- `calculationMetadata`
- `structureId`
- `structureVersion`

## 検証

マイグレーション後、以下を確認してください：

1. **評価構造の確認**
   - Firestoreコンソールで `evaluationStructures` コレクションを確認
   - 各項目に `skillDimension` が追加されているか

2. **評価データの確認**
   - Firestoreコンソールで `evaluations` コレクションを確認
   - `skillDimensionScores` が正しく計算されているか

3. **アプリケーションの動作確認**
   - 新しい評価を作成してスコアが自動計算されるか
   - レポート機能が正しく動作するか

## 次のステップ

Phase 1 のマイグレーションが完了したら、Phase 2 に進みます：
- レポート機能の修正
- スキルマップの実装

詳細は `/docs/PHASE2_GUIDE.md` を参照してください。

## サポート

問題が発生した場合は、以下の情報を含めて報告してください：
- エラーメッセージ全文
- 実行したコマンド
- 環境（Node.js バージョン、OS など）
- 処理中の評価ID（該当する場合）
