/**
 * Translation Quality Management Page
 * 翻訳品質管理ページ
 */
import { TranslationService } from '../services/translation-service.js';

export class TranslationQualityManagementPage {
  constructor(app) {
    this.app = app;
    this.translationService = new TranslationService(app);
    this.currentFilter = 'all';
    this.currentLanguagePair = 'all';
    this.translations = [];
    this.filteredTranslations = [];
    this.statistics = null;
  }

  async render() {
    const isAdmin = this.app.auth.user?.role === 'admin';
    
    if (!isAdmin) {
      return `
        <div class="container-fluid py-4">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <span data-i18n="common.access_denied">この機能にはアクセス権限がありません。</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="container-fluid py-4">
        <!-- ヘッダー -->
        <div class="row mb-4">
          <div class="col">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="h3 mb-3">
                  <i class="fas fa-chart-line me-2"></i>
                  <span data-i18n="translation_quality.title">翻訳品質管理</span>
                </h1>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                      <a href="#/dashboard" data-link data-i18n="nav.dashboard">ダッシュボード</a>
                    </li>
                    <li class="breadcrumb-item">
                      <a href="#/multilingual-admin" data-link data-i18n="nav.multilingual_admin">多言語管理</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page" data-i18n="translation_quality.title">翻訳品質管理</li>
                  </ol>
                </nav>
              </div>
              <div>
                <button class="btn btn-primary" id="refreshDataBtn">
                  <i class="fas fa-sync-alt me-2"></i>
                  <span data-i18n="common.refresh">更新</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 統計情報 -->
        <div class="row mb-4" id="statisticsContainer">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="translation_quality.total_translations">総翻訳数</h6>
                <h3 class="card-title mb-0 text-primary" id="totalTranslations">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="translation_quality.manual_verified">手動検証済み</h6>
                <h3 class="card-title mb-0 text-success" id="manualVerified">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="translation_quality.average_quality">平均品質スコア</h6>
                <h3 class="card-title mb-0 text-warning" id="averageQuality">-</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted" data-i18n="translation_quality.needs_review">要レビュー</h6>
                <h3 class="card-title mb-0 text-info" id="needsReview">-</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- フィルタリングオプション -->
        <div class="row mb-4">
          <div class="col">
            <div class="card">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-3">
                    <label for="qualityFilter" class="form-label" data-i18n="translation_quality.filter_by_quality">品質でフィルタ</label>
                    <select class="form-select" id="qualityFilter">
                      <option value="all" data-i18n="common.all">すべて</option>
                      <option value="high" data-i18n="translation_quality.high_quality">高品質 (0.8+)</option>
                      <option value="medium" data-i18n="translation_quality.medium_quality">中品質 (0.5-0.8)</option>
                      <option value="low" data-i18n="translation_quality.low_quality">低品質 (<0.5)</option>
                      <option value="unverified" data-i18n="translation_quality.unverified">未検証</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label for="languagePairFilter" class="form-label" data-i18n="translation_quality.language_pair">言語ペア</label>
                    <select class="form-select" id="languagePairFilter">
                      <option value="all" data-i18n="common.all">すべて</option>
                      <option value="ja-en">日本語 → 英語</option>
                      <option value="ja-vi">日本語 → ベトナム語</option>
                      <option value="en-ja">英語 → 日本語</option>
                      <option value="en-vi">英語 → ベトナム語</option>
                      <option value="vi-ja">ベトナム語 → 日本語</option>
                      <option value="vi-en">ベトナム語 → 英語</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label for="serviceFilter" class="form-label" data-i18n="translation_quality.translation_service">翻訳サービス</label>
                    <select class="form-select" id="serviceFilter">
                      <option value="all" data-i18n="common.all">すべて</option>
                      <option value="automatic" data-i18n="translation_quality.automatic">自動翻訳</option>
                      <option value="fallback" data-i18n="translation_quality.fallback">フォールバック</option>
                      <option value="manual" data-i18n="translation_quality.manual">手動翻訳</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <div class="d-flex gap-2 mt-4">
                      <button class="btn btn-outline-secondary" id="resetFiltersBtn">
                        <i class="fas fa-times me-2"></i>
                        <span data-i18n="common.reset">リセット</span>
                      </button>
                      <button class="btn btn-outline-info" id="exportReportBtn">
                        <i class="fas fa-download me-2"></i>
                        <span data-i18n="common.export">エクスポート</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 翻訳一覧 -->
        <div class="row">
          <div class="col">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0" data-i18n="translation_quality.translations_list">翻訳一覧</h5>
                <div class="d-flex align-items-center">
                  <span class="text-muted me-3" id="translationsCount">0件</span>
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-secondary active" id="listViewBtn">
                      <i class="fas fa-list"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="cardViewBtn">
                      <i class="fas fa-th"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div id="translationsContainer">
                  <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 翻訳編集モーダル -->
      <div class="modal fade" id="editTranslationModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="translation_quality.edit_translation">翻訳の編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="editTranslationForm">
                <div class="mb-3">
                  <label class="form-label" data-i18n="translation_quality.original_text">原文</label>
                  <textarea class="form-control" id="originalText" rows="3" readonly></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label" data-i18n="translation_quality.current_translation">現在の翻訳</label>
                  <textarea class="form-control" id="currentTranslation" rows="3" readonly></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label" data-i18n="translation_quality.improved_translation">改善された翻訳</label>
                  <textarea class="form-control" id="improvedTranslation" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label" data-i18n="translation_quality.quality_score">品質スコア</label>
                  <div class="d-flex align-items-center">
                    <input type="range" class="form-range me-3" id="qualityScore" min="0" max="100" value="80">
                    <span id="qualityScoreDisplay">0.80</span>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label" data-i18n="translation_quality.improvement_notes">改善メモ</label>
                  <textarea class="form-control" id="improvementNotes" rows="2" placeholder="改善点や修正理由を記入..."></textarea>
                </div>
                <input type="hidden" id="editingCacheKey">
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel">キャンセル</button>
              <button type="button" class="btn btn-primary" id="saveTranslationBtn">
                <span data-i18n="common.save">保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 品質分析モーダル -->
      <div class="modal fade" id="qualityAnalysisModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="translation_quality.quality_analysis">品質分析</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="qualityAnalysisContent">
                <!-- 品質分析チャート等がここに表示される -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.bindEvents();
    await this.loadData();
    
    // 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateElement(document.querySelector('.container-fluid'));
    }
  }

  async bindEvents() {
    // フィルタ変更イベント
    document.getElementById('qualityFilter')?.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.filterTranslations();
    });

    document.getElementById('languagePairFilter')?.addEventListener('change', (e) => {
      this.currentLanguagePair = e.target.value;
      this.filterTranslations();
    });

    document.getElementById('serviceFilter')?.addEventListener('change', (e) => {
      this.currentService = e.target.value;
      this.filterTranslations();
    });

    // ボタンイベント
    document.getElementById('refreshDataBtn')?.addEventListener('click', () => this.loadData());
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => this.resetFilters());
    document.getElementById('exportReportBtn')?.addEventListener('click', () => this.exportReport());

    // モーダル関連イベント
    document.getElementById('saveTranslationBtn')?.addEventListener('click', () => this.saveImprovedTranslation());

    // 品質スコアスライダー
    document.getElementById('qualityScore')?.addEventListener('input', (e) => {
      const value = e.target.value / 100;
      document.getElementById('qualityScoreDisplay').textContent = value.toFixed(2);
    });
  }

  async loadData() {
    try {
      this.app.showLoading(this.app.i18n.t('common.loading'));
      
      // 統計情報とキャッシュデータを並行取得
      const [statistics, translations] = await Promise.all([
        this.translationService.getTranslationStatistics(),
        this.getTranslationCacheData()
      ]);

      this.statistics = statistics;
      this.translations = translations;
      
      this.updateStatistics();
      this.filterTranslations();
      
    } catch (error) {
      console.error('Error loading translation quality data:', error);
      this.app.showError(this.app.i18n.t('common.error_loading_data'));
    } finally {
      this.app.hideLoading();
    }
  }

  async getTranslationCacheData() {
    try {
      const tenantId = this.app.auth.user?.tenantId || 'default';
      const response = await fetch('/api/translation-cache', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.app.auth.user.getIdToken()}`,
          'X-Tenant-ID': tenantId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translation cache data');
      }

      const data = await response.json();
      return data.translations || [];
    } catch (error) {
      console.error('Error fetching translation cache:', error);
      // Firestoreから直接取得するフォールバック
      return [];
    }
  }

  updateStatistics() {
    if (!this.statistics) return;

    document.getElementById('totalTranslations').textContent = this.statistics.totalTranslations.toLocaleString();
    document.getElementById('manualVerified').textContent = this.statistics.manualVerified.toLocaleString();
    document.getElementById('averageQuality').textContent = this.statistics.averageQuality.toFixed(2);
    
    const needsReview = this.translations.filter(t => t.qualityScore < 0.6 && !t.manualVerified).length;
    document.getElementById('needsReview').textContent = needsReview.toLocaleString();
  }

  filterTranslations() {
    let filtered = [...this.translations];

    // 品質フィルタ
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(t => {
        switch (this.currentFilter) {
          case 'high': return t.qualityScore >= 0.8;
          case 'medium': return t.qualityScore >= 0.5 && t.qualityScore < 0.8;
          case 'low': return t.qualityScore < 0.5;
          case 'unverified': return !t.manualVerified;
          default: return true;
        }
      });
    }

    // 言語ペアフィルタ
    if (this.currentLanguagePair !== 'all') {
      filtered = filtered.filter(t => `${t.sourceLanguage}-${t.targetLanguage}` === this.currentLanguagePair);
    }

    // サービスフィルタ
    if (this.currentService !== 'all') {
      filtered = filtered.filter(t => t.translationService === this.currentService);
    }

    this.filteredTranslations = filtered;
    this.renderTranslationsList();
  }

  renderTranslationsList() {
    const container = document.getElementById('translationsContainer');
    const count = document.getElementById('translationsCount');
    
    count.textContent = `${this.filteredTranslations.length}件`;

    if (this.filteredTranslations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-language fa-3x text-muted mb-3"></i>
          <p class="text-muted" data-i18n="translation_quality.no_translations">該当する翻訳が見つかりません</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th data-i18n="translation_quality.source_text">原文</th>
              <th data-i18n="translation_quality.translated_text">翻訳文</th>
              <th data-i18n="translation_quality.languages">言語</th>
              <th data-i18n="translation_quality.quality">品質</th>
              <th data-i18n="translation_quality.service">サービス</th>
              <th data-i18n="translation_quality.status">状態</th>
              <th data-i18n="common.actions">操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredTranslations.map(translation => `
              <tr>
                <td>
                  <div class="text-truncate" style="max-width: 200px;" title="${this.app.sanitizeHtml(translation.sourceText)}">
                    ${this.app.sanitizeHtml(translation.sourceText.substring(0, 50))}${translation.sourceText.length > 50 ? '...' : ''}
                  </div>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 200px;" title="${this.app.sanitizeHtml(translation.translatedText)}">
                    ${this.app.sanitizeHtml(translation.translatedText.substring(0, 50))}${translation.translatedText.length > 50 ? '...' : ''}
                  </div>
                </td>
                <td>
                  <small class="text-muted">${translation.sourceLanguage} → ${translation.targetLanguage}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="progress me-2" style="width: 60px; height: 8px;">
                      <div class="progress-bar ${this.getQualityBadgeClass(translation.qualityScore)}" 
                           style="width: ${translation.qualityScore * 100}%"></div>
                    </div>
                    <small>${(translation.qualityScore || 0).toFixed(2)}</small>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary">${translation.translationService}</span>
                </td>
                <td>
                  ${translation.manualVerified 
                    ? '<span class="badge bg-success"><i class="fas fa-check me-1"></i>検証済み</span>'
                    : '<span class="badge bg-warning">未検証</span>'
                  }
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="window.app.router.currentPageInstance.editTranslation('${translation.cacheKey}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="window.app.router.currentPageInstance.analyzeQuality('${translation.cacheKey}')">
                      <i class="fas fa-chart-bar"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;

    // 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateElement(container);
    }
  }

  getQualityBadgeClass(score) {
    if (score >= 0.8) return 'bg-success';
    if (score >= 0.5) return 'bg-warning';
    return 'bg-danger';
  }

  editTranslation(cacheKey) {
    const translation = this.filteredTranslations.find(t => t.cacheKey === cacheKey);
    if (!translation) return;

    // モーダルにデータを設定
    document.getElementById('originalText').value = translation.sourceText;
    document.getElementById('currentTranslation').value = translation.translatedText;
    document.getElementById('improvedTranslation').value = translation.translatedText;
    document.getElementById('qualityScore').value = (translation.qualityScore || 0.5) * 100;
    document.getElementById('qualityScoreDisplay').textContent = (translation.qualityScore || 0.5).toFixed(2);
    document.getElementById('editingCacheKey').value = cacheKey;

    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('editTranslationModal'));
    modal.show();
  }

  async saveImprovedTranslation() {
    try {
      const cacheKey = document.getElementById('editingCacheKey').value;
      const improvedTranslation = document.getElementById('improvedTranslation').value.trim();
      const qualityScore = document.getElementById('qualityScore').value / 100;
      const notes = document.getElementById('improvementNotes').value.trim();

      if (!improvedTranslation) {
        this.app.showError('改善された翻訳を入力してください');
        return;
      }

      this.app.showLoading('翻訳を保存中...');

      const result = await this.translationService.improveTranslation(
        cacheKey, 
        improvedTranslation, 
        this.app.auth.user.uid
      );

      if (result.success) {
        this.app.showSuccess('翻訳が改善されました');
        
        // モーダルを閉じる
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTranslationModal'));
        modal.hide();
        
        // データを再読み込み
        await this.loadData();
      } else {
        this.app.showError(result.error || '翻訳の保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving improved translation:', error);
      this.app.showError('翻訳の保存中にエラーが発生しました');
    } finally {
      this.app.hideLoading();
    }
  }

  resetFilters() {
    this.currentFilter = 'all';
    this.currentLanguagePair = 'all';
    this.currentService = 'all';

    document.getElementById('qualityFilter').value = 'all';
    document.getElementById('languagePairFilter').value = 'all';
    document.getElementById('serviceFilter').value = 'all';

    this.filterTranslations();
  }

  async exportReport() {
    try {
      const reportData = {
        statistics: this.statistics,
        translations: this.filteredTranslations,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation-quality-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.app.showSuccess('レポートをエクスポートしました');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.app.showError('レポートのエクスポートに失敗しました');
    }
  }
}