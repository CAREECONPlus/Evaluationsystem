// careeconplus/evaluationsystem/Evaluationsystem-main/api.js

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    writeBatch,
    getCountFromServer,
    limit,
    orderBy,
    connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - Firebase連携完全版
 * APIサービス (Firestore連携版)
 */
export class API {
    constructor(app) {
        this.app = app;
        this.db = window.firebase.db;
        this.functions = window.firebase.functions;
        this.initialized = false;
        this.init();
    }

    /**
     * API初期化
     */
    init() {
        try {
            if (!this.db) {
                console.error("API: Firestore not initialized");
                return;
            }
            this.initialized = true;
            console.log("API: Initialized successfully");
        } catch (error) {
            console.error("API: Initialization error:", error);
        }
    }

    /**
     * 現在のユーザーのテナントIDを取得
     */
    getCurrentTenantId() {
        if (!this.app.currentUser?.tenantId) {
            throw new Error("テナント情報が見つかりません。ログインし直してください。");
        }
        return this.app.currentUser.tenantId;
    }

    /**
     * エラーハンドリング共通処理
     */
    handleError(error, operation) {
        console.error(`API: Error in ${operation}:`, error);
        
        if (error.code) {
            switch (error.code) {
                case 'permission-denied':
                    throw new Error("権限がありません。管理者に連絡してください。");
                case 'not-found':
                    throw new Error("データが見つかりません。");
                case 'unavailable':
                    throw new Error("サービスが一時的に利用できません。しばらくしてからお試しください。");
                default:
                    throw new Error(`${operation}でエラーが発生しました: ${error.message}`);
            }
        }
        
        throw error;
    }

    // --- Dashboard ---
    async getDashboardStats() {
        try {
            const tenantId = this.getCurrentTenantId();
            console.log("API: Getting dashboard stats for tenant:", tenantId);
            
            const usersQuery = query(
                collection(this.db, "users"), 
                where("tenantId", "==", tenantId),
                where("status", "==", "active")
            );
            
            const completedEvalsQuery = query(
                collection(this.db, "evaluations"), 
                where("tenantId", "==", tenantId), 
                where("status", "==", "completed")
            );
            
            const pendingStatuses = ['pending_submission', 'pending_evaluation', 'pending_approval', 'self_assessed', 'rejected', 'draft'];
            const pendingEvalsQuery = query(
                collection(this.db, "evaluations"), 
                where("tenantId", "==", tenantId), 
                where("status", "in", pendingStatuses)
            );

            const [usersSnapshot, completedEvalsSnapshot, pendingEvalsSnapshot] = await Promise.all([
                getCountFromServer(usersQuery),
                getCountFromServer(completedEvalsQuery),
                getCountFromServer(pendingEvalsQuery)
            ]);

            const stats = {
                totalUsers: usersSnapshot.data().count,
                completedEvaluations: completedEvalsSnapshot.data().count,
                pendingEvaluations: pendingEvalsSnapshot.data().count
            };

            console.log("API: Dashboard stats retrieved:", stats);
            return stats;
            
        } catch (error) {
            this.handleError(error, "ダッシュボード統計の取得");
        }
    }

    async getRecentEvaluations() {
        try {
            const tenantId = this.getCurrentTenantId();
            
            const q = query(
                collection(this.db, "evaluations"), 
                where("tenantId", "==", tenantId), 
                orderBy("submittedAt", "desc"), 
                limit(5)
            );
            
            const querySnapshot = await getDocs(q);
            const evaluations = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            console.log("API: Recent evaluations retrieved:", evaluations.length);
            return evaluations;
            
        } catch (error) {
            console.error("API: Error getting recent evaluations:", error);
            return []; // エラーでも空配列を返す
        }
    }
    
    async getEvaluationHistory(evaluationId) {
        // プレースホルダー実装
        return [
            { status: 'completed', timestamp: new Date(2023, 9, 15, 14, 10, 33), actor: 'Admin' },
            { status: 'pending_approval', timestamp: new Date(2023, 9, 12, 9, 21, 7), actor: 'Evaluator' },
            { status: 'self_assessed', timestamp: new Date(2023, 9, 5, 13, 24, 36), actor: 'Worker' }
        ];
    }

    async getEvaluationChartData() {
        try {
            const chartLabels = [
                this.app.i18n.t('chart_items.technical_skill'),
                this.app.i18n.t('chart_items.quality'),
                this.app.i18n.t('chart_items.safety'),
                this.app.i18n.t('chart_items.cooperation'),
                this.app.i18n.t('chart_items.diligence')
            ];
            
            // TODO: 実際のデータから計算する実装に変更
            const dummyData = {
                labels: chartLabels,
                datasets: [
                    { 
                        label: this.app.i18n.t('dashboard.personal_score'), 
                        data: [80, 90, 65, 75, 95], 
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', 
                        borderColor: 'rgb(54, 162, 235)' 
                    },
                    { 
                        label: this.app.i18n.t('dashboard.department_average'), 
                        data: [70, 82, 81, 78, 85], 
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', 
                        borderColor: 'rgb(255, 99, 132)' 
                    }
                ]
            };
            
            return { radar: dummyData, bar: dummyData, line: dummyData };
            
        } catch (error) {
            console.error("API: Error getting chart data:", error);
            return this.getDefaultChartData();
        }
    }

