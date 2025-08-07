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
 * Router Service - 安定化版
 * ルーターサービス（SPA向けハッシュベース）
 */
export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            "/login": { component: LoginPage, auth: false },
            "/dashboard": { component: DashboardPage, auth: true },
            "/users": { component: UserManagementPage, auth: true, roles: ['admin'] },
            "/evaluations": { component: EvaluationsPage, auth: true },
            "/report": { component: EvaluationReportPage, auth: true },
            "/settings": { component: SettingsPage, auth: true, roles: ['admin'] },
            "/evaluation-form": { component: EvaluationFormPage, auth: true },
            "/goal-setting": { component: GoalSettingPage, auth: true, roles: ['evaluator', 'worker'] },
            "/goal-approvals": { component: GoalApprovalsPage, auth: true, roles: ['admin'] },
            "/developer": { component: DeveloperPage, auth: true, roles: ['developer'] },
            "/register-admin": { component: RegisterAdminPage, auth: false },
            "/register": { component: RegisterPage, auth: false },
        };
        this.currentPageInstance = null;
        this.isRouting = false;

        window.addEventListener("hashchange", () => this.route());
    }

    async route() {
        if (this.isRouting) return;
        this.isRouting = true;
        this.app.showLoadingScreen();

        try {
            if (this.currentPageInstance && typeof this.currentPageInstance.cleanup === 'function') {
                this.currentPageInstance.cleanup();
            }

            const path = window.location.hash.slice(1).split('?')[0] || "/login";
            const routeConfig = this.routes[path] || this.routes['/login'];

            if (routeConfig.auth && !this.app.isAuthenticated()) {
                this.app.navigate("#/login");
                return;
            }
            if (routeConfig.roles && !this.app.hasAnyRole(routeConfig.roles)) {
                this.app.showError(this.app.i18n.t('errors.access_denied'));
                this.app.navigate("#/dashboard");
                return;
            }

            const PageClass = routeConfig.component;
            this.currentPageInstance = new PageClass(this.app);
            
            const contentContainer = document.getElementById("content");
            contentContainer.innerHTML = await this.currentPageInstance.render();
            
            if (typeof this.currentPageInstance.init === 'function') {
                const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                await this.currentPageInstance.init(params);
            }
            this.app.i18n.updateUI();

        } catch (error) {
            console.error("Router: Fatal error in route():", error);
            this.renderErrorPage(error);
        } finally {
            // ★ 修正点: ページ遷移完了後、確実にローディングを解除
            this.isRouting = false;
            this.app.showApp();
        }
    }

    renderErrorPage(error) {
        const contentContainer = document.getElementById("content");
        contentContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-center" style="min-height: 70vh;">
                <div class="text-center p-4 card shadow-sm">
                    <h2 class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i>ページ表示エラー</h2>
                    <p class="text-muted">ページの読み込み中に予期せぬエラーが発生しました。</p>
                    <div class="mt-4">
                        <button class="btn btn-primary" onclick="window.app.navigate('#/dashboard')">ダッシュボードに戻る</button>
                    </div>
                    <details class="mt-3 text-start">
                        <summary class="text-muted small">エラー詳細</summary>
                        <pre class="bg-light p-2 rounded small mt-2"><code>${this.app.sanitizeHtml(error.stack)}</code></pre>
                    </details>
                </div>
            </div>`;
    }
}
