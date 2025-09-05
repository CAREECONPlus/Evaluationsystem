# 多言語対応フレームワーク設計書

## 概要

本文書は建設業評価管理システムの包括的な多言語対応フレームワークの設計指針を定めています。段階的実装により短期・中期・長期の目標を達成し、拡張性とメンテナンス性を両立します。

## 設計思想

### コアプリンシパル
1. **段階的実装**: 即効性から長期戦略まで3段階で実装
2. **ハイブリッドアプローチ**: 静的翻訳、データベース多言語、自動翻訳の組み合わせ
3. **パフォーマンス重視**: キャッシュ戦略による高速化
4. **拡張性確保**: 新言語追加の容易性
5. **運用効率**: 翻訳管理の自動化

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    Multilingual Framework                   │
├─────────────────────────────────────────────────────────────┤
│  Phase 1: Static Translation Layer (i18n.js)               │
│  ├─ UI固定文言 (ボタン、ラベル、メッセージ)                    │
│  ├─ data-i18n属性による動的適用                              │
│  └─ 3言語対応 (日本語、英語、ベトナム語)                       │
├─────────────────────────────────────────────────────────────┤
│  Phase 2: Database Multilingual Layer                      │
│  ├─ マスターデータ多言語テーブル                               │
│  ├─ 評価項目・カテゴリの多言語管理                            │
│  └─ 管理画面での多言語入力機能                               │
├─────────────────────────────────────────────────────────────┤
│  Phase 3: Dynamic Translation Layer                        │
│  ├─ 自動翻訳API連携 (Google Translate, DeepL)               │
│  ├─ ユーザー入力内容の翻訳キャッシュ                          │
│  └─ 翻訳品質管理・手動修正機能                               │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: 静的翻訳レイヤー（完了済み）

### 実装内容
- **i18n.jsの拡張**: 包括的な翻訳キー体系
- **data-i18n属性の追加**: 静的HTML要素への翻訳属性
- **動的コンテンツの翻訳**: JavaScript生成要素の翻訳処理
- **3言語完全対応**: 日本語、英語、ベトナム語

### 翻訳対象項目
- ナビゲーション・メニュー
- ページタイトル・ヘッダー
- フォーム・ラベル
- ボタン・リンク
- エラーメッセージ
- ステータス表示
- 統計情報・サマリー

### 技術詳細
```javascript
// 翻訳適用パターン
// 1. 静的HTML要素
<span data-i18n="evaluations.title">評価一覧</span>

// 2. 動的生成要素
container.innerHTML = `<span>${this.app.i18n.t('common.loading')}</span>`;
this.app.i18n.updateElement(container);

// 3. プレースホルダー
<input data-i18n-placeholder="evaluations.search_placeholder">
```

## Phase 2: データベース多言語レイヤー

### データベース設計

#### 評価項目多言語テーブル
```sql
CREATE TABLE evaluation_items_i18n (
    item_id VARCHAR(50) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    category_name VARCHAR(100),
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, language_code),
    INDEX idx_language (language_code),
    INDEX idx_category (category_name, language_code)
);
```

#### カテゴリ多言語テーブル
```sql
CREATE TABLE categories_i18n (
    category_id VARCHAR(50) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (category_id, language_code),
    INDEX idx_language (language_code),
    INDEX idx_display_order (display_order)
);
```

#### 職種多言語テーブル
```sql
CREATE TABLE job_types_i18n (
    job_type_id VARCHAR(50) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    job_type_name VARCHAR(100) NOT NULL,
    job_type_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (job_type_id, language_code),
    INDEX idx_language (language_code)
);
```

### API拡張

#### 多言語データ取得API
```javascript
// API拡張例
class MultilingualAPI {
  async getEvaluationItemsI18n(language = 'ja') {
    const query = `
      SELECT item_id, category_name, item_name, item_description
      FROM evaluation_items_i18n 
      WHERE language_code = ? 
      ORDER BY category_name, sort_order
    `;
    return await this.db.query(query, [language]);
  }
  
  async getCategoriesI18n(language = 'ja') {
    const query = `
      SELECT category_id, category_name, category_description
      FROM categories_i18n 
      WHERE language_code = ? 
      ORDER BY display_order
    `;
    return await this.db.query(query, [language]);
  }
}
```

### 管理画面機能

#### 多言語入力フォーム
```javascript
// 管理画面コンポーネント例
class MultilingualItemEditor {
  render() {
    return `
      <div class="multilingual-editor">
        <ul class="nav nav-tabs">
          <li><a href="#ja" data-toggle="tab">日本語</a></li>
          <li><a href="#en" data-toggle="tab">English</a></li>
          <li><a href="#vi" data-toggle="tab">Tiếng Việt</a></li>
        </ul>
        <div class="tab-content">
          <div class="tab-pane" id="ja">
            <input name="item_name_ja" placeholder="項目名（日本語）">
            <textarea name="item_description_ja" placeholder="説明（日本語）"></textarea>
          </div>
          <!-- 他言語タブ -->
        </div>
      </div>
    `;
  }
}
```

## Phase 3: 動的翻訳レイヤー

### 自動翻訳API連携

