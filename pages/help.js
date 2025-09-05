/**
 * Help Page Component
 * ヘルプページコンポーネント
 */
export class HelpPage {
  constructor(app) {
    this.app = app;
  }

  async render() {
    return `
      <div class="help-page p-4">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <h1 class="mb-4">ヘルプ</h1>
              
              <div class="row">
                <div class="col-md-8">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="mb-0">システムの使用方法</h5>
                    </div>
                    <div class="card-body">
                      <h6>基本的な操作</h6>
                      <ul>
                        <li><strong>ダッシュボード:</strong> システム全体の概要を確認できます</li>
                        <li><strong>評価一覧:</strong> 過去の評価データを参照できます</li>
                        <li><strong>評価入力:</strong> 新しい評価を入力できます（評価者のみ）</li>
                        <li><strong>ユーザー管理:</strong> ユーザーの管理を行えます（管理者のみ）</li>
                      </ul>
                      
                      <h6 class="mt-4">よくある質問</h6>
                      <div class="accordion" id="faqAccordion">
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="faq1">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                              パスワードを忘れた場合はどうすればよいですか？
                            </button>
                          </h2>
                          <div id="collapse1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                              ログイン画面の「パスワードを忘れた方はこちら」リンクから、パスワードリセットを行ってください。
                            </div>
                          </div>
                        </div>
                        
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="faq2">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                              評価を入力するにはどうすればよいですか？
                            </button>
                          </h2>
                          <div id="collapse2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                              サイドメニューから「評価入力」を選択し、対象者を選んで評価項目を入力してください。
                            </div>
                          </div>
                        </div>
                        
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="faq3">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3">
                              システムの動作が遅い場合はどうすればよいですか？
                            </button>
                          </h2>
                          <div id="collapse3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                              ブラウザの再読み込みを行うか、ブラウザのキャッシュをクリアしてください。問題が継続する場合は管理者に連絡してください。
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">サポート情報</h5>
                    </div>
                    <div class="card-body">
                      <h6>お問い合わせ</h6>
                      <p>技術的な問題やご質問がある場合は、システム管理者にお問い合わせください。</p>
                      
                      <h6 class="mt-3">システム情報</h6>
                      <ul class="list-unstyled">
                        <li><strong>版数:</strong> v1.0.0</li>
                        <li><strong>最終更新:</strong> 2024年12月</li>
                        <li><strong>対応ブラウザ:</strong> Chrome, Firefox, Safari, Edge</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    this.app.currentPage = this;
    // 翻訳の適用
    if (this.app.i18n) {
      this.app.i18n.updateUI();
    }
  }

  cleanup() {
    // クリーンアップ処理
  }
}