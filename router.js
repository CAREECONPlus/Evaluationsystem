// router.js - 完全修正版
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

export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            "/login": { 
                component: LoginPage, 
                auth: false,
                title: "ログイン"
            },
            "/dashboard": { 
                component: DashboardPage, 
                auth: true,
                title: "ダッシュボード"
            },
            "/users": { 
                component: UserManagementPage, 
                auth: true, 
                roles: ['admin'],
                title: "ユーザー管理"
            },
            "/evaluations": { 
                component: EvaluationsPage, 
                auth: true,
                title: "評価一覧"
            },
            "/report": { 
                component: EvaluationReportPage, 
                auth: true,
                title: "評価レポート"
            },
            "/settings": { 
                component: SettingsPage, 
                auth: true, 
                roles: ['admin'],
                title: "システム設定"
            },
            "/evaluation-form": { 
                component: EvaluationFormPage, 
                auth: true,
                title: "評価入力"
            },
            "/goal-setting": { 
                component: GoalSettingPage, 
                auth: true, 
                roles: ['evaluator', 'worker'],
                title: "目標設定"
            },
            "/goal-approvals": { 
                component: GoalApprovalsPage, 
                auth: true, 
                roles: ['admin'],
                title: "目標承認"
            },
            "/developer": { 
                component: DeveloperPage, 
                auth: true, 
                roles: ['developer'],
                title: "開発者管理"
            },
            "/register-admin": { 
                component: RegisterAdminPage, 
                auth: false,
                title: "管理者登録申請"
            },
            "/register": { 
                component: RegisterPage, 
                auth: false,
                title: "ユーザー登録"
            },
        };
        
        this.currentPageInstance = null;
        this.currentRoute = null;
        this.isRouting = false;
        this.routingQueue = [];

        // ルート変更の監視
        window.addEventListener("hashchange", () => this.handleRouteChange());
        window.addEventListener("popstate", () => this.handleRouteChange());
    }

    handleRouteChange() {
        // ルーティング中の場合はキューに追加
        if (this.isRouting) {
            this.routingQueue.push(() => this.route());
            return;
        }
        this.route();
    }

    async route() {
        if (this.isRouting) return;
        
        this.isRouting = true;
        this.app.showLoadingScreen();

        try {
            const path = this.getCurrentPath();
            const params = this.getParams();
            
            console.log(`Router: Navigating to ${path}`);
            
            // 現在のページのクリーンアップ
            await this.cleanupCurrentPage();

            // ルート設定を取得
            const routeConfig = this.getRouteConfig(path);
            
            // 認証チェック
            const authCheckResult = this.checkAuthentication(routeConfig);
            if (authCheckResult.redirect) {
                this.performRedirect(authCheckResult.redirect);
                return;
            }

            // 権限チェック
            const permissionCheckResult = this.checkPermissions(routeConfig);
            if (permissionCheckResult.redirect) {
                this.performRedirect(permissionCheckResult.redirect, permissionCheckResult.message);
                return;
            }

            // ページのレンダリングと初期化
            await this.renderPage(routeConfig, params);
            
            // ページタイトルの更新
            this.updatePageTitle(routeConfig.title);
            
            // 現在のルートを記録
            this.currentRoute = path;
            
            console.log(`Router: Successfully navigated to ${path}`);

        } catch (error) {
            console.error("Router: Fatal error during routing:", error);
            this.renderErrorPage(error);
        } finally {
            this.isRouting = false;
            this.app.showApp();
            
            // キューに残っているルーティングを処理
            this.processRoutingQueue();
        }
    }

    getCurrentPath() {
        return window.location.hash.slice(1).split('?')[0] || "/login";
    }

    getParams() {
        const queryString = window.location.hash.split('?')[1] || '';
        return new URLSearchParams(queryString);
    }

    getRouteConfig(path) {
        return this.routes[path] || this.routes['/login'];
    }

    async cleanupCurrentPage() {
        if (this.currentPageInstance) {
            try {
                // 未保存変更のチェック
                if (typeof this.currentPageInstance.hasUnsavedChanges === 'function' && 
                    this.currentPageInstance.hasUnsavedChanges()) {
                    
                    const confirmLeave = confirm('保存されていない変更があります。ページを離れてもよろしいですか？');
                    if (!confirmLeave) {
                        throw new Error('Navigation cancelled by user');
                    }
                }

                // クリーンアップメソッドの実行
                if (typeof this.currentPageInstance.cleanup === 'function') {
                    await this.currentPageInstance.cleanup();
                }

                // 離脱可能かチェック
                if (typeof this.currentPageInstance.canLeave === 'function' && 
                    !this.currentPageInstance.canLeave()) {
                    throw new Error('Page cannot be left at this time');
                }

                console.log("Router: Current page cleaned up successfully");
            } catch (error) {
                if (error.message === 'Navigation cancelled by user' || 
                    error.message === 'Page cannot be left at this time') {
                    throw error;
                }
                console.warn("Router: Page cleanup failed:", error);
            }
            
            // インスタンスをクリア
            this.currentPageInstance = null;
        }

        // DOM のクリーンアップ
        this.cleanupDOM();
    }

    cleanupDOM() {
        // コンテンツエリアのクリア
        const contentContainer = document.getElementById("content");
        if (contentContainer) {
            // イベントリスナーを削除するため、クローンして置き換え
            const cleanContent = contentContainer.cloneNode(false);
            contentContainer.parentNode.replaceChild(cleanContent, contentContainer);
        }

        // 既存のログインページ要素を削除
        const loginPageElements = document.querySelectorAll('.login-page');
        loginPageElements.forEach(el => el.remove());

        // 不要なモーダルを削除
        const modals = document.querySelectorAll('.modal:not(.permanent-modal)');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.dispose();
            }
            modal.remove();
        });

        // バックドロップの削除
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // bodyのクラス修正
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    checkAuthentication(routeConfig) {
        const isAuthenticated = this.app.isAuthenticated();
        
        // 認証が必要なページに未認証でアクセス
        if (routeConfig.auth && !isAuthenticated) {
            console.log("Router: Authentication required, redirecting to /login");
            return { redirect: "#/login" };
        }

        // 認証済みユーザーが公開ページにアクセス
        if (!routeConfig.auth && isAuthenticated) {
            // 登録系ページは除外
            if (!window.location.hash.includes('register')) {
                console.log("Router: Already authenticated, redirecting to /dashboard");
                return { redirect: "#/dashboard" };
            }
        }

        return { redirect: null };
    }

    checkPermissions(routeConfig) {
        // 権限チェックが必要なルート
        if (routeConfig.roles && this.app.isAuthenticated()) {
            if (!this.app.hasAnyRole(routeConfig.roles)) {
                console.log(`Router: Access denied. Required roles: ${routeConfig.roles}, User role: ${this.app.currentUser?.role}`);
                return { 
                    redirect: "#/dashboard", 
                    message: "このページにアクセスする権限がありません。"
                };
            }
        }

        return { redirect: null };
    }

    performRedirect(url, message = null) {
        if (message) {
            this.app.showError(message);
        }
        
        // リダイレクトの実行
        setTimeout(() => {
            window.location.hash = url;
        }, 100);
    }

    async renderPage(routeConfig, params) {
        try {
            // ページインスタンスの作成
            const PageClass = routeConfig.component;
            this.currentPageInstance = new PageClass(this.app);
            
            // コンテンツコンテナの取得
            const contentContainer = document.getElementById("content");
            if (!contentContainer) {
                throw new Error("Content container not found");
            }
            
            // ページのレンダリング
            console.log("Router: Rendering page...");
            const htmlContent = await this.currentPageInstance.render();
            
            // DOM に挿入
            contentContainer.innerHTML = htmlContent;
            
            // ページの初期化
            if (typeof this.currentPageInstance.init === 'function') {
                console.log("Router: Initializing page...");
                await this.currentPageInstance.init(params);
            }
            
            // 多言語対応の更新
            this.app.i18n.updateUI(contentContainer);
            
            // アクセシビリティの強化
            if (this.app.accessibility) {
                this.app.accessibility.enhancePage();
            }
            
            console.log("Router: Page rendered and initialized successfully");
            
        } catch (error) {
            console.error("Router: Page rendering failed:", error);
            this.renderErrorPage(error);
        }
    }

    updatePageTitle(title) {
        try {
            const systemName = this.app.i18n.t('app.system_name') || '評価管理システム';
            document.title = title ? `${title} - ${systemName}` : systemName;
        } catch (error) {
            console.warn("Router: Title update failed:", error);
            document.title = '評価管理システム';
        }
    }

    renderErrorPage(error) {
        const contentContainer = document.getElementById("content");
        if (!contentContainer) return;

        const errorDetails = this.app.debug ? error.stack : error.message;
        
        contentContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-center" style="min-height: 70vh;">
                <div class="text-center p-4 card shadow-sm" style="max-width: 600px;">
                    <div class="mb-4">
                        <i class="fas fa-exclamation-triangle fa-4x text-warning"></i>
                    </div>
                    <h2 class="text-danger mb-3">ページ表示エラー</h2>
                    <p class="text-muted mb-4">ページの読み込み中に予期せぬエラーが発生しました。</p>
                    
                    <div class="d-grid gap-2 d-md-flex justify-content-md-center mb-4">
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            <i class="fas fa-redo me-2"></i>ページを再読み込み
                        </button>
                        <button class="btn btn-outline-secondary" onclick="window.app.navigate('#/dashboard')">
                            <i class="fas fa-home me-2"></i>ダッシュボードに戻る
                        </button>
                    </div>
                    
                    ${this.app.hasRole('developer') ? `
                    <details class="text-start">
                        <summary class="text-muted small" style="cursor: pointer;">
                            <i class="fas fa-bug me-1"></i>開発者向け詳細情報
                        </summary>
                        <div class="bg-light p-3 rounded mt-2">
                            <small>
                                <strong>Route:</strong> ${window.location.hash}<br>
                                <strong>User:</strong> ${this.app.currentUser?.email || 'Not authenticated'}<br>
                                <strong>Role:</strong> ${this.app.currentUser?.role || 'N/A'}<br>
                                <strong>Error:</strong>
                            </small>
                            <pre class="mt-2 text-danger small"><code>${this.app.sanitizeHtml(errorDetails)}</code></pre>
                        </div>
                    </details>
                    ` : ''}
                    
                    <div class="mt-4">
                        <small class="text-muted">
                            問題が解決しない場合は、システム管理者に連絡してください。
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    processRoutingQueue() {
        if (this.routingQueue.length > 0) {
            const nextRoute = this.routingQueue.shift();
            setTimeout(nextRoute, 100);
        }
    }

    // プログラム的なナビゲーション
    navigate(path, params = {}) {
        try {
            // パラメータがある場合はクエリストリングに変換
            const queryString = Object.keys(params).length > 0 ? 
                '?' + new URLSearchParams(params).toString() : '';
            
            const fullPath = path + queryString;
            
            console.log(`Router: Programmatic navigation to ${fullPath}`);
            
            if (window.location.hash !== fullPath) {
                window.location.hash = fullPath;
            } else {
                // 同じパスの場合は強制的にルーティング
                this.route();
            }
        } catch (error) {
            console.error("Router: Navigation failed:", error);
            this.app.showError("ページ遷移に失敗しました");
        }
    }

    // 現在のルートの取得
    getCurrentRoute() {
        return this.currentRoute;
    }

    // ルート履歴の管理
    goBack() {
        window.history.back();
    }

    // ルートガードの追加
    addRouteGuard(path, guardFunction) {
        if (this.routes[path]) {
            this.routes[path].guard = guardFunction;
        }
    }

    // 動的ルートの追加
    addRoute(path, config) {
        this.routes[path] = config;
    }

    // ルートの削除
    removeRoute(path) {
        delete this.routes[path];
    }

    // デバッグ情報の取得
    getDebugInfo() {
        return {
            currentRoute: this.currentRoute,
            isRouting: this.isRouting,
            queueLength: this.routingQueue.length,
            availableRoutes: Object.keys(this.routes),
            currentUser: this.app.currentUser?.email || 'Not authenticated'
        };
    }
}
