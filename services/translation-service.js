/**
 * Translation Service - Automatic Translation with Caching
 * 翻訳サービス - キャッシュ付き自動翻訳
 */
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export class TranslationService {
  constructor(app) {
    this.app = app;

    // 緊急モード時はFirestoreを初期化しない
    if (window.FORCE_TEMP_AUTH || window.DISABLE_FIREBASE || app.auth.useTemporaryAuth) {
      console.log("TranslationService: Emergency mode detected - skipping Firestore initialization");
      this.db = null;
    } else {
      this.db = getFirestore(app.auth.firebaseApp);
    }

    this.supportedLanguages = ['ja', 'en', 'vi'];
    this.fallbackTranslations = this.initializeFallbackTranslations();
    
    // API設定（環境変数または設定から取得）
    this.googleTranslateApiKey = this.getApiKey('GOOGLE_TRANSLATE_API_KEY');
    this.deeplApiKey = this.getApiKey('DEEPL_API_KEY');
  }

  /**
   * API キーの取得（環境変数または設定から）
   */
  getApiKey(keyName) {
    // 本来は環境変数やSecure設定から取得
    // 開発環境では設定ファイルやローカル設定を使用
    return localStorage.getItem(keyName) || null;
  }

  /**
   * フォールバック翻訳辞書の初期化
   */
  initializeFallbackTranslations() {
    return {
      'ja-en': {
        // 建設業界特有の用語
        '技術力': 'Technical Skills',
        'コミュニケーション': 'Communication',
        'リーダーシップ': 'Leadership',
        '問題解決': 'Problem Solving',
        '安全管理': 'Safety Management',
        '品質管理': 'Quality Control',
        '工程管理': 'Schedule Management',
        '現場監督': 'Site Supervisor',
        '作業員': 'Construction Worker',
        '技術者': 'Engineer',
        'マネージャー': 'Manager',
        '評価': 'Evaluation',
        '自己評価': 'Self-Assessment',
        '上司評価': 'Supervisor Evaluation',
        '改善点': 'Areas for Improvement',
        '強み': 'Strengths',
        '目標': 'Goals',
        '実績': 'Achievements',
        '優秀': 'Excellent',
        '良好': 'Good',
        '普通': 'Average',
        '要改善': 'Needs Improvement',
        '期待以上': 'Exceeds Expectations',
        '期待通り': 'Meets Expectations',
        '期待以下': 'Below Expectations'
      },
      'ja-vi': {
        '技術力': 'Kỹ năng kỹ thuật',
        'コミュニケーション': 'Giao tiếp',
        'リーダーシップ': 'Khả năng lãnh đạo',
        '問題解決': 'Giải quyết vấn đề',
        '安全管理': 'Quản lý an toàn',
        '品質管理': 'Quản lý chất lượng',
        '工程管理': 'Quản lý tiến độ',
        '現場監督': 'Giám sát công trường',
        '作業員': 'Công nhân xây dựng',
        '技術者': 'Kỹ sư',
        'マネージャー': 'Quản lý',
        '評価': 'Đánh giá',
        '自己評価': 'Tự đánh giá',
        '上司評価': 'Đánh giá của cấp trên',
        '改善点': 'Điểm cần cải thiện',
        '強み': 'Điểm mạnh',
        '目標': 'Mục tiêu',
        '実績': 'Thành tích',
        '優秀': 'Xuất sắc',
        '良好': 'Tốt',
        '普通': 'Trung bình',
        '要改善': 'Cần cải thiện',
        '期待以上': 'Vượt mong đợi',
        '期待通り': 'Đáp ứng mong đợi',
        '期待以下': 'Dưới mong đợi'
      },
      'en-ja': {
        'Technical Skills': '技術力',
        'Communication': 'コミュニケーション',
        'Leadership': 'リーダーシップ',
        'Problem Solving': '問題解決',
        'Safety Management': '安全管理',
        'Quality Control': '品質管理',
        'Schedule Management': '工程管理',
        'Excellent': '優秀',
        'Good': '良好',
        'Average': '普通',
        'Needs Improvement': '要改善'
      },
      'en-vi': {
        'Technical Skills': 'Kỹ năng kỹ thuật',
        'Communication': 'Giao tiếp',
        'Leadership': 'Khả năng lãnh đạo',
        'Problem Solving': 'Giải quyết vấn đề',
        'Excellent': 'Xuất sắc',
        'Good': 'Tốt',
        'Average': 'Trung bình',
        'Needs Improvement': 'Cần cải thiện'
      },
      'vi-ja': {
        'Kỹ năng kỹ thuật': '技術力',
        'Giao tiếp': 'コミュニケーション',
        'Khả năng lãnh đạo': 'リーダーシップ',
        'Giải quyết vấn đề': '問題解決'
      },
      'vi-en': {
        'Kỹ năng kỹ thuật': 'Technical Skills',
        'Giao tiếp': 'Communication',
        'Khả năng lãnh đạo': 'Leadership',
        'Giải quyết vấn đề': 'Problem Solving'
      }
    };
  }

  /**
   * テキストの翻訳（メインメソッド）
   */
  async translateText(text, sourceLang, targetLang) {
    if (!text || text.trim() === '') {
      return text;
    }

    if (sourceLang === targetLang) {
      return text;
    }

    try {
      // キャッシュをチェック
      const cached = await this.getCachedTranslation(text, sourceLang, targetLang);
      if (cached) {
        return cached.translatedText;
      }

      // 翻訳を実行
      let translation = await this.performTranslation(text, sourceLang, targetLang);
      
      // キャッシュに保存
      await this.cacheTranslation(text, translation, sourceLang, targetLang, 'automatic');

      return translation;

    } catch (error) {
      console.error('Translation error:', error);
      
      // フォールバック翻訳を試行
      const fallbackTranslation = this.getFallbackTranslation(text, sourceLang, targetLang);
      if (fallbackTranslation) {
        await this.cacheTranslation(text, fallbackTranslation, sourceLang, targetLang, 'fallback');
        return fallbackTranslation;
      }

      // 翻訳失敗時は元のテキストを返す
      return text;
    }
  }

  /**
   * 実際の翻訳処理
   */
  async performTranslation(text, sourceLang, targetLang) {
    // 1. Google Translate APIを試行
    if (this.googleTranslateApiKey) {
      try {
        return await this.translateWithGoogle(text, sourceLang, targetLang);
      } catch (error) {
        console.warn('Google Translate API failed:', error);
      }
    }

    // 2. DeepL APIを試行
    if (this.deeplApiKey) {
      try {
        return await this.translateWithDeepL(text, sourceLang, targetLang);
      } catch (error) {
        console.warn('DeepL API failed:', error);
      }
    }

    // 3. ブラウザの翻訳APIを試行（利用可能な場合）
    if ('translation' in window && window.translation) {
      try {
        return await this.translateWithBrowser(text, sourceLang, targetLang);
      } catch (error) {
        console.warn('Browser translation API failed:', error);
      }
    }

    // すべての翻訳方法が失敗した場合
    throw new Error('All translation methods failed');
  }

  /**
   * Google Translate APIを使用した翻訳
   */
  async translateWithGoogle(text, sourceLang, targetLang) {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.googleTranslateApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  /**
   * DeepL APIを使用した翻訳
   */
  async translateWithDeepL(text, sourceLang, targetLang) {
    // DeepL言語コード変換
    const deeplSourceLang = this.convertToDeepLLanguageCode(sourceLang);
    const deeplTargetLang = this.convertToDeepLLanguageCode(targetLang);

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.deeplApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        source_lang: deeplSourceLang,
        target_lang: deeplTargetLang
      })
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  /**
   * ブラウザの翻訳API（実験的）
   */
  async translateWithBrowser(text, sourceLang, targetLang) {
    // 実験的なブラウザ翻訳API（Chrome等で利用可能になる予定）
    if (window.translation && window.translation.createTranslator) {
      const translator = await window.translation.createTranslator({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      });
      
      const result = await translator.translate(text);
      return result;
    }

    throw new Error('Browser translation API not available');
  }

  /**
   * DeepL言語コード変換
   */
  convertToDeepLLanguageCode(langCode) {
    const mapping = {
      'ja': 'JA',
      'en': 'EN-US',
      'vi': 'VI'  // DeepLがベトナム語をサポートしていない場合は他の方法を使用
    };
    return mapping[langCode] || langCode.toUpperCase();
  }

  /**
   * フォールバック翻訳の取得
   */
  getFallbackTranslation(text, sourceLang, targetLang) {
    const key = `${sourceLang}-${targetLang}`;
    const translations = this.fallbackTranslations[key];
    
    if (translations && translations[text]) {
      return translations[text];
    }

    // 部分一致を試行
    if (translations) {
      for (const [original, translated] of Object.entries(translations)) {
        if (text.includes(original)) {
          return text.replace(original, translated);
        }
      }
    }

    return null;
  }

  /**
   * キャッシュから翻訳を取得
   */
  async getCachedTranslation(text, sourceLang, targetLang) {
    try {
      const tenantId = this.app.auth.user?.tenantId || 'default';
      const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
      
      const docRef = doc(this.db, 'translation_cache', cacheKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 有効期限チェック
        if (data.expiresAt && data.expiresAt.toDate() > new Date()) {
          return data;
        } else if (!data.expiresAt) {
          // 有効期限なしの場合は有効とみなす
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached translation:', error);
      return null;
    }
  }

  /**
   * 翻訳をキャッシュに保存
   */
  async cacheTranslation(sourceText, translatedText, sourceLang, targetLang, translationService) {
    try {
      const tenantId = this.app.auth.user?.tenantId || 'default';
      const cacheKey = this.generateCacheKey(sourceText, sourceLang, targetLang);
      
      const cacheData = {
        cacheKey,
        sourceText,
        translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        translationService: translationService || 'automatic',
        qualityScore: this.calculateQualityScore(sourceText, translatedText),
        manualVerified: false,
        tenantId,
        createdAt: serverTimestamp(),
        expiresAt: this.calculateExpirationDate()
      };

      await setDoc(doc(this.db, 'translation_cache', cacheKey), cacheData);
      
    } catch (error) {
      console.error('Error caching translation:', error);
    }
  }

  /**
   * キャッシュキーの生成
   */
  generateCacheKey(text, sourceLang, targetLang) {
    const content = `${text}_${sourceLang}_${targetLang}`;
    return btoa(encodeURIComponent(content)).replace(/[/+=]/g, '_');
  }

  /**
   * 品質スコアの計算（簡易版）
   */
  calculateQualityScore(sourceText, translatedText) {
    // 簡易的な品質スコア計算
    if (!sourceText || !translatedText) return 0.0;
    
    const lengthRatio = Math.min(sourceText.length, translatedText.length) / 
                        Math.max(sourceText.length, translatedText.length);
    
    // 基本的な品質スコア（0.0-1.0）
    return Math.round(lengthRatio * 85) / 100; // 0.85を基準スコアとする
  }

  /**
   * 有効期限の計算
   */
  calculateExpirationDate() {
    const now = new Date();
    const expirationDays = 30; // 30日間キャッシュ
    now.setDate(now.getDate() + expirationDays);
    return now;
  }

  /**
   * バッチ翻訳
   */
  async translateBatch(texts, sourceLang, targetLang) {
    const results = [];
    const batchSize = 10; // バッチサイズ
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const promises = batch.map(text => this.translateText(text, sourceLang, targetLang));
      
      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Batch translation error:', error);
        // エラーが発生した場合は個別に処理
        for (const text of batch) {
          try {
            const result = await this.translateText(text, sourceLang, targetLang);
            results.push(result);
          } catch (individualError) {
            console.error('Individual translation error:', individualError);
            results.push(text); // 翻訳失敗時は元のテキストを返す
          }
        }
      }
    }
    
    return results;
  }

  /**
   * 翻訳品質の向上
   */
  async improveTranslation(cacheKey, improvedTranslation, userId) {
    try {
      const docRef = doc(this.db, 'translation_cache', cacheKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await setDoc(docRef, {
          ...docSnap.data(),
          translatedText: improvedTranslation,
          manualVerified: true,
          verifiedBy: userId,
          verifiedAt: serverTimestamp(),
          qualityScore: 1.0 // 手動修正済みは最高品質とする
        });
        
        return { success: true };
      }

      return { success: false, error: 'Translation cache not found' };
    } catch (error) {
      console.error('Error improving translation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 翻訳統計の取得
   */
  async getTranslationStatistics() {
    try {
      const tenantId = this.app.auth.user?.tenantId || 'default';
      
      const q = query(
        collection(this.db, 'translation_cache'),
        where('tenantId', '==', tenantId)
      );
      
      const querySnapshot = await getDocs(q);
      const statistics = {
        totalTranslations: 0,
        manualVerified: 0,
        averageQuality: 0,
        languagePairs: {},
        translationServices: {}
      };

      let totalQuality = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        statistics.totalTranslations++;
        
        if (data.manualVerified) {
          statistics.manualVerified++;
        }
        
        totalQuality += data.qualityScore || 0;
        
        const langPair = `${data.sourceLanguage}-${data.targetLanguage}`;
        statistics.languagePairs[langPair] = (statistics.languagePairs[langPair] || 0) + 1;
        
        statistics.translationServices[data.translationService] = 
          (statistics.translationServices[data.translationService] || 0) + 1;
      });

      statistics.averageQuality = statistics.totalTranslations > 0 
        ? Math.round((totalQuality / statistics.totalTranslations) * 100) / 100 
        : 0;

      return statistics;
    } catch (error) {
      console.error('Error getting translation statistics:', error);
      return null;
    }
  }
}