#### Google Translate API統合
```javascript
class AutoTranslationService {
  constructor() {
    this.googleTranslate = new GoogleTranslateAPI(process.env.GOOGLE_TRANSLATE_KEY);
    this.deeplAPI = new DeepLAPI(process.env.DEEPL_API_KEY);
    this.cache = new TranslationCache();
  }
  
  async translateUserContent(text, sourceLang, targetLang) {
    // キャッシュチェック
    const cacheKey = this.generateCacheKey(text, sourceLang, targetLang);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // 翻訳実行
    const translation = await this.googleTranslate.translate(text, {
      from: sourceLang,
      to: targetLang
    });
    
    // キャッシュ保存
    await this.cache.set(cacheKey, translation, '7d');
    return translation;
  }
}
```

#### 翻訳キャッシュシステム
```sql
CREATE TABLE translation_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language VARCHAR(5) NOT NULL,
    target_language VARCHAR(5) NOT NULL,
    translation_service VARCHAR(50) NOT NULL,
    quality_score DECIMAL(3,2),
    manual_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_languages (source_language, target_language),
    INDEX idx_expires (expires_at)
);
```

### ユーザー入力内容の翻訳

#### 評価コメントの多言語対応
```javascript
class EvaluationComment {
  async saveWithTranslation(comment, userId, evaluationId) {
    const userLang = await this.getUserLanguage(userId);
    const otherLanguages = ['ja', 'en', 'vi'].filter(lang => lang !== userLang);
    
    // 原文保存
    const commentId = await this.saveComment({
      evaluation_id: evaluationId,
      user_id: userId,
      comment_text: comment,
      language: userLang,
      is_original: true
    });
    
    // 他言語への翻訳
    for (const targetLang of otherLanguages) {
      const translatedText = await this.translationService.translateUserContent(
        comment, userLang, targetLang
      );
      
      await this.saveComment({
        evaluation_id: evaluationId,
        user_id: userId,
        comment_text: translatedText,
        language: targetLang,
        is_original: false,
        original_comment_id: commentId
      });
    }
    
    return commentId;
  }
}
```

### 翻訳品質管理

#### 手動修正機能
```javascript
class TranslationQualityManager {
  async submitCorrection(cacheKey, correctedText, userId) {
    // 修正内容を保存
    await this.db.query(`
      UPDATE translation_cache 
      SET translated_text = ?, 
          manual_verified = TRUE, 
          verified_by = ?, 
          verified_at = NOW() 
      WHERE cache_key = ?
    `, [correctedText, userId, cacheKey]);
    
    // 学習データとして記録
    await this.recordCorrectionForLearning(cacheKey, correctedText);
  }
}
```

## 実装スケジュール

### Phase 1: 即効性（完了済み）
- ✅ 評価一覧ページの翻訳修正
- ✅ 動的コンテンツの翻訳処理
- ✅ 3言語翻訳キーの追加

### Phase 2: 中期（2-3ヶ月）
- [ ] データベース多言語テーブル設計・構築
- [ ] マスターデータ管理画面の開発
- [ ] API多言語対応の実装
- [ ] 既存データの多言語化・移行

### Phase 3: 長期（4-6ヶ月）
- [ ] 自動翻訳APIの統合
- [ ] 翻訳キャッシュシステムの構築
- [ ] 翻訳品質管理機能の開発
- [ ] パフォーマンス最適化

## パフォーマンス考慮事項

### キャッシュ戦略
1. **静的翻訳**: ブラウザキャッシュ + CDN
2. **データベース多言語**: Redis + クエリ最適化
3. **動的翻訳**: Memcached + 期限付きキャッシュ

### 最適化手法
```javascript
// 遅延読み込み
const lazyTranslation = {
  async loadTranslations(language) {
    if (this.loadedLanguages.has(language)) return;
    
    const translations = await import(`./translations/${language}.js`);
    this.addTranslations(language, translations);
    this.loadedLanguages.add(language);
  }
};

// バッチ翻訳
const batchTranslation = {
  async translateBatch(texts, sourceLang, targetLang) {
    const uncachedTexts = await this.filterUncached(texts);
    const translations = await this.translationAPI.translateBatch(uncachedTexts);
    await this.cacheBatch(translations);
    return this.combineCachedAndNew(texts, translations);
  }
};
```

## 監視・メトリクス

### 翻訳品質指標
- 翻訳精度率
- ユーザー修正率
- 翻訳キャッシュヒット率
- 翻訳API使用量・コスト

### パフォーマンス指標
- 翻訳処理時間
- ページ読み込み時間（言語別）
- データベースクエリ実行時間
- キャッシュ効果率

## 将来拡張

### 新言語追加プロセス
1. 翻訳キーファイルの作成
2. データベース多言語テーブルへのデータ追加
3. フロントエンド言語選択UIの更新
4. 翻訳品質検証・調整

### AI翻訳機能の進化
- ChatGPT API連携による文脈考慮翻訳
- 業界特化用語集の機械学習
- リアルタイム翻訳品質評価

この設計書に基づき、段階的で持続可能な多言語対応システムを構築し、グローバルな建設業評価管理を実現します。