    getDefaultChartData() {
        const chartLabels = ['技術力', '品質', '安全', '協調性', '勤怠'];
        const defaultData = {
            labels: chartLabels,
            datasets: [
                { 
                    label: 'データなし', 
                    data: [0, 0, 0, 0, 0], 
                    backgroundColor: 'rgba(128, 128, 128, 0.2)', 
                    borderColor: 'rgb(128, 128, 128)' 
                }
            ]
        };
        return { radar: defaultData, bar: defaultData, line: defaultData };
    }

    // --- Settings (完全修正版) ---
    async getSettings() {
        try {
            const tenantId = this.getCurrentTenantId();
            console.log("API: Getting settings for tenant:", tenantId);
            
            const jobTypesQuery = query(
                collection(this.db, "targetJobTypes"), 
                where("tenantId", "==", tenantId)
            );
            
            const periodsQuery = query(
                collection(this.db, "evaluationPeriods"), 
                where("tenantId", "==", tenantId)
            );
            
            const structuresQuery = query(
                collection(this.db, "evaluationStructures"), 
                where("tenantId", "==", tenantId)
            );
            
            const [jobTypesSnap, periodsSnap, structuresSnap] = await Promise.all([
                getDocs(jobTypesQuery),
                getDocs(periodsQuery),
                getDocs(structuresQuery)
            ]);
            
            const structures = {};
            structuresSnap.forEach(docSnap => { 
                structures[docSnap.id] = {id: docSnap.id, ...docSnap.data()}; 
            });
            
            const settings = {
                jobTypes: jobTypesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                periods: periodsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                structures
            };
            
            console.log("API: Settings retrieved:", {
                jobTypes: settings.jobTypes.length,
                periods: settings.periods.length,
                structures: Object.keys(settings.structures).length
            });
            
            return settings;
            
        } catch (error) {
            this.handleError(error, "設定データの取得");
        }
    }

