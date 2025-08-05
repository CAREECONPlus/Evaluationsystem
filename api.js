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
    orderBy
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";

/**
 * API Service (Firestore Integrated) - Complete Version with Settings Fix
 * APIサービス (Firestore連携版) - 設定保存修正版
 */
export class API {
    constructor(app) {
        this.app = app;
        this.db = window.firebase.db;
        this.functions = window.firebase.functions;
    }

    // --- Dashboard ---
    async getDashboardStats() {
        if (!this.app.currentUser?.tenantId) return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
        const tenantId = this.app.currentUser.tenantId;
        
        try {
            const usersQuery = query(collection(this.db, "users"), where("tenantId", "==", tenantId));
            const completedEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "==", "completed"));
            
            const pendingStatuses = ['pending_submission', 'pending_evaluation', 'pending_approval', 'self_assessed', 'rejected', 'draft'];
            const pendingEvalsQuery = query(collection(this.db, "evaluations"), where("tenantId", "==", tenantId), where("status", "in", pendingStatuses));

            const [usersSnapshot, completedEvalsSnapshot, pendingEvalsSnapshot] = await Promise.all([
                getCountFromServer(usersQuery),
                getCountFromServer(completedEvalsQuery),
                getCountFromServer(pendingEvalsQuery)
            ]);

