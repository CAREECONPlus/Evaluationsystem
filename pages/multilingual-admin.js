/**
 * Multilingual Administration Page
 * 多言語管理画面
 */
import { MultilingualAPI } from '../api/multilingual-api.js';

export class MultilingualAdminPage {
  constructor(app) {
    this.app = app;
    this.multilingualAPI = new MultilingualAPI(app);
    this.currentLanguage = 'ja';
    this.currentTab = 'categories';
    this.editingItem = null;
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
                  <i class="fas fa-language me-2"></i>
                  <span data-i18n="nav.multilingual_admin">多言語管理</span>
                </h1>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                      <a href="#/dashboard" data-link data-i18n="nav.dashboard">ダッシュボード</a>
                    </li>
                    <li class="breadcrumb-item">
                      <a href="#/settings" data-link data-i18n="nav.settings">設定</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page" data-i18n="nav.multilingual_admin">多言語管理</li>
                  </ol>
                </nav>
              </div>
              <div>
                <button class="btn btn-primary me-2" id="setupInitialDataBtn">
                  <i class="fas fa-database me-2"></i>
                  <span data-i18n="multilingual.setup_initial_data">初期データ作成</span>
                </button>
                <button class="btn btn-success" id="migrateDataBtn">
                  <i class="fas fa-sync-alt me-2"></i>
                  <span data-i18n="multilingual.migrate_data">データ移行</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 言語選択 -->
        <div class="row mb-4">
          <div class="col">
            <div class="card">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h5 class="card-title mb-0" data-i18n="multilingual.current_language">現在の編集言語</h5>
                  </div>
                  <div class="col-md-6">
                    <select class="form-select" id="languageSelector">
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- タブナビゲーション -->
        <div class="row mb-4">
          <div class="col">
            <ul class="nav nav-tabs" id="multilingualTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories" type="button" role="tab">
                  <i class="fas fa-folder me-2"></i>
                  <span data-i18n="multilingual.categories">カテゴリ</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="job-types-tab" data-bs-toggle="tab" data-bs-target="#job-types" type="button" role="tab">
                  <i class="fas fa-briefcase me-2"></i>
                  <span data-i18n="multilingual.job_types">職種</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="evaluation-items-tab" data-bs-toggle="tab" data-bs-target="#evaluation-items" type="button" role="tab">
                  <i class="fas fa-clipboard-list me-2"></i>
                  <span data-i18n="multilingual.evaluation_items">評価項目</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="periods-tab" data-bs-toggle="tab" data-bs-target="#periods" type="button" role="tab">
                  <i class="fas fa-calendar me-2"></i>
                  <span data-i18n="multilingual.periods">評価期間</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- タブコンテンツ -->
        <div class="tab-content" id="multilingualTabContent">
          <!-- カテゴリタブ -->
          <div class="tab-pane fade show active" id="categories" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0" data-i18n="multilingual.categories_list">カテゴリ一覧</h5>
                    <button class="btn btn-primary btn-sm" id="addCategoryBtn">
                      <i class="fas fa-plus me-2"></i>
                      <span data-i18n="common.add_new">新規追加</span>
                    </button>
                  </div>
                  <div class="card-body">
                    <div id="categoriesContainer">
                      <div class="text-center py-4">
                        <div class="spinner-border" role="status">
                          <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0" data-i18n="multilingual.edit_category">カテゴリ編集</h5>
                  </div>
                  <div class="card-body">
                    <div id="categoryEditForm">
                      <p class="text-muted" data-i18n="multilingual.select_item_to_edit">編集するアイテムを選択してください</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 職種タブ -->
          <div class="tab-pane fade" id="job-types" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0" data-i18n="multilingual.job_types_list">職種一覧</h5>
                    <button class="btn btn-primary btn-sm" id="addJobTypeBtn">
                      <i class="fas fa-plus me-2"></i>
                      <span data-i18n="common.add_new">新規追加</span>
                    </button>
                  </div>
                  <div class="card-body">
                    <div id="jobTypesContainer">
                      <div class="text-center py-4">
                        <div class="spinner-border" role="status">
                          <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0" data-i18n="multilingual.edit_job_type">職種編集</h5>
                  </div>
                  <div class="card-body">
                    <div id="jobTypeEditForm">
                      <p class="text-muted" data-i18n="multilingual.select_item_to_edit">編集するアイテムを選択してください</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 評価項目タブ -->
          <div class="tab-pane fade" id="evaluation-items" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0" data-i18n="multilingual.evaluation_items_list">評価項目一覧</h5>
                    <button class="btn btn-primary btn-sm" id="addEvaluationItemBtn">
                      <i class="fas fa-plus me-2"></i>
                      <span data-i18n="common.add_new">新規追加</span>
                    </button>
                  </div>
                  <div class="card-body">
                    <div id="evaluationItemsContainer">
                      <div class="text-center py-4">
                        <div class="spinner-border" role="status">
                          <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0" data-i18n="multilingual.edit_evaluation_item">評価項目編集</h5>
                  </div>
                  <div class="card-body">
                    <div id="evaluationItemEditForm">
                      <p class="text-muted" data-i18n="multilingual.select_item_to_edit">編集するアイテムを選択してください</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 評価期間タブ -->
          <div class="tab-pane fade" id="periods" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0" data-i18n="multilingual.periods_list">評価期間一覧</h5>
                    <button class="btn btn-primary btn-sm" id="addPeriodBtn">
                      <i class="fas fa-plus me-2"></i>
                      <span data-i18n="common.add_new">新規追加</span>
                    </button>
                  </div>
                  <div class="card-body">
                    <div id="periodsContainer">
                      <div class="text-center py-4">
                        <div class="spinner-border" role="status">
                          <span class="visually-hidden" data-i18n="common.loading">読み込み中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0" data-i18n="multilingual.edit_period">評価期間編集</h5>
                  </div>
                  <div class="card-body">
                    <div id="periodEditForm">
                      <p class="text-muted" data-i18n="multilingual.select_item_to_edit">編集するアイテムを選択してください</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 多言語編集モーダル -->
      <div class="modal fade" id="multilingualEditModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" data-i18n="multilingual.edit_multilingual">多言語編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs" id="languageTabs">
                <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#ja-tab" type="button">
                    日本語
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#en-tab" type="button">
                    English
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#vi-tab" type="button">
                    Tiếng Việt
                  </button>
                </li>
              </ul>
              <div class="tab-content mt-3" id="languageTabContent">
                <div class="tab-pane fade show active" id="ja-tab">
                  <div id="jaForm"></div>
                </div>
                <div class="tab-pane fade" id="en-tab">
                  <div id="enForm"></div>
                </div>
                <div class="tab-pane fade" id="vi-tab">
                  <div id="viForm"></div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.cancel">キャンセル</button>
              <button type="button" class="btn btn-primary" id="saveMultilingualBtn">
                <span data-i18n="common.save">保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.bindEvents();
    await this.loadCategoriesData();
    
    // 翻訳を適用
    if (this.app.i18n) {
      this.app.i18n.updateElement(document.querySelector('.container-fluid'));
    }
  }