    async saveSettings(settings) {
        try {
            if (!this.app.hasRole('admin')) {
                throw new Error("管理者権限が必要です");
            }
            
            const tenantId = this.getCurrentTenantId();
            console.log("API: Saving settings for tenant:", tenantId);
            console.log("API: Settings to save:", {
                jobTypes: settings.jobTypes?.length || 0,
                periods: settings.periods?.length || 0,
                structures: Object.keys(settings.structures || {}).length
            });
            
            const batch = writeBatch(this.db);
            let operationCount = 0;
            
            // 職種を保存
            if (settings.jobTypes && Array.isArray(settings.jobTypes)) {
                settings.jobTypes.forEach(jt => {
                    if (jt.id && jt.name) {
                        const docRef = doc(this.db, "targetJobTypes", jt.id);
                        batch.set(docRef, { 
                            name: jt.name,
                            tenantId: tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        operationCount++;
                    }
                });
            }

            // 評価期間を保存
            if (settings.periods && Array.isArray(settings.periods)) {
                settings.periods.forEach(p => {
                    if (p.id && p.name && p.startDate && p.endDate) {
                        const docRef = doc(this.db, "evaluationPeriods", p.id);
                        batch.set(docRef, { 
                            name: p.name,
                            startDate: p.startDate,
                            endDate: p.endDate,
                            tenantId: tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        operationCount++;
                    }
                });
            }

            // 評価構造を保存
            if (settings.structures && typeof settings.structures === 'object') {
                Object.values(settings.structures).forEach(s => {
                    if (s && s.id) {
                        const docRef = doc(this.db, "evaluationStructures", s.id);
                        batch.set(docRef, { 
                            categories: s.categories || [],
                            tenantId: tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        operationCount++;
                    }
                });
            }
            
            if (operationCount === 0) {
                console.warn("API: No valid data to save");
                return;
            }
            
            await batch.commit();
            console.log(`API: Settings saved successfully (${operationCount} operations)`);
            
        } catch (error) {
            this.handleError(error, "設定の保存");
        }
    }
    
    async getJobTypes() {
        try {
            const tenantId = this.getCurrentTenantId();
            const q = query(
                collection(this.db, "targetJobTypes"), 
                where("tenantId", "==", tenantId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            this.handleError(error, "職種データの取得");
        }
    }

    // --- User Management ---
    async getUsers(status) {
        try {
            const tenantId = this.getCurrentTenantId();
            const q = query(
                collection(this.db, "users"), 
                where("tenantId", "==", tenantId), 
                where("status", "==", status)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("API: Error getting users:", error);
            return [];
        }
    }

    async getUserById(userId) {
        try {
            const tenantId = this.getCurrentTenantId();
            const userDocRef = doc(this.db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists() && userDocSnap.data().tenantId === tenantId) {
                return { id: userDocSnap.id, ...userDocSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("API: Error getting user:", error);
            return null;
        }
    }

    async getSubordinates() {
        try {
            const tenantId = this.getCurrentTenantId();
            const currentUserId = this.app.currentUser.uid;
            
            const q = query(
                collection(this.db, "users"), 
                where("tenantId", "==", tenantId), 
                where("evaluatorId", "==", currentUserId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("API: Error getting subordinates:", error);
            return [];
        }
    }

    async updateUser(userId, data) {
        try {
            if (!this.app.hasRole('admin')) {
                throw new Error("管理者権限が必要です");
            }
            
            const userDocRef = doc(this.db, "users", userId);
            await updateDoc(userDocRef, { 
                ...data, 
                updatedAt: serverTimestamp() 
            });
            
            console.log("API: User updated successfully:", userId);
        } catch (error) {
            this.handleError(error, "ユーザー情報の更新");
        }
    }

    async updateUserStatus(userId, status) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await updateDoc(userDocRef, { 
                status: status, 
                updatedAt: serverTimestamp() 
            });
            
            console.log("API: User status updated:", userId, status);
        } catch (error) {
            this.handleError(error, "ユーザーステータスの更新");
        }
    }

    async deleteUser(userId) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await deleteDoc(userDocRef);
            console.log("API: User deleted:", userId);
        } catch (error) {
            this.handleError(error, "ユーザーの削除");
        }
    }
    
    async createInvitation(invitationData) {
        try {
            if (!this.app.hasRole('admin')) {
                throw new Error("管理者権限が必要です");
            }
            
            const tenantId = this.getCurrentTenantId();
            const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
            const now = new Date();
            const expiresAt = new Date(now.setDate(now.getDate() + 7));
            
            const docData = {
                ...invitationData,
                tenantId: tenantId,
                companyName: this.app.currentUser.companyName,
                token: token,
                used: false,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                type: 'user'
            };
            
            await addDoc(collection(this.db, "invitations"), docData);
            console.log("API: Invitation created with token:", token);
            return token;
        } catch (error) {
            this.handleError(error, "招待の作成");
        }
    }

    // --- Evaluations & Goals ---
    async getEvaluations() {
        try {
            const tenantId = this.getCurrentTenantId();
            const q = query(
                collection(this.db, "evaluations"), 
                where("tenantId", "==", tenantId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("API: Error getting evaluations:", error);
            return [];
        }
    }

    async getEvaluationById(id) {
        try {
            const tenantId = this.getCurrentTenantId();
            const docRef = doc(this.db, "evaluations", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().tenantId === tenantId) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("API: Error getting evaluation:", error);
            return null;
        }
    }
    
    async getEvaluationStructure(jobTypeId) {
        try {
            const tenantId = this.getCurrentTenantId();
            if (!jobTypeId) return null;
            
            const docRef = doc(this.db, "evaluationStructures", jobTypeId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().tenantId === tenantId) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("API: Error getting evaluation structure:", error);
            return null;
        }
    }
    
    async saveEvaluation(data) {
        try {
            if (data.id) {
                const docRef = doc(this.db, "evaluations", data.id);
                await updateDoc(docRef, { 
                    ...data, 
                    updatedAt: serverTimestamp() 
                });
            } else {
                await addDoc(collection(this.db, "evaluations"), { 
                    ...data, 
                    createdAt: serverTimestamp() 
                });
            }
            console.log("API: Evaluation saved successfully");
        } catch (error) {
            this.handleError(error, "評価の保存");
        }
    }

    async updateEvaluationStatus(evalId, status, metadata = {}) {
        try {
            const docRef = doc(this.db, "evaluations", evalId);
            await updateDoc(docRef, { 
                status, 
                ...metadata, 
                updatedAt: serverTimestamp() 
            });
            console.log("API: Evaluation status updated:", evalId, status);
        } catch (error) {
            this.handleError(error, "評価ステータスの更新");
        }
    }

    async getGoals(userId, periodId) {
        try {
            const tenantId = this.getCurrentTenantId();
            const q = query(
                collection(this.db, "qualitativeGoals"), 
                where("tenantId", "==", tenantId), 
                where("userId", "==", userId), 
                where("periodId", "==", periodId)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) return null;
            const docSnap = querySnapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error("API: Error getting goals:", error);
            return null;
        }
    }

    async getGoalsByStatus(status) {
        try {
            const tenantId = this.getCurrentTenantId();
            const q = query(
                collection(this.db, "qualitativeGoals"), 
                where("tenantId", "==", tenantId), 
                where("status", "==", status)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("API: Error getting goals by status:", error);
            return [];
        }
    }

    async saveGoals(goalData) {
        try {
            if (goalData.id) {
                const docRef = doc(this.db, "qualitativeGoals", goalData.id);
                await updateDoc(docRef, { 
                    ...goalData, 
                    updatedAt: serverTimestamp() 
                });
            } else {
                await addDoc(collection(this.db, "qualitativeGoals"), { 
                    ...goalData, 
                    createdAt: serverTimestamp() 
                });
            }
            console.log("API: Goals saved successfully");
        } catch (error) {
            this.handleError(error, "目標の保存");
        }
    }

    async updateGoalStatus(goalId, status) {
        try {
            const docRef = doc(this.db, "qualitativeGoals", goalId);
            await updateDoc(docRef, { 
                status, 
                updatedAt: serverTimestamp() 
            });
            console.log("API: Goal status updated:", goalId, status);
        } catch (error) {
            this.handleError(error, "目標ステータスの更新");
        }
    }

    // --- Developer & Registration ---
    async getPendingAdmins() {
        try {
            const q = query(
                collection(this.db, "users"), 
                where("status", "==", "developer_approval_pending")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("API: Error getting pending admins:", error);
            return [];
        }
    }
    
    async getActiveTenants() {
        try {
            if (!this.app.hasRole('developer')) {
                throw new Error("開発者権限が必要です");
            }
            
            const tenantsQuery = query(collection(this.db, "tenants"));
            const usersQuery = query(
                collection(this.db, "users"), 
                where("role", "==", "admin")
            );
            
            const [tenantsSnap, usersSnap] = await Promise.all([
                getDocs(tenantsQuery), 
                getDocs(usersQuery)
            ]);
            
            const tenants = tenantsSnap.docs.map(doc => ({
                id: doc.id, 
                ...doc.data()
            }));
            
            const adminUsers = usersSnap.docs.map(doc => ({
                id: doc.id, 
                ...doc.data()
            }));
            
            return tenants.map(tenant => {
                const admin = adminUsers.find(u => u.tenantId === tenant.id);
                return { 
                    ...tenant, 
                    adminName: admin ? admin.name : 'N/A', 
                    adminEmail: admin ? admin.email : 'N/A' 
                };
            });
        } catch (error) {
            this.handleError(error, "アクティブテナントの取得");
        }
    }
    
    async getInvitation(token) {
        try {
            const q = query(
                collection(this.db, "invitations"), 
                where("token", "==", token)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) return null;
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error("API: Error getting invitation:", error);
            return null;
        }
    }

    async approveAdmin(userId) {
        try {
            const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
            await approveAdminFunction({ userId });
            console.log("API: Admin approved:", userId);
        } catch (error) {
            this.handleError(error, "管理者の承認");
        }
    }

    async updateTenantStatus(tenantId, status) {
        try {
            if (!this.app.hasRole('developer')) {
                throw new Error("開発者権限が必要です");
            }
            
            const tenantRef = doc(this.db, "tenants", tenantId);
            await updateDoc(tenantRef, { 
                status: status, 
                updatedAt: serverTimestamp() 
            });
            
            console.log("API: Tenant status updated:", tenantId, status);
        } catch (error) {
            this.handleError(error, "テナントステータスの更新");
        }
    }

    // --- 追加の必要なメソッド ---
    async createUserProfile(userId, profileData) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await setDoc(userDocRef, { 
                ...profileData, 
                createdAt: serverTimestamp() 
            });
            console.log("API: User profile created:", userId);
        } catch (error) {
            this.handleError(error, "ユーザープロフィールの作成");
        }
    }

    async markInvitationAsUsed(invitationId, userId) {
        try {
            const invitationRef = doc(this.db, "invitations", invitationId);
            await updateDoc(invitationRef, { 
                used: true, 
                usedBy: userId, 
                usedAt: serverTimestamp() 
            });
            console.log("API: Invitation marked as used:", invitationId);
        } catch (error) {
            this.handleError(error, "招待の使用済みマーク");
        }
    }

    // --- 接続確認メソッド ---
    async testConnection() {
        try {
            const tenantId = this.getCurrentTenantId();
            console.log("API: Testing connection for tenant:", tenantId);
            
            // 簡単なクエリでFirestore接続をテスト
            const testQuery = query(
                collection(this.db, "users"), 
                where("tenantId", "==", tenantId),
                limit(1)
            );
            
            await getDocs(testQuery);
            console.log("API: Connection test successful");
            return true;
        } catch (error) {
            console.error("API: Connection test failed:", error);
            return false;
        }
    }
}
