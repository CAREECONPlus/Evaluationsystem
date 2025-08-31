/**
 * Job Type Management Page
 * 職種管理ページ
 */

export class JobTypeManagementPage {
  constructor(app) {
    this.app = app;
    this.jobTypes = [];
    this.filteredJobTypes = [];
    this.currentEditingJobType = null;
    this.isLoading = false;
  }

  async render() {
    return `
      <div class="container-fluid">
        <!-- ページヘッダー -->
        <div class="row mb-4">
          <div class="col">
            <h1 class="h3 mb-3">
              <i class="fas fa-briefcase me-2"></i>
              職種管理
            </h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#/dashboard" data-link>ダッシュボード</a>
                </li>
                <li class="breadcrumb-item">設定</li>
                <li class="breadcrumb-item active" aria-current="page">職種管理</li>
              </ol>
            </nav>
          </div>
        </div>

        <!-- アクションバー -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" 
                     class="form-control" 
                     id="jobTypeSearchInput" 
                     placeholder="職種名で検索...">
            </div>
          </div>
          <div class="col-md-6 text-md-end mt-3 mt-md-0">
            <button class="btn btn-primary" id="addJobTypeBtn">
              <i class="fas fa-plus me-2"></i>
              新規職種追加
            </button>
            <button class="btn btn-outline-secondary ms-2" id="exportJobTypesBtn">
              <i class="fas fa-download me-2"></i>
              エクスポート
            </button>
          </div>
        </div>

        <!-- 統計カード -->
        <div class="row mb-4" id="jobTypeStats">
          <div class="col-md-3 mb-3">
            <div class="card border-primary">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">総職種数</h6>
                <h3 class="card-title mb-0">
                  <span id="totalJobTypes">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-success">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">有効な職種</h6>
                <h3 class="card-title mb-0 text-success">
                  <span id="activeJobTypes">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-warning">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">無効な職種</h6>
                <h3 class="card-title mb-0 text-warning">
                  <span id="inactiveJobTypes">0</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card border-info">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">カテゴリ数</h6>
                <h3 class="card-title mb-0 text-info">
                  <span id="categoryCount">0</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- 職種リスト -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">職種一覧</h5>
          </div>
          <div class="card-body">
            <div id="jobTypeTableContainer">
              <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">読み込み中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 職種編集モーダル -->
      <div class="modal fade" id="jobTypeModal" tabindex="-1" aria-labelledby="jobTypeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="jobTypeModalLabel">職種編集</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="jobTypeForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="jobTypeName" class="form-label">職種名 <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="jobTypeName" required>
                    <div class="invalid-feedback">職種名を入力してください</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="jobTypeCategory" class="form-label">カテゴリー</label>
                    <input type="text" class="form-control" id="jobTypeCategory" 
                           list="categoryList" placeholder="例: 建築、設備、仕上げ">
                    <datalist id="categoryList">
                      <option value="建築">
                      <option value="設備">
                      <option value="仕上げ">
                      <option value="土木">
                      <option value="その他">
                    </datalist>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="jobTypeCode" class="form-label">職種コード</label>
                    <input type="text" class="form-control" id="jobTypeCode" placeholder="例: JT001">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="jobTypeStatus" class="form-label">ステータス</label>
                    <select class="form-select" id="jobTypeStatus">
                      <option value="active">有効</option>
                      <option value="inactive">無効</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="jobTypeDescription" class="form-label">説明</label>
                  <textarea class="form-control" id="jobTypeDescription" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label for="jobTypeSkills" class="form-label">必要スキル</label>
                  <textarea class="form-control" id="jobTypeSkills" rows="3" 
                          placeholder="必要な資格やスキルを記入"></textarea>
                </div>
                <div class="mb-3">
                  <label for="jobTypeEvalItems" class="form-label">評価項目</label>
                  <textarea class="form-control" id="jobTypeEvalItems" rows="3" 
                          placeholder="この職種特有の評価項目を記入"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
              <button type="button" class="btn btn-primary" id="saveJobTypeBtn">保存</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init(params) {
    console.log('JobTypeManagement: Initializing...');
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // データの読み込み
    await this.loadJobTypes();
    
    // 統計情報の更新
    this.updateStatistics();
  }

  setupEventListeners() {
    // 検索
    const searchInput = document.getElementById('jobTypeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // 新規追加ボタン
    const addBtn = document.getElementById('addJobTypeBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddJobTypeModal());
    }

    // エクスポートボタン
    const exportBtn = document.getElementById('exportJobTypesBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportJobTypes());
    }

    // 保存ボタン
    const saveBtn = document.getElementById('saveJobTypeBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveJobType());
    }

    // フォームのバリデーション
    const form = document.getElementById('jobTypeForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveJobType();
      });
    }
  }

  async loadJobTypes() {
    this.isLoading = true;
    
    try {
      console.log('JobTypeManagement: Loading job types...');
      
      // APIからデータを取得（修正版）
      const response = await this.app.api.getJobTypes();
      
      // レスポンス形式に対応
      if (response && response.data) {
        this.jobTypes = response.data;
      } else if (Array.isArray(response)) {
        // 配列が直接返される場合（後方互換性）
        this.jobTypes = response;
      } else {
        console.warn('JobTypeManagement: Unexpected response format:', response);
        this.jobTypes = [];
      }
      
      this.filteredJobTypes = [...this.jobTypes];
      
      console.log('JobTypeManagement: Job types loaded:', this.jobTypes.length);
      
      // テーブルを更新
      this.renderJobTypeTable();
      
    } catch (error) {
      console.error('JobTypeManagement: Error loading job types:', error);
      this.app.showError('職種データの読み込みに失敗しました');
      
      // エラー時は空のテーブルを表示
      this.jobTypes = [];
      this.filteredJobTypes = [];
      this.renderJobTypeTable();
      
    } finally {
      this.isLoading = false;
    }
  }

  renderJobTypeTable() {
    const container = document.getElementById('jobTypeTableContainer');
    if (!container) return;

    if (this.filteredJobTypes.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">職種が登録されていません</p>
          <button class="btn btn-primary" onclick="document.getElementById('addJobTypeBtn').click()">
            <i class="fas fa-plus me-2"></i>職種を追加
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>職種名</th>
              <th>カテゴリー</th>
              <th>コード</th>
              <th>ステータス</th>
              <th>作成日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${this.filteredJobTypes.map(jobType => `
              <tr>
                <td>
                  <strong>${this.app.sanitizeHtml(jobType.name)}</strong>
                  ${jobType.description ? `<br><small class="text-muted">${this.app.sanitizeHtml(jobType.description)}</small>` : ''}
                </td>
                <td>
                  ${jobType.category ? `
                    <span class="badge bg-secondary">${this.app.sanitizeHtml(jobType.category)}</span>
                  ` : '-'}
                </td>
                <td>${jobType.code || '-'}</td>
                <td>
                  ${jobType.status === 'active' ? 
                    '<span class="badge bg-success">有効</span>' : 
                    '<span class="badge bg-warning">無効</span>'}
                </td>
                <td>${this.app.formatDate(jobType.createdAt)}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          onclick="window.app.router.currentPageInstance.editJobType('${jobType.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          onclick="window.app.router.currentPageInstance.deleteJobType('${jobType.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
      this.filteredJobTypes = [...this.jobTypes];
    } else {
      this.filteredJobTypes = this.jobTypes.filter(jobType => 
        jobType.name.toLowerCase().includes(term) ||
        (jobType.category && jobType.category.toLowerCase().includes(term)) ||
        (jobType.code && jobType.code.toLowerCase().includes(term))
      );
    }
    
    this.renderJobTypeTable();
  }

