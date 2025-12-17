/**
 * Migration Script: Add skillDimension to Evaluation Structures
 * 評価構造にスキルディメンションマッピングを追加
 *
 * Usage:
 *   node scripts/migrate-evaluation-structures.js
 */

import 'dotenv/config';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Firebase Admin SDKの初期化
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// スキルディメンションマッピング定義
// 評価項目名からスキルディメンションへのマッピング
const SKILL_DIMENSION_MAPPING = {
  // 技術系
  '専門知識': 'technical_skills',
  '技術力': 'technical_skills',
  '専門技術': 'technical_skills',
  '作業効率': 'efficiency',
  '効率性': 'efficiency',
  '作業品質': 'work_quality',
  '品質': 'work_quality',
  '精密性': 'precision',
  '正確性': 'precision',

  // コミュニケーション系
  '報告・連絡': 'communication',
  'コミュニケーション': 'communication',
  '報連相': 'communication',

  // チーム系
  'チームワーク': 'teamwork',
  '協調性': 'teamwork',
  'リーダーシップ': 'leadership',
  '指導力': 'leadership',

  // 問題解決系
  '問題解決': 'problem_solving',
  '問題解決力': 'problem_solving',
  '課題解決': 'problem_solving',

  // 安全系
  '安全意識': 'safety_awareness',
  '安全管理': 'safety_awareness',

  // その他
  '創造性': 'creativity',
  '計画性': 'planning',
  '分析力': 'analytical_skills',
  '責任感': 'responsibility',
  '注意力': 'attention_to_detail',
  '細部への注意': 'attention_to_detail'
};

// デフォルトのカテゴリウェイト
const DEFAULT_CATEGORY_WEIGHT = 1.0;
const DEFAULT_ITEM_WEIGHT = 1.0;

async function migrateEvaluationStructures() {
  console.log('=========================================');
  console.log('Evaluation Structure Migration Starting...');
  console.log('=========================================\n');

  try {
    // Firebase Admin初期化
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();

    console.log('✓ Firebase Admin initialized successfully\n');

    // 評価構造を取得
    const snapshot = await db.collection('evaluationStructures').get();

    console.log(`Found ${snapshot.size} evaluation structure(s)\n`);

    if (snapshot.size === 0) {
      console.log('No evaluation structures to migrate.');
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // 各評価構造を処理
    for (const docSnapshot of snapshot.docs) {
      const structureId = docSnapshot.id;
      const structure = docSnapshot.data();

      console.log(`Processing: ${structureId}`);
      console.log(`  Job Type: ${structure.jobTypeId || 'N/A'}`);

      let modified = false;
      const updates = [];

      // カテゴリを処理
      if (structure.categories && Array.isArray(structure.categories)) {
        structure.categories.forEach((category, catIndex) => {
          // カテゴリにweightを追加
          if (!category.weight) {
            category.weight = DEFAULT_CATEGORY_WEIGHT;
            modified = true;
            updates.push(`  - Added weight to category: ${category.name}`);
          }

          // 英語名を追加（オプション）
          if (!category.name_en && category.name) {
            category.name_en = category.name; // 暫定的に日本語名を使用
            modified = true;
          }

          // アイテムを処理
          if (category.items && Array.isArray(category.items)) {
            category.items.forEach((item, itemIndex) => {
              // アイテム名からスキルディメンションをマッピング
              if (!item.skillDimension) {
                const dimension = SKILL_DIMENSION_MAPPING[item.name] || 'technical_skills';
                item.skillDimension = dimension;
                modified = true;
                updates.push(`  - Mapped "${item.name}" → ${dimension}`);
              }

              // weightを追加
              if (!item.weight) {
                item.weight = DEFAULT_ITEM_WEIGHT;
                modified = true;
              }

              // 英語名を追加（オプション）
              if (!item.name_en && item.name) {
                item.name_en = item.name; // 暫定的に日本語名を使用
                modified = true;
              }

              // 説明を追加（空の場合）
              if (!item.description && item.name) {
                item.description = `${item.name}の評価項目`;
                modified = true;
              }
            });
          }
        });
      }

      // versionを追加
      if (!structure.version) {
        structure.version = '2.0';
        modified = true;
        updates.push('  - Set version to 2.0');
      }

      // スキルディメンションマッピングの逆引きマップを作成
      if (modified && structure.categories) {
        const skillDimensionMapping = {};
        structure.categories.forEach(category => {
          if (category.items) {
            category.items.forEach(item => {
              if (item.skillDimension) {
                if (!skillDimensionMapping[item.skillDimension]) {
                  skillDimensionMapping[item.skillDimension] = [];
                }
                skillDimensionMapping[item.skillDimension].push(item.id);
              }
            });
          }
        });
        structure.skillDimensionMapping = skillDimensionMapping;
        updates.push('  - Created skillDimensionMapping');
      }

      // 変更があれば更新
      if (modified) {
        try {
          await db.collection('evaluationStructures').doc(structureId).update(structure);
          updated++;
          console.log('  ✓ Updated successfully');
          if (updates.length > 0) {
            updates.forEach(update => console.log(update));
          }
        } catch (error) {
          errors++;
          console.error(`  ✗ Error updating: ${error.message}`);
        }
      } else {
        skipped++;
        console.log('  - No changes needed');
      }

      console.log('');
    }

    // サマリー表示
    console.log('=========================================');
    console.log('Migration Summary:');
    console.log('=========================================');
    console.log(`Total structures:  ${snapshot.size}`);
    console.log(`Updated:           ${updated}`);
    console.log(`Skipped:           ${skipped}`);
    console.log(`Errors:            ${errors}`);
    console.log('=========================================\n');

    if (errors > 0) {
      console.log('⚠ Migration completed with errors');
      process.exit(1);
    } else {
      console.log('✓ Migration completed successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// スクリプト実行
console.log('\n');
migrateEvaluationStructures();
