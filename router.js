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
 * Router Service (Hash-based for SPA)
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
    }

    /**
     * Handles routing by loading and initializing the correct page component.
     * 正しいページコンポーネントを読み込んで初期化し、ルーティングを処理します。
     */
    async route() {
        // Get the path from the URL hash
        const path = window.location.hash.substring(1).split('?')[0] || "/";
        const PageClass = this.routes[path] || LoginPage; // Default to LoginPage if route not found
        
        const isPublicPage = ["/login", "/register", "/register-admin"].includes(path);

        // --- Authentication Guard ---
        if (!isPublicPage && !this.app.isAuthenticated()) {
            this.app.navigate("#/login");
            return;
        }
        if (isPublicPage && this.app.isAuthenticated()) {
            this.app.navigate("#/dashboard");
            return;
        }

        // Update header and sidebar components
        this.app.header.update();
        this.app.sidebar.update();

        // Render the page
        const pageInstance = new PageClass(this.app);
        this.app.currentPage = pageInstance;
        
        const contentContainer = document.getElementById("content");
        contentContainer.innerHTML = `<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
        
        contentContainer.innerHTML = await pageInstance.render();
        if (typeof pageInstance.init === "function") {
            await pageInstance.init();
        }
        // After page content is rendered and initialized, apply translations
        this.app.i18n.updateUI();
    }
}
