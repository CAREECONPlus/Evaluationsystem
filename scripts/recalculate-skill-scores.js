/**
 * Migration Script: Recalculate Skill Dimension Scores
 * 既存評価データのスキルスコアを再計算
 *
 * Usage:
 *   node scripts/recalculate-skill-scores.js
 *
 * Options:
 *   --dry-run    : 実際の更新を行わず、計算結果のみを表示
 *   --limit=N    : 処理する評価の最大数を指定
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  limit as firestoreLimit
} from 'firebase/firestore';

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const processLimit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

/**
 * スキルディメンションスコアの計算
 */
function calculateSkillDimensionScores(ratings, structure) {
  const dimensionScores = {};
  const categoryScores = {};

  // 各カテゴリを処理
  for (const category of structure.categories || []) {
    let categoryTotal = 0;
    let categoryWeight = 0;

    // 各評価項目を処理
    for (const item of category.items || []) {
      const score = parseFloat(ratings[item.id]) || 0;
      const weight = item.weight || 1.0;

      // スキルディメンションごとに集計
      const dimension = item.skillDimension;
      if (dimension) {
        if (!dimensionScores[dimension]) {
          dimensionScores[dimension] = { total: 0, weight: 0 };
        }

        dimensionScores[dimension].total += score * weight;
        dimensionScores[dimension].weight += weight;
      }

      // カテゴリスコアの計算
      categoryTotal += score * weight;
      categoryWeight += weight;
    }

    // カテゴリの重み付き平均
    categoryScores[category.id] = categoryWeight > 0
      ? categoryTotal / categoryWeight
      : 0;
  }

  // スキルディメンションの重み付き平均を計算
  const finalDimensionScores = {};
  for (const [dimension, data] of Object.entries(dimensionScores)) {
    finalDimensionScores[dimension] = data.weight > 0
      ? parseFloat((data.total / data.weight).toFixed(2))
      : 0;
  }

  // 総合スコアの計算（カテゴリの重み付き平均）
  let finalScoreTotal = 0;
  let finalScoreWeight = 0;

  for (const category of structure.categories || []) {
    const categoryWeight = category.weight || 1.0;
    const categoryScore = categoryScores[category.id] || 0;

    finalScoreTotal += categoryScore * categoryWeight;
    finalScoreWeight += categoryWeight;
  }

  const finalScore = finalScoreWeight > 0
    ? parseFloat((finalScoreTotal / finalScoreWeight).toFixed(2))
    : 0;

  return {
    dimensionScores: finalDimensionScores,
    categoryScores,
    finalScore
  };
}

