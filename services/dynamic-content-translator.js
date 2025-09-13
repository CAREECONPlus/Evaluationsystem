/**
 * Dynamic Content Translator
 * 動的コンテンツ翻訳サービス
 */
import { TranslationService } from './translation-service.js';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export class DynamicContentTranslator {
  constructor(app) {
    this.app = app;

    // 緊急モード時はFirestoreを初期化しない
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || app.auth.useTemporaryAuth) {
      console.log("DynamicContentTranslator: Emergency mode detected - skipping Firestore initialization");
      this.db = null;
    } else {
      this.db = getFirestore(app.auth.firebaseApp);
    }

    this.translationService = new TranslationService(app);
    this.supportedLanguages = ['ja', 'en', 'vi'];
  }

  /**
   * 評価コメントの多言語保存
   */
  async saveEvaluationCommentWithTranslations(evaluationId, commentData) {
    try {
      const userLanguage = this.app.i18n.getCurrentLanguage();
      const otherLanguages = this.supportedLanguages.filter(lang => lang !== userLanguage);
      
      const batch = writeBatch(this.db);
      const commentId = `${evaluationId}_${Date.now()}`;
      
      // 原文コメントを保存
      const originalCommentRef = doc(this.db, 'evaluation_comments', `${commentId}_${userLanguage}`);
      batch.set(originalCommentRef, {
        evaluationId,
        commentId,
        userId: this.app.auth.user.uid,
        language: userLanguage,
        content: commentData.content,
        type: commentData.type || 'general',
        isOriginal: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 他言語への翻訳を並行実行
      const translationPromises = otherLanguages.map(async (targetLang) => {
        try {
          const translatedContent = await this.translationService.translateText(
            commentData.content, 
            userLanguage, 
            targetLang
          );
          
          const translatedCommentRef = doc(this.db, 'evaluation_comments', `${commentId}_${targetLang}`);
          batch.set(translatedCommentRef, {
            evaluationId,
            commentId,
            userId: this.app.auth.user.uid,
            language: targetLang,
            content: translatedContent,
            type: commentData.type || 'general',
            isOriginal: false,
            originalLanguage: userLanguage,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          return { language: targetLang, success: true };
        } catch (error) {
          console.error(`Translation failed for ${targetLang}:`, error);
          return { language: targetLang, success: false, error: error.message };
        }
      });

      const translationResults = await Promise.all(translationPromises);
      
      // バッチ実行
      await batch.commit();
      
      return {
        success: true,
        commentId,
        originalLanguage: userLanguage,
        translationResults
      };
      
    } catch (error) {
      console.error('Error saving evaluation comment with translations:', error);
      throw error;
    }
  }

  /**
   * 評価コメントの取得（指定言語）
   */
  async getEvaluationCommentsInLanguage(evaluationId, language = 'ja') {
    try {
      const q = query(
        collection(this.db, 'evaluation_comments'),
        where('evaluationId', '==', evaluationId),
        where('language', '==', language)
      );

      const querySnapshot = await getDocs(q);
      const comments = [];

      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return comments;
    } catch (error) {
      console.error('Error getting evaluation comments:', error);
      throw error;
    }
  }

  /**
   * 目標設定の多言語保存
   */
  async saveGoalWithTranslations(goalData) {
    try {
      const userLanguage = this.app.i18n.getCurrentLanguage();
      const otherLanguages = this.supportedLanguages.filter(lang => lang !== userLanguage);
      
      const batch = writeBatch(this.db);
      const goalId = goalData.id || `goal_${Date.now()}`;
      
      // 原文目標を保存
      const originalGoalRef = doc(this.db, 'goals_i18n', `${goalId}_${userLanguage}`);
      batch.set(originalGoalRef, {
        goalId,
        userId: goalData.userId,
        language: userLanguage,
        title: goalData.title,
        description: goalData.description,
        targetValue: goalData.targetValue,
        unit: goalData.unit,
        period: goalData.period,
        category: goalData.category,
        priority: goalData.priority,
        isOriginal: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 翻訳対象フィールドを定義
      const fieldsToTranslate = ['title', 'description', 'unit'];
      
      // 他言語への翻訳
      for (const targetLang of otherLanguages) {
        try {
          const translatedFields = {};
          
          for (const field of fieldsToTranslate) {
            if (goalData[field] && goalData[field].trim()) {
              translatedFields[field] = await this.translationService.translateText(
                goalData[field], 
                userLanguage, 
                targetLang
              );
            } else {
              translatedFields[field] = goalData[field];
            }
          }
          
          const translatedGoalRef = doc(this.db, 'goals_i18n', `${goalId}_${targetLang}`);
          batch.set(translatedGoalRef, {
            goalId,
            userId: goalData.userId,
            language: targetLang,
            title: translatedFields.title,
            description: translatedFields.description,
            targetValue: goalData.targetValue,
            unit: translatedFields.unit,
            period: goalData.period,
            category: goalData.category,
            priority: goalData.priority,
            isOriginal: false,
            originalLanguage: userLanguage,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
        } catch (error) {
          console.error(`Goal translation failed for ${targetLang}:`, error);
        }
      }

      await batch.commit();
      
      return {
        success: true,
        goalId,
        originalLanguage: userLanguage
      };
      
    } catch (error) {
      console.error('Error saving goal with translations:', error);
      throw error;
    }
  }

  /**
   * 目標の取得（指定言語）
   */
  async getGoalsInLanguage(userId, language = 'ja') {
    try {
      const q = query(
        collection(this.db, 'goals_i18n'),
        where('userId', '==', userId),
        where('language', '==', language)
      );

      const querySnapshot = await getDocs(q);
      const goals = [];

      querySnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return goals;
    } catch (error) {
      console.error('Error getting goals in language:', error);
      throw error;
    }
  }

  /**
   * 評価データの多言語対応
   */
  async translateEvaluationData(evaluationId, currentLanguage, targetLanguage) {
    try {
      // 評価データを取得
      const evaluationDoc = await getDoc(doc(this.db, 'evaluations', evaluationId));
      if (!evaluationDoc.exists()) {
        throw new Error('Evaluation not found');
      }

      const evaluationData = evaluationDoc.data();
      
      // 翻訳対象フィールドを定義
      const fieldsToTranslate = [
        'selfAssessment.comments',
        'supervisorAssessment.comments',
        'feedback',
        'improvementAreas',
        'strengths',
        'additionalComments'
      ];

      const translatedData = { ...evaluationData };
      
      for (const fieldPath of fieldsToTranslate) {
        const value = this.getNestedValue(evaluationData, fieldPath);
        if (value && typeof value === 'string' && value.trim()) {
          const translatedValue = await this.translationService.translateText(
            value, 
            currentLanguage, 
            targetLanguage
          );
          this.setNestedValue(translatedData, fieldPath, translatedValue);
        }
      }

      // 翻訳済みデータをキャッシュとして保存
      const translatedEvaluationRef = doc(this.db, 'evaluations_translated', `${evaluationId}_${targetLanguage}`);
      await setDoc(translatedEvaluationRef, {
        ...translatedData,
        originalEvaluationId: evaluationId,
        targetLanguage,
        sourceLanguage: currentLanguage,
        translatedAt: serverTimestamp()
      });

      return translatedData;
      
    } catch (error) {
      console.error('Error translating evaluation data:', error);
      throw error;
    }
  }

  /**
   * ユーザー入力フィールドのリアルタイム翻訳
   */
  async translateUserInputRealtime(inputValue, sourceLang, targetLangs) {
    try {
      if (!inputValue || inputValue.trim() === '') {
        return {};
      }

      const translations = {};
      
      const translationPromises = targetLangs.map(async (targetLang) => {
        if (sourceLang === targetLang) {
          translations[targetLang] = inputValue;
          return;
        }
        
        try {
          translations[targetLang] = await this.translationService.translateText(
            inputValue, 
            sourceLang, 
            targetLang
          );
        } catch (error) {
          console.error(`Realtime translation failed for ${targetLang}:`, error);
          translations[targetLang] = inputValue; // フォールバック
        }
      });

      await Promise.all(translationPromises);
      return translations;
      
    } catch (error) {
      console.error('Error in realtime translation:', error);
      return {};
    }
  }

  /**
   * バッチ翻訳処理（大量データ対応）
   */
  async batchTranslateContent(contentItems, sourceLang, targetLang) {
    try {
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < contentItems.length; i += batchSize) {
        const batch = contentItems.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (item) => {
          try {
            const translatedContent = await this.translationService.translateText(
              item.content, 
              sourceLang, 
              targetLang
            );
            
            return {
              ...item,
              translatedContent,
              success: true
            };
          } catch (error) {
            return {
              ...item,
              translatedContent: item.content,
              success: false,
              error: error.message
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // API制限を考慮して少し待機
        if (i + batchSize < contentItems.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error in batch translation:', error);
      throw error;
    }
  }

  /**
   * 翻訳品質の評価と改善提案
   */
  async evaluateTranslationQuality(originalText, translatedText, sourceLang, targetLang) {
    try {
      const evaluation = {
        lengthRatio: translatedText.length / originalText.length,
        hasSpecialTerms: this.containsSpecialTerms(originalText),
        complexityScore: this.calculateComplexity(originalText),
        qualityScore: 0
      };

      // 品質スコアの計算
      let score = 0.7; // ベーススコア
      
      // 長さの比率チェック（適切な範囲内かどうか）
      if (evaluation.lengthRatio >= 0.5 && evaluation.lengthRatio <= 2.0) {
        score += 0.1;
      }
      
      // 専門用語の翻訳チェック
      if (evaluation.hasSpecialTerms) {
        const termTranslationAccuracy = await this.checkTermTranslation(
          originalText, 
          translatedText, 
          sourceLang, 
          targetLang
        );
        score += termTranslationAccuracy * 0.2;
      }
      
      evaluation.qualityScore = Math.min(score, 1.0);
      
      // 改善提案
      evaluation.suggestions = [];
      if (evaluation.lengthRatio < 0.3) {
        evaluation.suggestions.push('Translation appears too short - may be missing content');
      }
      if (evaluation.lengthRatio > 3.0) {
        evaluation.suggestions.push('Translation appears too long - may be overly verbose');
      }
      if (evaluation.hasSpecialTerms && evaluation.qualityScore < 0.8) {
        evaluation.suggestions.push('Technical terms may need manual review');
      }
      
      return evaluation;
      
    } catch (error) {
      console.error('Error evaluating translation quality:', error);
      return {
        qualityScore: 0.5,
        suggestions: ['Unable to evaluate translation quality automatically']
      };
    }
  }

  /**
   * ネストされた値の取得
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * ネストされた値の設定
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * 専門用語の含有チェック
   */
  containsSpecialTerms(text) {
    const constructionTerms = [
      '安全管理', '品質管理', '工程管理', '現場監督', '作業員', '技術者',
      '施工', '設計', '測量', '検査', '試験', '材料', '構造', '基礎',
      '鉄筋', 'コンクリート', '足場', 'クレーン', '重機'
    ];
    
    return constructionTerms.some(term => text.includes(term));
  }

  /**
   * テキストの複雑さスコア計算
   */
  calculateComplexity(text) {
    const sentences = text.split(/[。．.!?]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / sentences.length;
    
    // 複雑さスコア（0-1）
    return Math.min(avgSentenceLength / 100, 1.0);
  }

  /**
   * 専門用語翻訳の精度チェック
   */
  async checkTermTranslation(originalText, translatedText, sourceLang, targetLang) {
    // 簡易的な専門用語翻訳チェック
    // 実際の実装では、専門用語辞書との照合を行う
    return 0.8; // 暫定的なスコア
  }
}