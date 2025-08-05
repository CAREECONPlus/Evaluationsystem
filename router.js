// Import all page components
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { UserManagementPage } from './pages/user-management.js';
import { EvaluationsPage } from './pages/evaluations.js';
import { EvaluationReportPage } from './pages/report.js';
import { SettingsPage } from './pages/settings.js';
import { EvaluationFormPage } from './pages/evaluation-form.js';
import { GoalSettingPage } from './pages/goal-setting.js';
import { GoalApprovalsPage } from './pages/goal-approvals.js';
import { DeveloperPage } from './pages/developer.js';
import { RegisterAdminPage } from './pages/register-admin.js';
import { RegisterPage } from './pages/register.js';

/**
 * Router Service - ローディング問題完全修正版
 * ルーターサービス（SPA向けハッシュベース）
 */
export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            "/login": LoginPage,
            "/dashboard": DashboardPage,
            "/users": UserManagementPage,
            "/evaluations": EvaluationsPage,
            "/report": EvaluationReportPage,
            "/settings": SettingsPage,
            "/evaluation-form": EvaluationFormPage,
            "/goal-setting": GoalSettingPage,
            "/goal-approvals": GoalApprovalsPage,
            "/developer": DeveloperPage,
            "/register-admin": RegisterAdminPage,
            "/register": RegisterPage,
        };
        this.currentPageInstance = null;
        this.isRouting = false;
    }

    async route() {
        // 既にルーティング中の場合は処理をスキップ
        if (this.isRouting) {
            console.log("Router: Already routing, skipping...");
            return;
        }

        this.isRouting = true;
        
        try {
            console.log("Router: Starting route process...");
            
            const hash = window.location.hash.substring(1);
            const [path, queryString] = hash.split('?');
            const params = new URLSearchParams(queryString || '');
            const cleanPath = path || "/";
            
            console.log("Router: Routing to:", cleanPath);

            // 認証チェック
            const PageClass = this.routes[cleanPath];
            const isPublicPage = ["/login", "/register", "/register-admin"].includes(cleanPath);

            if (!isPublicPage && !this.app.isAuthenticated()) {
                console.log("Router: Not authenticated, redirecting to login");
                this.isRouting = false;
                this.app.navigate("#/login");
                return;
            }
            
            if (isPublicPage && this.app.isAuthenticated()) {
                console.log("Router: Already authenticated, redirecting to dashboard");
                this.isRouting = false;
                this.app.navigate("#/dashboard");
                return;
            }

            // ページクラスが見つからない場合
            if (!PageClass) {
                console.error("Router: Page class not found for path:", cleanPath);
                this.isRouting = false;
                if (this.app.isAuthenticated()) {
                    this.app.navigate("#/dashboard");
                } else {
                    this.app.navigate("#/login");
                }
                return;
            }

            // コンテンツコンテナの確実な取得
            const contentContainer = document.getElementById("content");
            if (!contentContainer) {
                console.error("Router: Content container not found!");
                this.isRouting = false;
                return;
            }

            // 前のページインスタンスのクリーンアップ
            if (this.currentPageInstance && typeof this.currentPageInstance.cleanup === 'function') {
                try {
                    console.log("Router: Cleaning up previous page");
                    this.currentPageInstance.cleanup();
                } catch (error) {
                    console.warn("Router: Error during page cleanup:", error);
                }
            }

            // モーダルの強制クリーンアップ
            this.forceCleanupModals();

            // ヘッダーとサイドバーの更新
            try {
                this.app.header.update();
                this.app.sidebar.update();
            } catch (error) {
                console.error("Router: Error updating header/sidebar:", error);
            }

            console.log("Router: Creating page instance:", PageClass.name);

            // 新しいページインスタンスの作成
            this.currentPageInstance = new PageClass(this.app);
            this.app.currentPage = this.currentPageInstance;
            
            // ページの即座のレンダリング（ローディング表示なし）
            let renderedContent;
            try {
                renderedContent = await this.currentPageInstance.render();
                console.log("Router: Page rendered successfully");
            } catch (error) {
                console.error("Router: Error rendering page:", error);
                renderedContent = this.getErrorPageContent(error);
            }
            
            // DOM更新
            contentContainer.innerHTML = renderedContent;
            
            // ページの初期化
            if (typeof this.currentPageInstance.init === "function") {
                try {
                    console.log("Router: Initializing page...");
                    await this.currentPageInstance.init(params);
                    console.log("Router: Page initialized successfully");
                } catch (error) {
                    console.error("Router: Error initializing page:", error);
                    contentContainer.innerHTML = this.getErrorPageContent(error);
                }
            }
            
            // 多言語対応の適用
            try {
                this.app.i18n.updateUI();
            } catch (error) {
                console.error("Router: Error updating i18n:", error);
            }
            
            console.log("Router: Route completed successfully");

        } catch (error) {
            console.error("Router: Fatal error in route():", error);
            
            const contentContainer = document.getElementById("content");
            if (contentContainer) {
                contentContainer.innerHTML = this.getErrorPageContent(error);
            }
        } finally {
            this.isRouting = false;
        }
    }

    /**
     * モーダルの強制クリーンアップ
     */
    forceCleanupModals() {
        try {
            // bodyからmodal-openクラスを削除
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            // 既存のモーダルバックドロップをすべて削除
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => {
                backdrop.remove();
            });
            
            // 既存のモーダルを非表示にする
            const existingModals = document.querySelectorAll('.modal');
            existingModals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
                modal.removeAttribute('role');
            });
            
            console.log("Router: Modal cleanup completed");
        } catch (error) {
            console.error("Router: Modal cleanup error:", error);
        }
    }

    /**
     * エラーページのコンテンツを生成
     */
    getErrorPageContent(error) {
        return `
            <div class="container-fluid p-4">
                <div class="alert alert-danger">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                        <div>
                            <h4 class="alert-heading mb-1">ページの読み込みエラー</h4>
                            <p class="mb-0">ページの読み込み中にエラーが発生しました。</p>
                        </div>
                    </div>
                    <hr>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary" onclick="window.location.reload()">
                            <i class="fas fa-redo me-2"></i>ページを再読み込み
                        </button>
                        <button class="btn btn-outline-secondary" onclick="window.app.navigate('#/dashboard')">
                            <i class="fas fa-home me-2"></i>ダッシュボードに戻る
                        </button>
                    </div>
                    <details class="mt-3">
                        <summary class="btn btn-link p-0">エラー詳細を表示</summary>
                        <pre class="mt-2 p-2 bg-light rounded">${error.message}</pre>
                    </details>
                </div>
            </div>
        `;
    }

    /**
     * ナビゲーション前の確認
     */
    canNavigate() {
        if (this.currentPageInstance && typeof this.currentPageInstance.canLeave === 'function') {
            return this.currentPageInstance.canLeave();
        }
        return true;
    }

    /**
     * ルーターのクリーンアップ
     */
    cleanup() {
        if (this.currentPageInstance && typeof this.currentPageInstance.cleanup === 'function') {
            this.currentPageInstance.cleanup();
        }
        this.currentPageInstance = null;
        this.forceCleanupModals();
    }
}