async function recalculateSkillScores() {
  console.log('=========================================');
  console.log('Skill Scores Recalculation Starting...');
  console.log('=========================================\n');

  if (isDryRun) {
    console.log('⚠ DRY RUN MODE - No updates will be performed\n');
  }

  if (processLimit) {
    console.log(`⚠ Process limit set to: ${processLimit} evaluations\n`);
  }

  try {
    // Firebase初期化
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✓ Firebase initialized successfully\n');

    // 評価データを取得
    let evaluationsQuery = collection(db, 'evaluations');

    if (processLimit) {
      evaluationsQuery = query(evaluationsQuery, firestoreLimit(processLimit));
    }

    const snapshot = await getDocs(evaluationsQuery);

    console.log(`Found ${snapshot.size} evaluation(s)\n`);

    if (snapshot.size === 0) {
      console.log('No evaluations to process.');
      return;
    }

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // 各評価を処理
    for (const evalDoc of snapshot.docs) {
      processed++;
      const evaluationId = evalDoc.id;
      const evaluation = evalDoc.data();

      console.log(`[${processed}/${snapshot.size}] Processing: ${evaluationId}`);
      console.log(`  Target: ${evaluation.targetUserName || evaluation.targetUserId || 'N/A'}`);
      console.log(`  Status: ${evaluation.status || 'N/A'}`);

      // すでにskillDimensionScoresがある場合
      if (evaluation.skillDimensionScores) {
        console.log('  - Already has skillDimensionScores, skipping');
        skipped++;
        console.log('');
        continue;
      }

      // ratingsとjobTypeIdが必要
      if (!evaluation.ratings || !evaluation.jobTypeId) {
        console.log('  - Missing ratings or jobTypeId, skipping');
        skipped++;
        console.log('');
        continue;
      }

      try {
        // 評価構造を取得
        const structuresQuery = query(
          collection(db, 'evaluationStructures'),
          where('jobTypeId', '==', evaluation.jobTypeId)
        );
        const structuresSnapshot = await getDocs(structuresQuery);

        if (structuresSnapshot.empty) {
          console.log(`  - No structure found for jobType: ${evaluation.jobTypeId}`);
          skipped++;
          console.log('');
          continue;
        }

        const structureDoc = structuresSnapshot.docs[0];
        const structure = structureDoc.data();

        // スキルスコアを計算
        const calculatedScores = calculateSkillDimensionScores(
          evaluation.ratings,
          structure
        );

        console.log('  ✓ Scores calculated:');
        console.log(`    - Dimensions: ${Object.keys(calculatedScores.dimensionScores).length}`);
        console.log(`    - Final Score: ${calculatedScores.finalScore}`);

        // サンプル表示（最初の3つのディメンション）
        const sampleDimensions = Object.entries(calculatedScores.dimensionScores).slice(0, 3);
        sampleDimensions.forEach(([dim, score]) => {
          console.log(`      ${dim}: ${score}`);
        });
        if (Object.keys(calculatedScores.dimensionScores).length > 3) {
          console.log(`      ... and ${Object.keys(calculatedScores.dimensionScores).length - 3} more`);
        }

        // 更新データを準備
        const updateData = {
          structureId: structureDoc.id,
          structureVersion: structure.version || '2.0',
          skillDimensionScores: calculatedScores.dimensionScores,
          categoryScores: calculatedScores.categoryScores,
          finalScore: calculatedScores.finalScore,
          calculationMetadata: {
            calculatedAt: new Date(),
            calculationVersion: '2.0',
            itemCount: Object.keys(evaluation.ratings).filter(k => !k.includes('comment')).length,
            migratedAt: new Date(),
            migrationScript: 'recalculate-skill-scores.js'
          }
        };

        // 更新実行（dry-runでない場合）
        if (!isDryRun) {
          await updateDoc(doc(db, 'evaluations', evaluationId), updateData);
          console.log('  ✓ Updated in Firestore');
          updated++;
        } else {
          console.log('  ✓ Would update (dry-run mode)');
        }

      } catch (error) {
        console.error(`  ✗ Error processing: ${error.message}`);
        errors++;
      }

      console.log('');

      // 進捗表示（10件ごと）
      if (processed % 10 === 0 && processed < snapshot.size) {
        console.log(`--- Progress: ${processed}/${snapshot.size} ---\n`);
      }
    }

    // サマリー表示
    console.log('=========================================');
    console.log('Recalculation Summary:');
    console.log('=========================================');
    console.log(`Total evaluations: ${snapshot.size}`);
    console.log(`Processed:         ${processed}`);
    console.log(`Updated:           ${updated}`);
    console.log(`Skipped:           ${skipped}`);
    console.log(`Errors:            ${errors}`);
    console.log('=========================================\n');

    if (isDryRun) {
      console.log('⚠ This was a DRY RUN - no actual updates were made');
      console.log('  Run without --dry-run to apply changes\n');
    }

    if (errors > 0) {
      console.log('⚠ Recalculation completed with errors');
      process.exit(1);
    } else {
      console.log('✓ Recalculation completed successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n✗ Recalculation failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// スクリプト実行
console.log('\n');
recalculateSkillScores();
