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
 * Router Service (Hash-based for SPA) - エラーハンドリング強化版
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
    }

    async route() {
        try {
            console.log("Router: Starting route...");
            
            const hash = window.location.hash.substring(1);
            const [path, queryString] = hash.split('?');
            const params = new URLSearchParams(queryString || '');
            const cleanPath = path || "/";
            
            console.log("Router: Current path:", cleanPath);

            const PageClass = this.routes[cleanPath];
            const isPublicPage = ["/login", "/register", "/register-admin"].includes(cleanPath);

            // 認証チェック
            if (!isPublicPage && !this.app.isAuthenticated()) {
                console.log("Router: Not authenticated, redirecting to login");
                this.app.navigate("#/login");
                return;
            }
            
            if (isPublicPage && this.app.isAuthenticated()) {
                console.log("Router: Already authenticated, redirecting to dashboard");
                this.app.navigate("#/dashboard");
                return;
            }

            // ページクラスが見つからない場合
            if (!PageClass) {
                console.error("Router: Page class not found for path:", cleanPath);
                if (this.app.isAuthenticated()) {
                    this.app.navigate("#/dashboard");
                } else {
                    this.app.navigate("#/login");
                }
                return;
            }

            // ヘッダーとサイドバーの更新
            try {
                this.app.header.update();
                this.app.sidebar.update();
            } catch (error) {
                console.error("Router: Error updating header/sidebar:", error);
            }

            // コンテンツコンテナの取得
            const contentContainer = document.getElementById("content");
            if (!contentContainer) {
                console.error("Router: Content container not found");
                return;
            }

            // ローディング表示
            contentContainer.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="text-muted">ページを読み込んでいます...</p>
                    </div>
                </div>
            `;

            console.log("Router: Creating page instance for:", PageClass.name);

            // 前のページインスタンスのクリーンアップ
            if (this.currentPageInstance && typeof this.currentPageInstance.cleanup === 'function') {
                try {
                    this.currentPageInstance.cleanup();
                } catch (error) {
                    console.warn("Router: Error during page cleanup:", error);
                }
            }

            // 新しいページインスタンスの作成
            this.currentPageInstance = new PageClass(this.app);
            this.app.currentPage = this.currentPageInstance;
            
            console.log("Router: Rendering page...");
            
            // ページのレンダリング
            let renderedContent;
            try {
                renderedContent = await this.currentPageInstance.render();
            } catch (error) {
                console.error("Router: Error rendering page:", error);
                renderedContent = `
                    <div class="alert alert-danger m-4">
                        <h4>ページの読み込みエラー</h4>
                        <p>ページの読み込み中にエラーが発生しました。</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">再読み込み</button>
                    </div>
                `;
            }
            
            contentContainer.innerHTML = renderedContent;
            
            console.log("Router: Initializing page...");
            
            // ページの初期化
            if (typeof this.currentPageInstance.init === "function") {
                try {
                    await this.currentPageInstance.init(params);
                } catch (error) {
                    console.error("Router: Error initializing page:", error);
                    contentContainer.innerHTML = `
                        <div class="alert alert-danger m-4">
                            <h4>ページの初期化エラー</h4>
                            <p>ページの初期化中にエラーが発生しました: ${error.message}</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">再読み込み</button>
                        </div>
                    `;
                    return;
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
            
            // 致命的エラーの場合の緊急対応
            const contentContainer = document.getElementById("content");
            if (contentContainer) {
                contentContainer.innerHTML = `
                    <div class="alert alert-danger m-4">
                        <h4>システムエラー</h4>
                        <p>システムでエラーが発生しました。ページを再読み込みしてください。</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">再読み込み</button>
                        <details class="mt-3">
                            <summary>エラー詳細</summary>
                            <pre class="mt-2">${error.stack}</pre>
                        </details>
                    </div>
                `;
            }
        }
    }

    // ナビゲーション前の確認
    canNavigate() {
        if (this.currentPageInstance && typeof this.currentPageInstance.canLeave === 'function') {
            return this.currentPageInstance.canLeave();
        }
        return true;
    }

    // ルーターのクリーンアップ
    cleanup() {
        if (this.currentPageInstance && typeof this.currentPageInstance.cleanup === 'function') {
            this.currentPageInstance.cleanup();
        }
        this.currentPageInstance = null;
    }
}
