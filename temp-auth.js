/**
 * 一時的な認証システム - Firebase CORS問題の回避用
 * Firebase Console設定完了まで使用
 */

class TempAuth {
  constructor() {
    this.sessionKey = 'temp_auth_session';
    this.demoUsers = [
      {
        id: 'demo_admin',
        email: 'admin@demo.com',
        password: 'admin123',
        name: '管理者（デモ）',
        role: 'admin',
        tenantId: 'demo-tenant',
        status: 'active'
      },
      {
        id: 'demo_evaluator',
        email: 'evaluator@demo.com', 
        password: 'eval123',
        name: '評価者（デモ）',
        role: 'evaluator',
        tenantId: 'demo-tenant',
        status: 'active'
      },
      {
        id: 'demo_worker',
        email: 'worker@demo.com',
        password: 'work123',
        name: '作業員（デモ）',
        role: 'worker',
        tenantId: 'demo-tenant',
        status: 'active'
      }
    ];
  }

  async login(email, password) {
    console.log('TempAuth: Attempting temporary authentication...');
    
    const user = this.demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('認証に失敗しました。デモアカウントを使用してください。');
    }

    const session = {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status,
      loginTime: Date.now(),
      isTemp: true  // 一時認証フラグ
    };

    // セッション保存
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    console.log('TempAuth: Temporary authentication successful');
    
    return { user: session };
  }

  async logout() {
    localStorage.removeItem(this.sessionKey);
    console.log('TempAuth: Temporary session cleared');
  }

  getCurrentUser() {
    const sessionData = localStorage.getItem(this.sessionKey);
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (error) {
        console.error('TempAuth: Session parse error:', error);
        localStorage.removeItem(this.sessionKey);
      }
    }
    return null;
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // 状態変化リスナーのエミュレーション
  onAuthStateChanged(callback) {
    const user = this.getCurrentUser();
    setTimeout(() => callback(user), 100);
    
    // 簡易的なリスナー
    return () => console.log('TempAuth: Listener unsubscribed');
  }

  getDemoCredentials() {
    return this.demoUsers.map(user => ({
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role
    }));
  }
}

// グローバルに公開
window.TempAuth = TempAuth;

export { TempAuth };