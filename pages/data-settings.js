export class DataSettingsPage {
  constructor(app) {
    this.app = app;
    this.currentLanguage = app.getCurrentLanguage();
    this.translations = app.translations;
    this.currentCategory = 'evaluation-items';
  }

  async render() {
    const t = this.translations[this.currentLanguage];
    return `
      <div class="data-settings-page">
        <div class="page-header">
          <h1>${t.dataSettings}</h1>
          <p>${t.dataSettingsDescription}</p>
        </div>
        
        <div class="settings-navigation">
          <button class="nav-btn ${this.currentCategory === 'evaluation-items' ? 'active' : ''}" 
                  data-category="evaluation-items">
            ${t.evaluationItems}
          </button>
          <button class="nav-btn ${this.currentCategory === 'categories' ? 'active' : ''}" 
                  data-category="categories">
            ${t.categories}
          </button>
          <button class="nav-btn ${this.currentCategory === 'job-types' ? 'active' : ''}" 
                  data-category="job-types">
            ${t.jobTypes}
          </button>
          <button class="nav-btn ${this.currentCategory === 'benchmarks' ? 'active' : ''}" 
                  data-category="benchmarks">
            ${t.benchmarks}
          </button>
        </div>

        <div class="settings-content">
          <div id="evaluation-items-section" class="settings-section ${this.currentCategory === 'evaluation-items' ? 'active' : ''}">
            <div class="section-header">
              <h2>${t.evaluationItems}</h2>
              <button class="btn btn-primary" id="add-item-btn">
                ${t.addEvaluationItem}
              </button>
            </div>
            <div class="evaluation-items-list" id="evaluation-items-list"></div>
          </div>

          <div id="categories-section" class="settings-section ${this.currentCategory === 'categories' ? 'active' : ''}">
            <div class="section-header">
              <h2>${t.categories}</h2>
              <button class="btn btn-primary" id="add-category-btn">
                ${t.addCategory}
              </button>
            </div>
            <div class="categories-list" id="categories-list"></div>
          </div>

          <div id="job-types-section" class="settings-section ${this.currentCategory === 'job-types' ? 'active' : ''}">
            <div class="section-header">
              <h2>${t.jobTypes}</h2>
              <button class="btn btn-primary" id="add-job-type-btn">
                ${t.addJobType}
              </button>
            </div>
            <div class="job-types-list" id="job-types-list"></div>
          </div>

          <div id="benchmarks-section" class="settings-section ${this.currentCategory === 'benchmarks' ? 'active' : ''}">
            <div class="section-header">
              <h2>${t.benchmarks}</h2>
              <button class="btn btn-primary" id="add-benchmark-btn">
                ${t.addBenchmark}
              </button>
            </div>
            <div class="benchmarks-list" id="benchmarks-list"></div>
          </div>
        </div>
      </div>

      <!-- Modal for editing items -->
      <div id="edit-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">${t.editItem}</h3>
            <span class="close" id="modal-close">&times;</span>
          </div>
          <div class="modal-body" id="modal-body">
            <!-- Dynamic content will be inserted here -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel">${t.cancel}</button>
            <button class="btn btn-primary" id="modal-save">${t.save}</button>
          </div>
        </div>
      </div>

      <style>
        .data-settings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .page-header p {
          color: #7f8c8d;
          font-size: 14px;
        }

        .settings-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .nav-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-btn:hover {
          color: #3498db;
        }

        .nav-btn.active {
          color: #3498db;
          border-bottom-color: #3498db;
        }

        .settings-section {
          display: none;
        }

        .settings-section.active {
          display: block;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          color: #2c3e50;
          margin: 0;
        }

        .data-list {
          display: grid;
          gap: 15px;
        }

        .data-item {
          background: white;
          border: 1px solid #ecf0f1;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .data-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .data-item-title {
          color: #2c3e50;
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }

        .data-item-actions {
          display: flex;
          gap: 10px;
        }

        .btn-icon {
          padding: 6px 10px;
          font-size: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit {
          background: #3498db;
          color: white;
        }

        .btn-edit:hover {
          background: #2980b9;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
        }

        .btn-delete:hover {
          background: #c0392b;
        }

        .data-item-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          color: #7f8c8d;
          font-size: 14px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-weight: 600;
          margin-bottom: 2px;
          color: #34495e;
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
        }

        .modal-content {
          background-color: white;
          margin: 5% auto;
          padding: 0;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #ecf0f1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .close {
          color: #aaa;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
        }

        .close:hover {
          color: #e74c3c;
        }

        .modal-body {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #ecf0f1;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #34495e;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group textarea {
          min-height: 80px;
          resize: vertical;
        }

        .language-tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 15px;
        }

        .lang-tab {
          padding: 8px 15px;
          background: #ecf0f1;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .lang-tab.active {
          background: #3498db;
          color: white;
        }

        .lang-content {
          display: none;
        }

        .lang-content.active {
          display: block;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .empty-state h3 {
          margin-bottom: 10px;
          color: #95a5a6;
        }

        @media (max-width: 768px) {
          .settings-navigation {
            flex-wrap: wrap;
          }
          
          .nav-btn {
            font-size: 12px;
            padding: 8px 15px;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .data-item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .data-item-info {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  async afterRender() {
    await this.loadCurrentData();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchCategory(e.target.dataset.category);
      });
    });

    // Add buttons
    document.getElementById('add-item-btn')?.addEventListener('click', () => {
      this.openModal('add', 'evaluation-item');
    });
    
    document.getElementById('add-category-btn')?.addEventListener('click', () => {
      this.openModal('add', 'category');
    });
    
    document.getElementById('add-job-type-btn')?.addEventListener('click', () => {
      this.openModal('add', 'job-type');
    });
    
    document.getElementById('add-benchmark-btn')?.addEventListener('click', () => {
      this.openModal('add', 'benchmark');
    });

    // Modal controls
    document.getElementById('modal-close')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    document.getElementById('modal-cancel')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    document.getElementById('modal-save')?.addEventListener('click', () => {
      this.saveModalData();
    });

    // Close modal on outside click
    document.getElementById('edit-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal') {
        this.closeModal();
      }
    });
  }

  async loadCurrentData() {
    try {
      await Promise.all([
        this.loadEvaluationItems(),
        this.loadCategories(),
        this.loadJobTypes(),
        this.loadBenchmarks()
      ]);
    } catch (error) {
      console.error('Error loading data settings:', error);
      this.showError('データの読み込み中にエラーが発生しました');
    }
  }

  async loadEvaluationItems() {
    const container = document.getElementById('evaluation-items-list');
    if (!container) return;

    try {
      // Try to load real data first, fallback to mock if needed
      let items = [];
      try {
        items = await this.app.api.getEvaluationItemsI18n();
      } catch (error) {
        console.log('Using fallback evaluation items data');
        items = this.generateFallbackEvaluationItems();
      }

      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>評価項目が設定されていません</h3>
            <p>「評価項目を追加」ボタンから新しい項目を作成してください。</p>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(item => `
        <div class="data-item">
          <div class="data-item-header">
            <h4 class="data-item-title">${item.itemName || 'Unknown Item'}</h4>
            <div class="data-item-actions">
              <button class="btn-icon btn-edit" onclick="dataSettingsPage.editItem('${item.itemId}', 'evaluation-item')">
                編集
              </button>
              <button class="btn-icon btn-delete" onclick="dataSettingsPage.deleteItem('${item.itemId}', 'evaluation-item')">
                削除
              </button>
            </div>
          </div>
          <div class="data-item-info">
            <div class="info-row">
              <span class="info-label">カテゴリ</span>
              <span>${item.categoryName || '未分類'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">説明</span>
              <span>${item.itemDescription || '説明なし'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">並び順</span>
              <span>${item.sortOrder || 0}</span>
            </div>
            <div class="info-row">
              <span class="info-label">言語</span>
              <span>${item.languageCode}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading evaluation items:', error);
      container.innerHTML = '<div class="empty-state"><h3>データの読み込みに失敗しました</h3></div>';
    }
  }

  async loadCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    try {
      let categories = [];
      try {
        categories = await this.app.api.getCategoriesI18n();
      } catch (error) {
        console.log('Using fallback categories data');
        categories = this.generateFallbackCategories();
      }

      if (categories.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>カテゴリが設定されていません</h3>
            <p>「カテゴリを追加」ボタンから新しいカテゴリを作成してください。</p>
          </div>
        `;
        return;
      }

      container.innerHTML = categories.map(category => `
        <div class="data-item">
          <div class="data-item-header">
            <h4 class="data-item-title">${category.categoryName || 'Unknown Category'}</h4>
            <div class="data-item-actions">
              <button class="btn-icon btn-edit" onclick="dataSettingsPage.editItem('${category.categoryId}', 'category')">
                編集
              </button>
              <button class="btn-icon btn-delete" onclick="dataSettingsPage.deleteItem('${category.categoryId}', 'category')">
                削除
              </button>
            </div>
          </div>
          <div class="data-item-info">
            <div class="info-row">
              <span class="info-label">説明</span>
              <span>${category.categoryDescription || '説明なし'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">表示順</span>
              <span>${category.displayOrder || 0}</span>
            </div>
            <div class="info-row">
              <span class="info-label">言語</span>
              <span>${category.languageCode}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading categories:', error);
      container.innerHTML = '<div class="empty-state"><h3>データの読み込みに失敗しました</h3></div>';
    }
  }

  async loadJobTypes() {
    const container = document.getElementById('job-types-list');
    if (!container) return;

    try {
      let jobTypes = [];
      try {
        jobTypes = await this.app.api.getJobTypesI18n();
      } catch (error) {
        console.log('Using fallback job types data');
        jobTypes = this.generateFallbackJobTypes();
      }

      if (jobTypes.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>職種が設定されていません</h3>
            <p>「職種を追加」ボタンから新しい職種を作成してください。</p>
          </div>
        `;
        return;
      }

      container.innerHTML = jobTypes.map(jobType => `
        <div class="data-item">
          <div class="data-item-header">
            <h4 class="data-item-title">${jobType.jobTypeName || 'Unknown Job Type'}</h4>
            <div class="data-item-actions">
              <button class="btn-icon btn-edit" onclick="dataSettingsPage.editItem('${jobType.jobTypeId}', 'job-type')">
                編集
              </button>
              <button class="btn-icon btn-delete" onclick="dataSettingsPage.deleteItem('${jobType.jobTypeId}', 'job-type')">
                削除
              </button>
            </div>
          </div>
          <div class="data-item-info">
            <div class="info-row">
              <span class="info-label">説明</span>
              <span>${jobType.jobTypeDescription || '説明なし'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">言語</span>
              <span>${jobType.languageCode}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading job types:', error);
      container.innerHTML = '<div class="empty-state"><h3>データの読み込みに失敗しました</h3></div>';
    }
  }

  async loadBenchmarks() {
    const container = document.getElementById('benchmarks-list');
    if (!container) return;

    try {
      let benchmarks = [];
      try {
        benchmarks = await this.app.api.getBenchmarkData();
      } catch (error) {
        console.log('Using fallback benchmark data');
        benchmarks = this.generateFallbackBenchmarks();
      }

      if (benchmarks.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>ベンチマークが設定されていません</h3>
            <p>「ベンチマークを追加」ボタンから新しいベンチマークを作成してください。</p>
          </div>
        `;
        return;
      }

      container.innerHTML = benchmarks.map(benchmark => `
        <div class="data-item">
          <div class="data-item-header">
            <h4 class="data-item-title">${benchmark.name || 'Unknown Benchmark'}</h4>
            <div class="data-item-actions">
              <button class="btn-icon btn-edit" onclick="dataSettingsPage.editItem('${benchmark.id}', 'benchmark')">
                編集
              </button>
              <button class="btn-icon btn-delete" onclick="dataSettingsPage.deleteItem('${benchmark.id}', 'benchmark')">
                削除
              </button>
            </div>
          </div>
          <div class="data-item-info">
            <div class="info-row">
              <span class="info-label">タイプ</span>
              <span>${benchmark.type || 'general'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">基準値</span>
              <span>${benchmark.value || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">説明</span>
              <span>${benchmark.description || '説明なし'}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading benchmarks:', error);
      container.innerHTML = '<div class="empty-state"><h3>データの読み込みに失敗しました</h3></div>';
    }
  }

  generateFallbackEvaluationItems() {
    return [
      {
        itemId: 'tech_1',
        languageCode: 'ja',
        categoryName: '技術力',
        itemName: 'プログラミングスキル',
        itemDescription: 'プログラミング技術の習熟度',
        sortOrder: 1
      },
      {
        itemId: 'comm_1',
        languageCode: 'ja',
        categoryName: 'コミュニケーション',
        itemName: 'チームワーク',
        itemDescription: 'チームでの協調性と連携能力',
        sortOrder: 1
      }
    ];
  }

  generateFallbackCategories() {
    return [
      {
        categoryId: 'technical_skills',
        languageCode: 'ja',
        categoryName: '技術力',
        categoryDescription: '専門技術に関する能力',
        displayOrder: 1
      },
      {
        categoryId: 'communication',
        languageCode: 'ja',
        categoryName: 'コミュニケーション',
        categoryDescription: '意思疎通とチームワーク',
        displayOrder: 2
      }
    ];
  }

  generateFallbackJobTypes() {
    return [
      {
        jobTypeId: 'engineer',
        languageCode: 'ja',
        jobTypeName: 'エンジニア',
        jobTypeDescription: '技術開発・設計担当'
      },
      {
        jobTypeId: 'manager',
        languageCode: 'ja',
        jobTypeName: 'マネージャー',
        jobTypeDescription: 'チーム管理・統括'
      }
    ];
  }

  generateFallbackBenchmarks() {
    return [
      {
        id: 'tech_benchmark_1',
        name: '技術力基準',
        type: 'technical',
        value: 3.5,
        description: '技術職種の平均基準値'
      },
      {
        id: 'comm_benchmark_1',
        name: 'コミュニケーション基準',
        type: 'communication',
        value: 3.0,
        description: '全職種共通のコミュニケーション基準値'
      }
    ];
  }

  switchCategory(category) {
    this.currentCategory = category;
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Update sections
    document.querySelectorAll('.settings-section').forEach(section => {
      section.classList.toggle('active', section.id === `${category}-section`);
    });
  }

  openModal(mode, type, itemId = null) {
    this.currentModalMode = mode;
    this.currentModalType = type;
    this.currentItemId = itemId;
    
    const modal = document.getElementById('edit-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const t = this.translations[this.currentLanguage];
    const isEdit = mode === 'edit';
    
    // Set modal title
    const typeNames = {
      'evaluation-item': t.evaluationItems || '評価項目',
      'category': t.categories || 'カテゴリ',
      'job-type': t.jobTypes || '職種',
      'benchmark': t.benchmarks || 'ベンチマーク'
    };
    
    title.textContent = `${isEdit ? '編集' : '追加'}: ${typeNames[type]}`;
    
    // Generate form based on type
    body.innerHTML = this.generateModalForm(type, isEdit);
    
    modal.style.display = 'block';
    
    // Setup language tabs if needed
    this.setupLanguageTabs();
    
    // Load data for edit mode
    if (isEdit && itemId) {
      this.loadItemForEdit(type, itemId);
    }
  }

  generateModalForm(type, isEdit) {
    const hasLanguages = ['evaluation-item', 'category', 'job-type'].includes(type);
    
    let form = '';
    
    if (hasLanguages) {
      form += `
        <div class="language-tabs">
          <button type="button" class="lang-tab active" data-lang="ja">日本語</button>
          <button type="button" class="lang-tab" data-lang="en">English</button>
          <button type="button" class="lang-tab" data-lang="vi">Tiếng Việt</button>
        </div>
      `;
    }
    
    // Generate form fields based on type
    switch (type) {
      case 'evaluation-item':
        form += this.generateEvaluationItemForm(hasLanguages);
        break;
      case 'category':
        form += this.generateCategoryForm(hasLanguages);
        break;
      case 'job-type':
        form += this.generateJobTypeForm(hasLanguages);
        break;
      case 'benchmark':
        form += this.generateBenchmarkForm();
        break;
    }
    
    return form;
  }

  generateEvaluationItemForm(hasLanguages) {
    const languages = ['ja', 'en', 'vi'];
    
    if (hasLanguages) {
      return languages.map(lang => `
        <div class="lang-content ${lang === 'ja' ? 'active' : ''}" data-lang="${lang}">
          <div class="form-group">
            <label>項目名 (${lang.toUpperCase()})</label>
            <input type="text" name="itemName_${lang}" required>
          </div>
          <div class="form-group">
            <label>カテゴリ名 (${lang.toUpperCase()})</label>
            <input type="text" name="categoryName_${lang}">
          </div>
          <div class="form-group">
            <label>説明 (${lang.toUpperCase()})</label>
            <textarea name="itemDescription_${lang}"></textarea>
          </div>
        </div>
      `).join('') + `
        <div class="form-group">
          <label>並び順</label>
          <input type="number" name="sortOrder" value="0" min="0">
        </div>
      `;
    }
    
    return `
      <div class="form-group">
        <label>項目名</label>
        <input type="text" name="itemName" required>
      </div>
      <div class="form-group">
        <label>カテゴリ名</label>
        <input type="text" name="categoryName">
      </div>
      <div class="form-group">
        <label>説明</label>
        <textarea name="itemDescription"></textarea>
      </div>
      <div class="form-group">
        <label>並び順</label>
        <input type="number" name="sortOrder" value="0" min="0">
      </div>
    `;
  }

  generateCategoryForm(hasLanguages) {
    const languages = ['ja', 'en', 'vi'];
    
    if (hasLanguages) {
      return languages.map(lang => `
        <div class="lang-content ${lang === 'ja' ? 'active' : ''}" data-lang="${lang}">
          <div class="form-group">
            <label>カテゴリ名 (${lang.toUpperCase()})</label>
            <input type="text" name="categoryName_${lang}" required>
          </div>
          <div class="form-group">
            <label>説明 (${lang.toUpperCase()})</label>
            <textarea name="categoryDescription_${lang}"></textarea>
          </div>
        </div>
      `).join('') + `
        <div class="form-group">
          <label>表示順</label>
          <input type="number" name="displayOrder" value="0" min="0">
        </div>
      `;
    }
    
    return `
      <div class="form-group">
        <label>カテゴリ名</label>
        <input type="text" name="categoryName" required>
      </div>
      <div class="form-group">
        <label>説明</label>
        <textarea name="categoryDescription"></textarea>
      </div>
      <div class="form-group">
        <label>表示順</label>
        <input type="number" name="displayOrder" value="0" min="0">
      </div>
    `;
  }

  generateJobTypeForm(hasLanguages) {
    const languages = ['ja', 'en', 'vi'];
    
    if (hasLanguages) {
      return languages.map(lang => `
        <div class="lang-content ${lang === 'ja' ? 'active' : ''}" data-lang="${lang}">
          <div class="form-group">
            <label>職種名 (${lang.toUpperCase()})</label>
            <input type="text" name="jobTypeName_${lang}" required>
          </div>
          <div class="form-group">
            <label>説明 (${lang.toUpperCase()})</label>
            <textarea name="jobTypeDescription_${lang}"></textarea>
          </div>
        </div>
      `).join('');
    }
    
    return `
      <div class="form-group">
        <label>職種名</label>
        <input type="text" name="jobTypeName" required>
      </div>
      <div class="form-group">
        <label>説明</label>
        <textarea name="jobTypeDescription"></textarea>
      </div>
    `;
  }

  generateBenchmarkForm() {
    return `
      <div class="form-group">
        <label>ベンチマーク名</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>タイプ</label>
        <select name="type" required>
          <option value="general">一般</option>
          <option value="technical">技術</option>
          <option value="communication">コミュニケーション</option>
          <option value="leadership">リーダーシップ</option>
          <option value="problem_solving">問題解決</option>
        </select>
      </div>
      <div class="form-group">
        <label>基準値</label>
        <input type="number" name="value" step="0.1" min="0" max="5" required>
      </div>
      <div class="form-group">
        <label>説明</label>
        <textarea name="description"></textarea>
      </div>
    `;
  }

  setupLanguageTabs() {
    document.querySelectorAll('.lang-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        
        // Update tab states
        document.querySelectorAll('.lang-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.lang === lang);
        });
        
        // Update content visibility
        document.querySelectorAll('.lang-content').forEach(content => {
          content.classList.toggle('active', content.dataset.lang === lang);
        });
      });
    });
  }

  async loadItemForEdit(type, itemId) {
    // Implementation would load specific item data and populate form
    console.log(`Loading ${type} item ${itemId} for editing`);
  }

  closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
  }

  async saveModalData() {
    try {
      const formData = this.collectFormData();
      
      if (this.currentModalMode === 'add') {
        await this.createItem(this.currentModalType, formData);
      } else {
        await this.updateItem(this.currentModalType, this.currentItemId, formData);
      }
      
      this.closeModal();
      await this.loadCurrentData();
      this.showSuccess('データが正常に保存されました');
    } catch (error) {
      console.error('Error saving data:', error);
      this.showError('保存中にエラーが発生しました');
    }
  }

  collectFormData() {
    const form = document.getElementById('modal-body');
    const formData = {};
    
    // Collect all form inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      formData[input.name] = input.value;
    });
    
    return formData;
  }

  async createItem(type, data) {
    switch (type) {
      case 'evaluation-item':
        return await this.app.api.createEvaluationItemI18n(data);
      case 'category':
        return await this.app.api.createCategoryI18n(data);
      case 'job-type':
        return await this.app.api.createJobTypeI18n(data);
      case 'benchmark':
        return await this.app.api.createBenchmark(data);
    }
  }

  async updateItem(type, itemId, data) {
    switch (type) {
      case 'evaluation-item':
        return await this.app.api.updateEvaluationItemI18n(itemId, data);
      case 'category':
        return await this.app.api.updateCategoryI18n(itemId, data);
      case 'job-type':
        return await this.app.api.updateJobTypeI18n(itemId, data);
      case 'benchmark':
        return await this.app.api.updateBenchmark(itemId, data);
    }
  }

  async editItem(itemId, type) {
    this.openModal('edit', type, itemId);
  }

  async deleteItem(itemId, type) {
    const t = this.translations[this.currentLanguage];
    if (!confirm('本当に削除しますか？')) return;
    
    try {
      switch (type) {
        case 'evaluation-item':
          await this.app.api.deleteEvaluationItemI18n(itemId);
          break;
        case 'category':
          await this.app.api.deleteCategoryI18n(itemId);
          break;
        case 'job-type':
          await this.app.api.deleteJobTypeI18n(itemId);
          break;
        case 'benchmark':
          await this.app.api.deleteBenchmark(itemId);
          break;
      }
      
      await this.loadCurrentData();
      this.showSuccess('削除が完了しました');
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showError('削除中にエラーが発生しました');
    }
  }

  showSuccess(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 10000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  showError(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 10000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}

// Make instance available globally for onclick handlers
let dataSettingsPage;