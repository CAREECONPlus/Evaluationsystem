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
        id: 'demo_supervisor',
        email: 'supervisor@demo.com',
        password: 'super123',
        name: '監督者（デモ）',
        role: 'supervisor',
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
    
    return { success: true, user: session };
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
      periods: [
        {
          id: '2024q1',
          name: '2024年第1四半期',
          status: 'active',
          tenantId: 'demo-tenant',
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        },
        {
          id: '2024q2',
          name: '2024年第2四半期',
          status: 'draft',
          tenantId: 'demo-tenant',
          startDate: '2024-04-01',
          endDate: '2024-06-30'
        }
      ],
      structures: {
        'construction': {
          id: 'construction',
          jobTypeId: 'construction',
          tenantId: 'demo-tenant',
          categories: [
            {
              id: 'tech_skills',
              name: '技術スキル',
              items: [
                { id: 'safety', name: '安全意識', weight: 30 },
                { id: 'quality', name: '作業品質', weight: 25 }
              ]
            },
            {
              id: 'teamwork',
              name: 'チームワーク',
              items: [
                { id: 'communication', name: 'コミュニケーション', weight: 25 },
                { id: 'cooperation', name: '協調性', weight: 20 }
              ]
            }
          ]
        },
        'electrician': {
          id: 'electrician',
          jobTypeId: 'electrician',
          tenantId: 'demo-tenant',
          categories: [
            {
              id: 'electrical_skills',
              name: '電気工事スキル',
              items: [
                { id: 'wiring', name: '配線作業', weight: 40 },
                { id: 'electrical_safety', name: '電気安全', weight: 35 },
                { id: 'troubleshooting', name: 'トラブルシューティング', weight: 25 }
              ]
            }
          ]
        }
      },
      tenantId: 'demo-tenant'
    };
  }

  getMockEvaluationPeriods() {
    return [
      {
        id: '2024q1',
        name: '2024年第1四半期',
        status: 'active',
        tenantId: 'demo-tenant',
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      },
      {
        id: '2024q2',
        name: '2024年第2四半期',
        status: 'draft',
        tenantId: 'demo-tenant',
        startDate: '2024-04-01',
        endDate: '2024-06-30'
      }
    ];
  }

  getMockBenchmarkData() {
    return [
      {
        id: 'bench_1',
        type: 'construction',
        value: 3.5,
        name: '建設作業員平均',
        tenantId: 'demo-tenant',
        evaluationCount: 25,
        averageScore: 3.5,
        lastUpdated: Date.now()
      },
      {
        id: 'bench_2',
        type: 'technical',
        value: 4.0,
        name: '技術力平均',
        tenantId: 'demo-tenant',
        evaluationCount: 30,
        averageScore: 4.0,
        lastUpdated: Date.now()
      }
    ];
  }

  // 追加APIメソッドのモックデータ
  getMockOrganizationStructure() {
    return [
      {
        id: 'org_001',
        name: '建設部',
        parentId: null,
        level: 0,
        tenantId: 'demo-tenant'
      },
      {
        id: 'org_002', 
        name: '現場A班',
        parentId: 'org_001',
        level: 1,
        tenantId: 'demo-tenant'
      },
      {
        id: 'org_003',
        name: '現場B班', 
        parentId: 'org_001',
        level: 1,
        tenantId: 'demo-tenant'
      }
    ];
  }



  getMockEvaluationStructures() {
    return [
      {
        id: 'struct_basic',
        name: '基本評価構造',
        categories: [
          {
            id: 'cat_safety',
            name: '安全性',
            weight: 30,
            items: [
              { id: 'item_helmet', name: 'ヘルメット着用', maxScore: 5 },
              { id: 'item_safety_check', name: '安全確認', maxScore: 5 }
            ]
          },
          {
            id: 'cat_skill',
            name: '技術力',
            weight: 40,
            items: [
              { id: 'item_accuracy', name: '作業精度', maxScore: 5 },
              { id: 'item_efficiency', name: '作業効率', maxScore: 5 }
            ]
          },
          {
            id: 'cat_attitude',
            name: '勤務態度',
            weight: 30,
            items: [
              { id: 'item_punctuality', name: '時間厳守', maxScore: 5 },
              { id: 'item_teamwork', name: 'チームワーク', maxScore: 5 }
            ]
          }
        ],
        tenantId: 'demo-tenant'
      }
    ];
  }

  getMockNotifications() {
    return [
      {
        id: 'notif_001',
        title: '新しい評価が追加されました',
        message: '作業員（デモ）の評価が完了しました',
        type: 'evaluation_completed',
        read: false,
        createdAt: Date.now() - 86400000,
        userId: 'demo_admin',
        tenantId: 'demo-tenant'
      },
      {
        id: 'notif_002',
        title: 'システムメンテナンス予定',
        message: '明日午前2時よりシステムメンテナンスを実施します',
        type: 'system',
        read: true,
        createdAt: Date.now() - 172800000,
        userId: 'demo_admin',
        tenantId: 'demo-tenant'
      }
    ];
  }

  getMockTenantInfo() {
    return {
      id: 'demo-tenant',
      name: 'デモ建設会社',
      settings: {
        evaluationCycle: 'quarterly',
        defaultRole: 'worker',
        maxUsers: 100
      },
      createdAt: Date.now() - 86400000 * 90
    };
  }

  getMockJobTypes() {
    return [
      {
        id: 'job_construction',
        name: '建設作業員',
        description: '一般的な建設作業',
        tenantId: 'demo-tenant'
      },
      {
        id: 'job_electrician',
        name: '電気工事士',
        description: '電気設備工事',
        tenantId: 'demo-tenant'
      },
      {
        id: 'job_plumber',
        name: '配管工',
        description: '配管設備工事',
        tenantId: 'demo-tenant'
      }
    ];
  }

  getMockReports() {
    return [
      {
        id: 'report_001',
        title: '2024年第1四半期評価レポート',
        type: 'quarterly',
        period: 'period_2024q1',
        createdAt: Date.now() - 86400000 * 7,
        data: {
          totalEvaluations: 45,
          averageScore: 4.2,
          topPerformers: ['demo_worker'],
          improvementAreas: ['安全性', '時間管理']
        },
        tenantId: 'demo-tenant'
      }
    ];
  }
}

// グローバルに公開
window.TempAuth = TempAuth;

export { TempAuth };