  showAddJobTypeModal() {
    this.currentEditingJobType = null;
    
    // フォームをリセット
    document.getElementById('jobTypeForm').reset();
    document.getElementById('jobTypeModalLabel').textContent = '新規職種追加';
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('jobTypeModal'));
    modal.show();
  }

  editJobType(jobTypeId) {
    const jobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    if (!jobType) return;
    
    this.currentEditingJobType = jobType;
    
    // フォームに値を設定
    document.getElementById('jobTypeName').value = jobType.name || '';
    document.getElementById('jobTypeCategory').value = jobType.category || '';
    document.getElementById('jobTypeCode').value = jobType.code || '';
    document.getElementById('jobTypeStatus').value = jobType.status || 'active';
    document.getElementById('jobTypeDescription').value = jobType.description || '';
    document.getElementById('jobTypeSkills').value = jobType.skills || '';
    document.getElementById('jobTypeEvalItems').value = jobType.evaluationItems || '';
    
    document.getElementById('jobTypeModalLabel').textContent = '職種編集';
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('jobTypeModal'));
    modal.show();
  }

  async saveJobType() {
    const form = document.getElementById('jobTypeForm');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    
    const jobTypeData = {
      name: document.getElementById('jobTypeName').value.trim(),
      category: document.getElementById('jobTypeCategory').value.trim(),
      code: document.getElementById('jobTypeCode').value.trim(),
      status: document.getElementById('jobTypeStatus').value,
      description: document.getElementById('jobTypeDescription').value.trim(),
      skills: document.getElementById('jobTypeSkills').value.trim(),
      evaluationItems: document.getElementById('jobTypeEvalItems').value.trim()
    };
    
    try {
      this.app.showLoading('保存中...');
      
      if (this.currentEditingJobType) {
        // 更新
        jobTypeData.id = this.currentEditingJobType.id;
        await this.app.api.saveJobType(jobTypeData);
        this.app.showSuccess('職種を更新しました');
      } else {
        // 新規作成
        await this.app.api.saveJobType(jobTypeData);
        this.app.showSuccess('職種を追加しました');
      }
      
      // モーダルを閉じる
      bootstrap.Modal.getInstance(document.getElementById('jobTypeModal')).hide();
      
      // データを再読み込み
      await this.loadJobTypes();
      this.updateStatistics();
      
    } catch (error) {
      console.error('JobTypeManagement: Error saving job type:', error);
      this.app.showError('職種の保存に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  async deleteJobType(jobTypeId) {
    const jobType = this.jobTypes.find(jt => jt.id === jobTypeId);
    if (!jobType) return;
    
    const confirmed = await this.app.confirm(
      `「${jobType.name}」を削除してもよろしいですか？`,
      '職種の削除'
    );
    
    if (!confirmed) return;
    
    try {
      this.app.showLoading('削除中...');
      
      // APIで削除（実装が必要な場合）
      // await this.app.api.deleteJobType(jobTypeId);
      
      // ローカルデータから削除
      this.jobTypes = this.jobTypes.filter(jt => jt.id !== jobTypeId);
      this.filteredJobTypes = this.filteredJobTypes.filter(jt => jt.id !== jobTypeId);
      
      this.renderJobTypeTable();
      this.updateStatistics();
      
      this.app.showSuccess('職種を削除しました');
      
    } catch (error) {
      console.error('JobTypeManagement: Error deleting job type:', error);
      this.app.showError('職種の削除に失敗しました');
    } finally {
      this.app.hideLoading();
    }
  }

  updateStatistics() {
    // 総職種数
    document.getElementById('totalJobTypes').textContent = this.jobTypes.length;
    
    // 有効な職種数
    const activeCount = this.jobTypes.filter(jt => jt.status === 'active').length;
    document.getElementById('activeJobTypes').textContent = activeCount;
    
    // 無効な職種数
    const inactiveCount = this.jobTypes.filter(jt => jt.status !== 'active').length;
    document.getElementById('inactiveJobTypes').textContent = inactiveCount;
    
    // カテゴリ数
    const categories = new Set(this.jobTypes.map(jt => jt.category).filter(c => c));
    document.getElementById('categoryCount').textContent = categories.size;
  }

  exportJobTypes() {
    try {
      // CSVデータを作成
      const headers = ['職種名', 'カテゴリー', 'コード', 'ステータス', '説明'];
      const rows = this.jobTypes.map(jt => [
        jt.name,
        jt.category || '',
        jt.code || '',
        jt.status === 'active' ? '有効' : '無効',
        jt.description || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // ダウンロード
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `職種一覧_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.app.showSuccess('エクスポートが完了しました');
      
    } catch (error) {
      console.error('JobTypeManagement: Export error:', error);
      this.app.showError('エクスポートに失敗しました');
    }
  }

  cleanup() {
    // イベントリスナーのクリーンアップ
    const searchInput = document.getElementById('jobTypeSearchInput');
    if (searchInput) {
      searchInput.removeEventListener('input', this.handleSearch);
    }
    
    // モーダルのクリーンアップ
    const modal = document.getElementById('jobTypeModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.dispose();
      }
    }
    
    console.log('JobTypeManagement: Cleanup completed');
  }
}
