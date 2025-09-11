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

  // モックデータ提供機能
  getMockDashboardStats() {
    return {
      totalUsers: 45,
      activeEvaluations: 12,
      completedEvaluations: 128,
      avgScore: 4.2,
      monthlyGrowth: 8.5
    };
  }

  getMockRecentEvaluations() {
    return [
      {
        id: 'mock_eval_1',
        targetName: '田中太郎',
        evaluatorName: '佐藤管理者',
        score: 4.5,
        createdAt: Date.now() - 86400000,
        status: 'completed'
      },
      {
        id: 'mock_eval_2', 
        targetName: '鈴木花子',
        evaluatorName: '田中評価者',
        score: 4.1,
        createdAt: Date.now() - 172800000,
        status: 'completed'
      }
    ];
  }

  // APIメソッド用のモックデータ
  getMockUsers(statusFilter = null) {
    const users = [
      {
        id: 'demo_admin',
        email: 'admin@demo.com',
        name: '管理者（デモ）',
        role: 'admin',
        status: 'active',
        tenantId: 'demo-tenant',
        createdAt: Date.now() - 86400000 * 30
      },
      {
        id: 'demo_evaluator',
        email: 'evaluator@demo.com',
        name: '評価者（デモ）',
        role: 'evaluator', 
        status: 'active',
        tenantId: 'demo-tenant',
        createdAt: Date.now() - 86400000 * 25
      },
      {
        id: 'demo_worker',
        email: 'worker@demo.com',
        name: '作業員（デモ）',
        role: 'worker',
        status: 'active',
        tenantId: 'demo-tenant',
        createdAt: Date.now() - 86400000 * 20
      },
      {
        id: 'demo_worker2',
        email: 'worker2@demo.com',
        name: '作業員2（デモ）',
        role: 'worker',
        status: 'inactive',
        tenantId: 'demo-tenant',
        createdAt: Date.now() - 86400000 * 15
      }
    ];
    return statusFilter ? users.filter(user => user.status === statusFilter) : users;
  }

  getMockEvaluations(filters = {}) {
    return [
      {
        id: 'mock_evaluation_1',
        targetUserId: 'demo_worker',
        evaluatorUserId: 'demo_evaluator',
        targetName: '作業員（デモ）',
        evaluatorName: '評価者（デモ）',
        status: 'completed',
        totalScore: 4.2,
        createdAt: Date.now() - 86400000 * 5,
        tenantId: 'demo-tenant'
      },
      {
        id: 'mock_evaluation_2',
        targetUserId: 'demo_worker2',
        evaluatorUserId: 'demo_evaluator', 
        targetName: '作業員2（デモ）',
        evaluatorName: '評価者（デモ）',
        status: 'draft',
        totalScore: 3.8,
        createdAt: Date.now() - 86400000 * 3,
        tenantId: 'demo-tenant'
      }
    ];
  }

  getMockInvitations() {
    return [
      {
        id: 'mock_invite_1',
        email: 'newuser@demo.com',
        role: 'worker',
        status: 'pending',
        createdAt: Date.now() - 86400000 * 2,
        tenantId: 'demo-tenant'
      }
    ];
  }

  getMockSettings() {
    return {
      jobTypes: [
        { id: 'construction', name: '建設作業員', tenantId: 'demo-tenant' },
        { id: 'electrician', name: '電気工事士', tenantId: 'demo-tenant' }
      ],
      evaluationPeriods: [
        { id: '2024q1', name: '2024年第1四半期', status: 'active', tenantId: 'demo-tenant' }
      ],
      evaluationStructures: [
        { id: 'basic', name: '基本評価項目', tenantId: 'demo-tenant' }
      ]
    };
  }
}

// グローバルに公開
window.TempAuth = TempAuth;

export { TempAuth };