  async bindEvents() {
    // 言語選択
    const languageSelector = document.getElementById('languageSelector');
    languageSelector?.addEventListener('change', (e) => {
      this.currentLanguage = e.target.value;
      this.refreshCurrentTab();
    });

    // タブ切り替え
    document.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.getAttribute('data-bs-target').replace('#', '');
      this.currentTab = tabId.replace('-', '_');
      this.refreshCurrentTab();
    });

    // 初期データセットアップ
    document.getElementById('setupInitialDataBtn')?.addEventListener('click', async () => {
      if (confirm(this.app.i18n.t('multilingual.confirm_setup_initial_data'))) {
        await this.setupInitialData();
      }
    });

    // データ移行
    document.getElementById('migrateDataBtn')?.addEventListener('click', async () => {
      if (confirm(this.app.i18n.t('multilingual.confirm_migrate_data'))) {
        await this.migrateData();
      }
    });

    // 新規追加ボタン
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.showEditModal('category'));
    document.getElementById('addJobTypeBtn')?.addEventListener('click', () => this.showEditModal('jobType'));
    document.getElementById('addEvaluationItemBtn')?.addEventListener('click', () => this.showEditModal('evaluationItem'));
    document.getElementById('addPeriodBtn')?.addEventListener('click', () => this.showEditModal('period'));

    // 保存ボタン
    document.getElementById('saveMultilingualBtn')?.addEventListener('click', () => this.saveMultilingualData());
  }

  async refreshCurrentTab() {
    switch (this.currentTab) {
      case 'categories':
        await this.loadCategoriesData();
        break;
      case 'job_types':
        await this.loadJobTypesData();
        break;
      case 'evaluation_items':
        await this.loadEvaluationItemsData();
        break;
      case 'periods':
        await this.loadPeriodsData();
        break;
    }
  }

  async loadCategoriesData() {
    try {
      const container = document.getElementById('categoriesContainer');
      if (!container) return;

      container.innerHTML = `
        <div class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">${this.app.i18n.t('common.loading')}</span>
          </div>
        </div>
      `;

      const categories = await this.multilingualAPI.getCategoriesI18n(this.currentLanguage);
      
      if (categories.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4">
            <p class="text-muted">${this.app.i18n.t('multilingual.no_categories')}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>${this.app.i18n.t('multilingual.category_name')}</th>
                <th>${this.app.i18n.t('multilingual.description')}</th>
                <th>${this.app.i18n.t('multilingual.display_order')}</th>
                <th>${this.app.i18n.t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(category => `
                <tr>
                  <td><strong>${this.app.sanitizeHtml(category.categoryName)}</strong></td>
                  <td>${this.app.sanitizeHtml(category.categoryDescription || '-')}</td>
                  <td>${category.displayOrder || 0}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="window.app.router.currentPageInstance.editCategory('${category.categoryId}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.app.router.currentPageInstance.deleteCategory('${category.categoryId}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Error loading categories:', error);
      document.getElementById('categoriesContainer').innerHTML = `
        <div class="alert alert-danger">
          ${this.app.i18n.t('common.error_loading_data')}
        </div>
      `;
    }
  }

  async loadJobTypesData() {
    try {
      const container = document.getElementById('jobTypesContainer');
      if (!container) return;

      const jobTypes = await this.multilingualAPI.getJobTypesI18n(this.currentLanguage);
      
      if (jobTypes.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4">
            <p class="text-muted">${this.app.i18n.t('multilingual.no_job_types')}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>${this.app.i18n.t('multilingual.job_type_name')}</th>
                <th>${this.app.i18n.t('multilingual.description')}</th>
                <th>${this.app.i18n.t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${jobTypes.map(jobType => `
                <tr>
                  <td><strong>${this.app.sanitizeHtml(jobType.jobTypeName)}</strong></td>
                  <td>${this.app.sanitizeHtml(jobType.jobTypeDescription || '-')}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="window.app.router.currentPageInstance.editJobType('${jobType.jobTypeId}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.app.router.currentPageInstance.deleteJobType('${jobType.jobTypeId}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Error loading job types:', error);
      document.getElementById('jobTypesContainer').innerHTML = `
        <div class="alert alert-danger">
          ${this.app.i18n.t('common.error_loading_data')}
        </div>
      `;
    }
  }

  async setupInitialData() {
    try {
      this.app.showLoading(this.app.i18n.t('multilingual.setting_up_data'));
      
      const result = await this.multilingualAPI.setupInitialI18nData();
      
      if (result.success) {
        this.app.showSuccess(this.app.i18n.t('multilingual.setup_completed'));
        await this.refreshCurrentTab();
      }
    } catch (error) {
      console.error('Error setting up initial data:', error);
      this.app.showError(this.app.i18n.t('multilingual.setup_error'));
    } finally {
      this.app.hideLoading();
    }
  }

  async migrateData() {
    try {
      this.app.showLoading(this.app.i18n.t('multilingual.migrating_data'));
      
      const result = await this.multilingualAPI.migrateExistingData();
      
      if (result.success) {
        this.app.showSuccess(this.app.i18n.t('multilingual.migration_completed'));
        await this.refreshCurrentTab();
      }
    } catch (error) {
      console.error('Error migrating data:', error);
      this.app.showError(this.app.i18n.t('multilingual.migration_error'));
    } finally {
      this.app.hideLoading();
    }
  }

  showEditModal(type, itemId = null) {
    // モーダル表示処理
    const modal = new bootstrap.Modal(document.getElementById('multilingualEditModal'));
    this.editingItem = { type, itemId };
    modal.show();
  }

  async saveMultilingualData() {
    // 保存処理
    try {
      this.app.showLoading(this.app.i18n.t('common.saving'));
      
      // フォームデータを収集して保存
      // 実装は編集対象のタイプによって分岐
      
      this.app.showSuccess(this.app.i18n.t('common.saved_successfully'));
      
      // モーダルを閉じて一覧を更新
      const modal = bootstrap.Modal.getInstance(document.getElementById('multilingualEditModal'));
      modal.hide();
      
      await this.refreshCurrentTab();
    } catch (error) {
      console.error('Error saving multilingual data:', error);
      this.app.showError(this.app.i18n.t('common.save_error'));
    } finally {
      this.app.hideLoading();
    }
  }
}