            return {
                totalUsers: usersSnapshot.data().count,
                completedEvaluations: completedEvalsSnapshot.data().count,
                pendingEvaluations: pendingEvalsSnapshot.data().count
            };
        } catch (error) {
            console.error("Error getting dashboard stats:", error);
            return { totalUsers: 0, completedEvaluations: 0, pendingEvaluations: 0 };
        }
    }

    async getRecentEvaluations() {
        if (!this.app.currentUser?.tenantId) return [];
        try {
            const q = query(
                collection(this.db, "evaluations"), 
                where("tenantId", "==", this.app.currentUser.tenantId), 
                orderBy("submittedAt", "desc"), 
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting recent evaluations:", error);
            return [];
        }
    }
    
    async getEvaluationHistory(evaluationId) {
        // This is a placeholder for a more complex history/audit log feature.
        // For now, it returns a static list.
        return [
            { status: 'completed', timestamp: new Date(2023, 9, 15, 14, 10, 33), actor: 'Admin' },
            { status: 'pending_approval', timestamp: new Date(2023, 9, 12, 9, 21, 7), actor: 'Evaluator' },
            { status: 'self_assessed', timestamp: new Date(2023, 9, 5, 13, 24, 36), actor: 'Worker' }
        ];
    }

    async getEvaluationChartData() {
        const chartLabels = [
            this.app.i18n.t('chart_items.technical_skill'),
            this.app.i18n.t('chart_items.quality'),
            this.app.i18n.t('chart_items.safety'),
            this.app.i18n.t('chart_items.cooperation'),
            this.app.i18n.t('chart_items.diligence')
        ];
        
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
    }

    // --- User Management ---
    async getUsers(status) {
        if (!this.app.currentUser?.tenantId) return [];
        try {
            const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting users:", error);
            return [];
        }
    }

    async getUserById(userId) {
        if (!this.app.currentUser?.tenantId) return null;
        try {
            const userDocRef = doc(this.db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && userDocSnap.data().tenantId === this.app.currentUser.tenantId) {
                return { id: userDocSnap.id, ...userDocSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting user:", error);
            return null;
        }
    }

    async getSubordinates() {
        if (!this.app.currentUser?.tenantId || !this.app.currentUser.uid) return [];
        try {
            const q = query(collection(this.db, "users"), where("tenantId", "==", this.app.currentUser.tenantId), where("evaluatorId", "==", this.app.currentUser.uid));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting subordinates:", error);
            return [];
        }
    }

    async updateUser(userId, data) {
        if (!this.app.hasRole('admin')) throw new Error("Permission denied.");
        try {
            const userDocRef = doc(this.db, "users", userId);
            await updateDoc(userDocRef, { ...data, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    async updateUserStatus(userId, status) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await updateDoc(userDocRef, { status: status, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await deleteDoc(userDocRef);
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }
    
    async createInvitation(invitationData) {
        if (!this.app.hasRole('admin')) throw new Error("Permission denied.");
        try {
            const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
            const now = new Date();
            const expiresAt = new Date(now.setDate(now.getDate() + 7));
            const docData = {
                ...invitationData,
                tenantId: this.app.currentUser.tenantId,
                companyName: this.app.currentUser.companyName,
                token: token,
                used: false,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                type: 'user'
            };
            await addDoc(collection(this.db, "invitations"), docData);
            return token;
        } catch (error) {
            console.error("Error creating invitation:", error);
            throw error;
        }
    }

    // --- Evaluations & Goals ---
    async getEvaluations() {
        if (!this.app.currentUser?.tenantId) return [];
        try {
            const q = query(collection(this.db, "evaluations"), where("tenantId", "==", this.app.currentUser.tenantId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting evaluations:", error);
            return [];
        }
    }

    async getEvaluationById(id) {
        try {
            const docRef = doc(this.db, "evaluations", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().tenantId === this.app.currentUser.tenantId) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting evaluation:", error);
            return null;
        }
    }
    
    async getEvaluationStructure(jobTypeId) {
        if (!this.app.currentUser?.tenantId || !jobTypeId) return null;
        try {
            const docRef = doc(this.db, "evaluationStructures", jobTypeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().tenantId === this.app.currentUser.tenantId) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting evaluation structure:", error);
            return null;
        }
    }
    
    async saveEvaluation(data) {
        try {
            if (data.id) {
                const docRef = doc(this.db, "evaluations", data.id);
                await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(this.db, "evaluations"), { ...data, createdAt: serverTimestamp() });
            }
        } catch (error) {
            console.error("Error saving evaluation:", error);
            throw error;
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
        } catch (error) {
            console.error("Error updating evaluation status:", error);
            throw error;
        }
    }

    async getGoals(userId, periodId) {
        if (!this.app.currentUser?.tenantId) return null;
        try {
            const q = query(
                collection(this.db, "qualitativeGoals"), 
                where("tenantId", "==", this.app.currentUser.tenantId), 
                where("userId", "==", userId), 
                where("periodId", "==", periodId)
            );
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;
            const docSnap = querySnapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error("Error getting goals:", error);
            return null;
        }
    }

    async getGoalsByStatus(status) {
        if (!this.app.currentUser?.tenantId) return [];
        try {
            const q = query(collection(this.db, "qualitativeGoals"), where("tenantId", "==", this.app.currentUser.tenantId), where("status", "==", status));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting goals by status:", error);
            return [];
        }
    }

    async saveGoals(goalData) {
        try {
            if (goalData.id) {
                const docRef = doc(this.db, "qualitativeGoals", goalData.id);
                await updateDoc(docRef, { ...goalData, updatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(this.db, "qualitativeGoals"), { ...goalData, createdAt: serverTimestamp() });
            }
        } catch (error) {
            console.error("Error saving goals:", error);
            throw error;
        }
    }

    async updateGoalStatus(goalId, status) {
        try {
            const docRef = doc(this.db, "qualitativeGoals", goalId);
            await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating goal status:", error);
            throw error;
        }
    }

    // --- Settings (修正版) ---
    async getSettings() {
        if (!this.app.currentUser?.tenantId) return { jobTypes: [], periods: [], structures: {} };
        const tenantId = this.app.currentUser.tenantId;
        
        try {
            const jobTypesQuery = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", tenantId));
            const periodsQuery = query(collection(this.db, "evaluationPeriods"), where("tenantId", "==", tenantId));
            const structuresQuery = query(collection(this.db, "evaluationStructures"), where("tenantId", "==", tenantId));
            
            const [jobTypesSnap, periodsSnap, structuresSnap] = await Promise.all([
                getDocs(jobTypesQuery),
                getDocs(periodsQuery),
                getDocs(structuresQuery)
            ]);
            
            const structures = {};
            structuresSnap.forEach(docSnap => { 
                structures[docSnap.id] = {id: docSnap.id, ...docSnap.data()}; 
            });
            
            return {
                jobTypes: jobTypesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                periods: periodsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                structures
            };
        } catch (error) {
            console.error("Error getting settings:", error);
            return { jobTypes: [], periods: [], structures: {} };
        }
    }

    async saveSettings(settings) {
        if (!this.app.hasRole('admin')) {
            throw new Error("管理者権限が必要です");
        }
        
        const tenantId = this.app.currentUser.tenantId;
        if (!tenantId) {
            throw new Error("テナントIDが見つかりません");
        }
        
        try {
            const batch = writeBatch(this.db);
            
            // 職種を保存
            if (settings.jobTypes && Array.isArray(settings.jobTypes)) {
                settings.jobTypes.forEach(jt => {
                    if (jt.id) {
                        const docRef = doc(this.db, "targetJobTypes", jt.id);
                        batch.set(docRef, { 
                            ...jt, 
                            tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                    }
                });
            }

            // 評価期間を保存
            if (settings.periods && Array.isArray(settings.periods)) {
                settings.periods.forEach(p => {
                    if (p.id) {
                        const docRef = doc(this.db, "evaluationPeriods", p.id);
                        batch.set(docRef, { 
                            ...p, 
                            tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                    }
                });
            }

            // 評価構造を保存
            if (settings.structures && typeof settings.structures === 'object') {
                Object.values(settings.structures).forEach(s => {
                    if (s && s.id) {
                        const docRef = doc(this.db, "evaluationStructures", s.id);
                        batch.set(docRef, { 
                            ...s, 
                            tenantId,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                    }
                });
            }
            
            await batch.commit();
            console.log("Settings saved successfully");
        } catch (error) {
            console.error("Error saving settings:", error);
            throw new Error("設定の保存に失敗しました: " + error.message);
        }
    }
    
    async getJobTypes() {
        if (!this.app.currentUser?.tenantId) return [];
        try {
            const q = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", this.app.currentUser.tenantId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting job types:", error);
            return [];
        }
    }

    // --- Developer & Registration ---
    async getPendingAdmins() {
        try {
            const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error getting pending admins:", error);
            return [];
        }
    }
    
    async getActiveTenants() {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        try {
            const tenantsQuery = query(collection(this.db, "tenants"));
            const usersQuery = query(collection(this.db, "users"), where("role", "==", "admin"));
            const [tenantsSnap, usersSnap] = await Promise.all([getDocs(tenantsQuery), getDocs(usersQuery)]);
            const tenants = tenantsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const adminUsers = usersSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
            return tenants.map(tenant => {
                const admin = adminUsers.find(u => u.tenantId === tenant.id);
                return { ...tenant, adminName: admin ? admin.name : 'N/A', adminEmail: admin ? admin.email : 'N/A' };
            });
        } catch (error) {
            console.error("Error getting active tenants:", error);
            return [];
        }
    }
    
    async getInvitation(token) {
        try {
            const q = query(collection(this.db, "invitations"), where("token", "==", token));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error("Error getting invitation:", error);
            return null;
        }
    }

    async approveAdmin(userId) {
        try {
            const approveAdminFunction = httpsCallable(this.functions, 'approveAdmin');
            await approveAdminFunction({ userId });
        } catch (error) {
            console.error("Error approving admin:", error);
            throw error;
        }
    }

    async updateTenantStatus(tenantId, status) {
        if (!this.app.hasRole('developer')) throw new Error("Permission denied.");
        try {
            const tenantRef = doc(this.db, "tenants", tenantId);
            await updateDoc(tenantRef, { status: status, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating tenant status:", error);
            throw error;
        }
    }

    // --- 追加の必要なメソッド ---
    async createUserProfile(userId, profileData) {
        try {
            const userDocRef = doc(this.db, "users", userId);
            await setDoc(userDocRef, { ...profileData, createdAt: serverTimestamp() });
        } catch (error) {
            console.error("Error creating user profile:", error);
            throw error;
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
        } catch (error) {
            console.error("Error marking invitation as used:", error);
            throw error;
        }
    }
}
