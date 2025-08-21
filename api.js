// Firebase SDKから必要な関数をインポートします。
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  getCountFromServer,
  limit,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

/**
 * API Service (修正版)
 * Firebase Firestoreとのすべての通信を処理します。
 */
export class API {
  constructor(app) {
    this.app = app

    if (!app.auth || !app.auth.firebaseApp || !app.auth.db) {
      console.error("API FATAL: Firebase/Firestore not initialized in Auth module!")
      if (this.app.showError) {
        this.app.showError("アプリケーションの初期化に失敗しました。")
      }
      return
    }
    
    this.firebaseApp = app.auth.firebaseApp
    this.db = app.auth.db  
    this.serverTimestamp = serverTimestamp
    this.defaultTimeout = 10000
    
    console.log("API: Initialized with shared Firestore instance from Auth")
  }

  // タイムアウト付きクエリ実行
  async executeWithTimeout(queryPromise, operation, timeout = this.defaultTimeout) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} timeout`)), timeout)
    })
    
    try {
      return await Promise.race([queryPromise, timeoutPromise])
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error(`${operation}がタイムアウトしました。ネットワーク接続を確認してください。`)
      }
      throw error
    }
  }

  handleError(error, operation) {
    console.error(`API: Error in ${operation}:`, error)
    
    const errorMessages = {
      "permission-denied": "権限がありません。Firestoreのセキュリティルールを確認してください。",
      "not-found": "データが見つかりません。",
      "unavailable": "サービスが一時的に利用できません。しばらくしてからもう一度お試しください。",
      "unauthenticated": "認証が必要です。再度ログインしてください。",
      "network-request-failed": "ネットワークエラーが発生しました。接続を確認してください。",
      "quota-exceeded": "リクエスト制限に達しました。しばらくお待ちください。"
    }
    
    const message = error.code 
      ? errorMessages[error.code] || `エラー: ${error.message}`
      : `予期せぬエラーが発生しました: ${operation}`

    this.app.showError(message)
    throw error
  }

  // --- User and Tenant Management ---

  async getUserProfile(uid) {
    try {
      if (!this.db) {
        throw new Error("Firestore is not initialized")
      }
      
      let userDocRef;
      try {
        userDocRef = doc(this.db, "users", uid)
      } catch (docError) {
        console.error("API: Error creating document reference:", docError)
        throw new Error("Failed to create document reference")
      }
      
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() }
        
        // tenantIdがnullの場合の修復処理
        if (!userData.tenantId && userData.role !== 'developer') {
          console.warn("API: User has null tenantId, attempting to resolve:", uid)
          
          // 管理者の場合、テナントを検索して設定
          if (userData.role === 'admin') {
            try {
              const tenantsQuery = query(
                collection(this.db, "tenants"),
                where("adminId", "==", uid)
              )
              const tenantsSnapshot = await getDocs(tenantsQuery)
              
              if (!tenantsSnapshot.empty) {
                const tenantData = tenantsSnapshot.docs[0]
                const tenantId = tenantData.id
                
                // ユーザーのtenantIdを更新
                await updateDoc(userDocRef, {
                  tenantId: tenantId,
                  updatedAt: serverTimestamp()
                })
                
                userData.tenantId = tenantId
                console.log("API: Resolved tenantId for admin:", tenantId)
              }
            } catch (resolveError) {
              console.error("API: Failed to resolve tenantId:", resolveError)
            }
          }
        }
        
        console.log("API: User profile found:", userData)
        return userData
      }
      
      console.log("API: User profile not found for uid:", uid)
      return null
    } catch (error) {
      this.handleError(error, `ユーザープロファイルの取得 (uid: ${uid})`)
    }
  }

  async createUserProfile(uid, profileData) {
    try {
      await this.executeWithTimeout(
        setDoc(doc(this.db, "users", uid), {
          ...profileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        "ユーザープロファイルの作成"
      )
    } catch (error) {
      this.handleError(error, "ユーザープロファイルの作成")
    }
  }

  async getUsers(status = "active") {
    try {
      if (!this.db) {
        throw new Error("Firestore is not initialized")
      }
      
      const q = query(
        collection(this.db, "users"),
        where("tenantId", "==", this.app.currentUser.tenantId),
        where("status", "==", status),
      )
      const querySnapshot = await this.executeWithTimeout(
        getDocs(q),
        `ユーザーリストの取得 (status: ${status})`
      )
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      this.handleError(error, `ユーザーリストの取得 (status: ${status})`)
    }
  }

  async getSubordinates() {
    try {
      const q = query(
        collection(this.db, "users"),
        where("tenantId", "==", this.app.currentUser.tenantId),
        where("evaluatorId", "==", this.app.currentUser.uid),
        where("status", "==", "active"),
      )
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "部下一覧の取得"
      )
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      this.handleError(error, "部下一覧の取得")
    }
  }

  async updateUser(userId, data) {
    try {
      const userRef = doc(this.db, "users", userId)
      await this.executeWithTimeout(
        updateDoc(userRef, {
          ...data,
          updatedAt: serverTimestamp(),
        }),
        `ユーザー情報の更新 (userId: ${userId})`
      )
    } catch (error) {
      this.handleError(error, `ユーザー情報の更新 (userId: ${userId})`)
    }
  }

  async updateUserStatus(userId, status) {
    try {
      await this.executeWithTimeout(
        updateDoc(doc(this.db, "users", userId), {
          status: status,
          updatedAt: serverTimestamp(),
        }),
        `ユーザーステータスの更新 (userId: ${userId})`
      )
    } catch (error) {
      this.handleError(error, `ユーザーステータスの更新 (userId: ${userId})`)
    }
  }

  async deleteUser(userId) {
    try {
      await this.executeWithTimeout(
        deleteDoc(doc(this.db, "users", userId)),
        `ユーザーの削除 (userId: ${userId})`
      )
    } catch (error) {
      this.handleError(error, `ユーザーの削除 (userId: ${userId})`)
    }
  }

  async createInvitation(invitationData) {
    try {
      const invitationRef = doc(collection(this.db, "invitations"))
      const token = invitationRef.id
      await this.executeWithTimeout(
        setDoc(invitationRef, {
          ...invitationData,
          token: token,
          tenantId: this.app.currentUser.tenantId,
          companyName: this.app.currentUser.companyName,
          used: false,
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
        "招待の作成"
      )
      return token
    } catch (error) {
      this.handleError(error, "招待の作成")
    }
  }

  async createAdminInvitation(invitationData) {
    try {
      if (!this.app.hasRole("developer")) {
        throw new Error("開発者権限が必要です")
      }

      const invitationRef = doc(collection(this.db, "invitations"))
      const token = invitationRef.id
      await this.executeWithTimeout(
        setDoc(invitationRef, {
          ...invitationData,
          type: "admin",
          token: token,
          used: false,
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
        "管理者招待の作成"
      )
      return token
    } catch (error) {
      this.handleError(error, "管理者招待の作成")
    }
  }

  async getInvitation(token) {
    try {
      const q = query(collection(this.db, "invitations"), where("token", "==", token))
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "招待情報の取得"
      )
      if (snapshot.empty) return null
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    } catch (error) {
      this.handleError(error, "招待情報の取得")
    }
  }

  async markInvitationAsUsed(invitationId, userId) {
    try {
      const invitationRef = doc(this.db, "invitations", invitationId)
      const invitationDoc = await getDoc(invitationRef)
      
      if (!invitationDoc.exists()) {
        throw new Error("Invitation not found")
      }
      
      const invitationData = invitationDoc.data()
      
      // 招待データからtenantIdを取得してユーザーに設定
      if (invitationData.tenantId) {
        const userRef = doc(this.db, "users", userId)
        const batch = writeBatch(this.db)
        
        // 招待の使用済みマーク
        batch.update(invitationRef, {
          used: true,
          usedAt: serverTimestamp(),
          usedBy: userId,
        })
        
        // ユーザーのtenantId更新
        batch.update(userRef, {
          tenantId: invitationData.tenantId,
          companyName: invitationData.companyName,
          updatedAt: serverTimestamp(),
        })
        
        await batch.commit()
      } else {
        // フォールバック: 招待のみ更新
        await this.executeWithTimeout(
          updateDoc(invitationRef, {
            used: true,
            usedAt: serverTimestamp(),
            usedBy: userId,
          }),
          "招待の使用済み更新"
        )
      }
    } catch (error) {
      this.handleError(error, "招待の使用済み更新")
    }
  }

  // --- Settings ---
  async getSettings() {
    try {
      const currentUser = this.app.currentUser
      
      // ユーザー認証チェック
      if (!currentUser) {
        throw new Error("ユーザーが認証されていません")
      }
      
      // 管理者権限チェック
      if (currentUser.role !== 'admin') {
        throw new Error("設定にアクセスする権限がありません")
      }
      
      // テナントIDチェック
      if (!currentUser.tenantId) {
        throw new Error("テナントIDが設定されていません")
      }

      const tenantId = currentUser.tenantId
      console.log("API: Loading settings for tenant:", tenantId)

      const jobTypesQuery = query(
        collection(this.db, "targetJobTypes"), 
        where("tenantId", "==", tenantId)
      )
      
      const periodsQuery = query(
        collection(this.db, "evaluationPeriods"), 
        where("tenantId", "==", tenantId)
      )
      
      const structuresQuery = query(
        collection(this.db, "evaluationStructures"), 
        where("tenantId", "==", tenantId)
      )

      // タイムアウト付きでデータを取得
      const [jobTypesSnap, periodsSnap, structuresSnap] = await this.executeWithTimeout(
        Promise.all([
          getDocs(jobTypesQuery),
          getDocs(periodsQuery),
          getDocs(structuresQuery),
        ]),
        "設定情報の取得"
      )

      const structures = {}
      structuresSnap.docs.forEach((doc) => {
        structures[doc.data().jobTypeId] = { id: doc.id, ...doc.data() }
      })

      const result = {
        jobTypes: jobTypesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        periods: periodsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        structures: structures,
      }

      console.log("API: Settings loaded successfully:", result)
      return result
      
    } catch (error) {
      console.error("API: Error in getSettings:", error)
      
      if (error.message === "Settings loading timeout") {
        throw new Error("設定の読み込みがタイムアウトしました。ネットワーク接続を確認してください。")
      }
      
      if (error.code === "permission-denied") {
        throw new Error("設定データにアクセスする権限がありません。Firestoreのセキュリティルールを確認してください。")
      }
      
      this.handleError(error, "設定情報の取得")
    }
  }

  async getJobTypes() {
    try {
      const q = query(collection(this.db, "targetJobTypes"), where("tenantId", "==", this.app.currentUser.tenantId))
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "職種リストの取得"
      )
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      this.handleError(error, "職種リストの取得")
    }
  }

  async getEvaluationStructure(jobTypeId) {
    try {
      const q = query(
        collection(this.db, "evaluationStructures"),
        where("jobTypeId", "==", jobTypeId),
        where("tenantId", "==", this.app.currentUser.tenantId),
      )
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        `評価構造の取得 (jobTypeId: ${jobTypeId})`
      )
      if (snapshot.empty) return null
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    } catch (error) {
      this.handleError(error, `評価構造の取得 (jobTypeId: ${jobTypeId})`)
    }
  }

  async saveSettings(settings) {
    const batch = writeBatch(this.db)
    const tenantId = this.app.currentUser.tenantId

    try {
      // 職種の保存
      settings.jobTypes.forEach((jt) => {
        const ref =
          jt.id && !jt.id.startsWith("jt_")
            ? doc(this.db, "targetJobTypes", jt.id)
            : doc(collection(this.db, "targetJobTypes"))
        batch.set(
          ref,
          {
            name: jt.name,
            tenantId: tenantId,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      })

      // 評価期間の保存
      settings.periods.forEach((period) => {
        const ref =
          period.id && !period.id.startsWith("p_")
            ? doc(this.db, "evaluationPeriods", period.id)
            : doc(collection(this.db, "evaluationPeriods"))
        batch.set(
          ref,
          {
            name: period.name,
            startDate: period.startDate,
            endDate: period.endDate,
            tenantId: tenantId,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      })

      // 評価構造の保存
      Object.keys(settings.structures).forEach((jobTypeId) => {
        const structure = settings.structures[jobTypeId]
        if (structure && structure.categories) {
          const ref =
            structure.id && !structure.id.startsWith("struct_")
              ? doc(this.db, "evaluationStructures", structure.id)
              : doc(collection(this.db, "evaluationStructures"))
          batch.set(
            ref,
            {
              jobTypeId: jobTypeId,
              categories: structure.categories,
              tenantId: tenantId,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        }
      })

      await this.executeWithTimeout(
        batch.commit(),
        "設定の保存"
      )
    } catch (error) {
      this.handleError(error, "設定の保存")
    }
  }

  // --- Goals Management ---

  async getGoals(userId, periodId) {
    try {
      const q = query(
        collection(this.db, "qualitativeGoals"),
        where("userId", "==", userId),
        where("periodId", "==", periodId),
        where("tenantId", "==", this.app.currentUser.tenantId),
      )
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "目標の取得"
      )
      if (snapshot.empty) return null
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    } catch (error) {
      this.handleError(error, "目標の取得")
    }
  }

  async saveGoals(goalData) {
    try {
      if (goalData.id && !goalData.id.startsWith("goal_")) {
        // 既存の目標を更新
        const goalRef = doc(this.db, "qualitativeGoals", goalData.id)
        await this.executeWithTimeout(
          updateDoc(goalRef, {
            goals: goalData.goals,
            status: goalData.status,
            submittedAt: goalData.submittedAt,
            updatedAt: serverTimestamp(),
          }),
          "目標の更新"
        )
      } else {
        // 新規目標を作成
        const goalRef = await this.executeWithTimeout(
          addDoc(collection(this.db, "qualitativeGoals"), {
            userId: goalData.userId,
            userName: goalData.userName,
            periodId: goalData.periodId,
            periodName: goalData.periodName,
            goals: goalData.goals,
            status: goalData.status,
            tenantId: goalData.tenantId,
            submittedAt: goalData.submittedAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          "目標の作成"
        )
        return goalRef.id
      }
    } catch (error) {
      this.handleError(error, "目標の保存")
    }
  }

  async getGoalsByStatus(status) {
    try {
      const q = query(
        collection(this.db, "qualitativeGoals"),
        where("tenantId", "==", this.app.currentUser.tenantId),
        where("status", "==", status),
      )
      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        `目標の取得 (status: ${status})`
      )
      const goals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      return goals.sort((a, b) => {
        const aTime = a.submittedAt?.toMillis?.() || 0
        const bTime = b.submittedAt?.toMillis?.() || 0
        return bTime - aTime
      })
    } catch (error) {
      this.handleError(error, `目標の取得 (status: ${status})`)
    }
  }

  async updateGoalStatus(goalId, status, additionalData = {}) {
    try {
      const goalRef = doc(this.db, "qualitativeGoals", goalId)
      await this.executeWithTimeout(
        updateDoc(goalRef, {
          status: status,
          updatedAt: serverTimestamp(),
          ...additionalData,
        }),
        "目標ステータスの更新"
      )
    } catch (error) {
      this.handleError(error, "目標ステータスの更新")
    }
  }

  // --- Evaluations Management ---

  async getEvaluations(filters = {}) {
    try {
      let q = query(collection(this.db, "evaluations"), where("tenantId", "==", this.app.currentUser.tenantId))

      // フィルターがある場合は追加
      if (filters.targetUserId) {
        q = query(q, where("targetUserId", "==", filters.targetUserId))
      }
      if (filters.periodId) {
        q = query(q, where("periodId", "==", filters.periodId))
      }
      if (filters.status) {
        q = query(q, where("status", "==", filters.status))
      }

      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "評価一覧の取得"
      )
      const evaluations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      return evaluations.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0
        const bTime = b.updatedAt?.toMillis?.() || 0
        return bTime - aTime
      })
    } catch (error) {
      this.handleError(error, "評価一覧の取得")
    }
  }

  async saveEvaluation(evaluationData) {
    try {
      if (evaluationData.id && !evaluationData.id.startsWith("eval_")) {
        // 既存の評価を更新
        const evalRef = doc(this.db, "evaluations", evaluationData.id)
        await this.executeWithTimeout(
          updateDoc(evalRef, {
            ratings: evaluationData.ratings,
            status: evaluationData.status,
            submittedAt: evaluationData.submittedAt,
            updatedAt: evaluationData.updatedAt,
          }),
          "評価の更新"
        )
      } else {
        // 新規評価を作成
        const evalRef = await this.executeWithTimeout(
          addDoc(collection(this.db, "evaluations"), {
            tenantId: evaluationData.tenantId,
            targetUserId: evaluationData.targetUserId,
            targetUserName: evaluationData.targetUserName,
            targetUserEmail: evaluationData.targetUserEmail,
            jobTypeId: evaluationData.jobTypeId,
            periodId: evaluationData.periodId,
            periodName: evaluationData.periodName,
            evaluatorId: evaluationData.evaluatorId,
            evaluatorName: evaluationData.evaluatorName,
            ratings: evaluationData.ratings,
            status: evaluationData.status,
            submittedAt: evaluationData.submittedAt,
            createdAt: serverTimestamp(),
            updatedAt: evaluationData.updatedAt,
          }),
          "評価の作成"
        )
        return evalRef.id
      }
    } catch (error) {
      this.handleError(error, "評価の保存")
    }
  }

  async updateEvaluationStatus(evaluationId, status, additionalData = {}) {
    try {
      const evalRef = doc(this.db, "evaluations", evaluationId)
      await this.executeWithTimeout(
        updateDoc(evalRef, {
          status: status,
          updatedAt: serverTimestamp(),
          ...additionalData,
        }),
        "評価ステータスの更新"
      )
    } catch (error) {
      this.handleError(error, "評価ステータスの更新")
    }
  }

  async getEvaluationById(evaluationId) {
    try {
      const evalRef = doc(this.db, "evaluations", evaluationId)
      const evalDoc = await this.executeWithTimeout(
        getDoc(evalRef),
        `評価の取得 (id: ${evaluationId})`
      )
      if (evalDoc.exists()) {
        return { id: evalDoc.id, ...evalDoc.data() }
      }
      return null
    } catch (error) {
      this.handleError(error, `評価の取得 (id: ${evaluationId})`)
    }
  }

  async getEvaluationHistory(evaluationId) {
    try {
      // 簡単な履歴シミュレーション（実際の実装では別コレクションまたは履歴フィールドを使用）
      const evaluation = await this.getEvaluationById(evaluationId)
      if (!evaluation) return []

      const history = []

      // 作成時
      if (evaluation.createdAt) {
        history.push({
          status: "created",
          timestamp: evaluation.createdAt,
          actor: evaluation.targetUserName,
        })
      }

      // 提出時
      if (evaluation.submittedAt && evaluation.status !== "draft") {
        history.push({
          status: evaluation.status === "self_assessed" ? "self_assessed" : "submitted",
          timestamp: evaluation.submittedAt,
          actor: evaluation.status === "self_assessed" ? evaluation.targetUserName : evaluation.evaluatorName,
        })
      }

      // 完了時
      if (evaluation.status === "completed" && evaluation.updatedAt) {
        history.push({
          status: "completed",
          timestamp: evaluation.updatedAt,
          actor: "System",
        })
      }

      return history.sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      this.handleError(error, "評価履歴の取得")
    }
  }

  // --- Dashboard ---

  async getDashboardStats() {
    try {
      const currentUser = this.app.currentUser
      if (!currentUser) throw new Error("User not authenticated")

      // 開発者の場合は全テナントの統計を取得
      if (currentUser.role === "developer") {
        const usersRef = collection(this.db, "users")
        const evaluationsRef = collection(this.db, "evaluations")

        const totalUsersQuery = query(usersRef, where("status", "==", "active"))
        const completedQuery = query(evaluationsRef, where("status", "==", "completed"))
        const pendingQuery = query(evaluationsRef, where("status", "in", ["pending_approval", "self_assessed"]))

        const [totalUsersSnap, completedSnap, pendingSnap] = await this.executeWithTimeout(
          Promise.all([
            getCountFromServer(totalUsersQuery),
            getCountFromServer(completedQuery),
            getCountFromServer(pendingQuery),
          ]),
          "ダッシュボード統計の取得"
        )

        return {
          totalUsers: totalUsersSnap.data().count,
          completedEvaluations: completedSnap.data().count,
          pendingEvaluations: pendingSnap.data().count,
        }
      }

      // 通常のユーザーの場合
      if (!currentUser.tenantId) throw new Error("tenantId is missing")

      const usersRef = collection(this.db, "users")
      const evaluationsRef = collection(this.db, "evaluations")

      const tenantId = currentUser.tenantId
      const totalUsersQuery = query(usersRef, where("tenantId", "==", tenantId), where("status", "==", "active"))
      const completedQuery = query(
        evaluationsRef,
        where("tenantId", "==", tenantId),
        where("status", "==", "completed"),
      )
      const pendingQuery = query(
        evaluationsRef,
        where("tenantId", "==", tenantId),
        where("status", "in", ["pending_approval", "self_assessed"]),
      )

      const [totalUsersSnap, completedSnap, pendingSnap] = await this.executeWithTimeout(
        Promise.all([
          getCountFromServer(totalUsersQuery),
          getCountFromServer(completedQuery),
          getCountFromServer(pendingQuery),
        ]),
        "ダッシュボード統計の取得"
      )

      return {
        totalUsers: totalUsersSnap.data().count,
        completedEvaluations: completedSnap.data().count,
        pendingEvaluations: pendingSnap.data().count,
      }
    } catch (error) {
      this.handleError(error, "ダッシュボード統計の取得")
    }
  }

  async getRecentEvaluations() {
    try {
      const currentUser = this.app.currentUser
      if (!currentUser) throw new Error("User not authenticated")

      let q

      // 開発者の場合は全テナントから取得
      if (currentUser.role === "developer") {
        q = query(collection(this.db, "evaluations"), limit(20))
      } else {
        // 通常のユーザーの場合
        if (!currentUser.tenantId) throw new Error("tenantId is missing")

        q = query(collection(this.db, "evaluations"), where("tenantId", "==", currentUser.tenantId), limit(20))
      }

      const snapshot = await this.executeWithTimeout(
        getDocs(q),
        "最近の評価取得"
      )
      const evaluations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      return evaluations
        .sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() || 0
          const bTime = b.updatedAt?.toMillis?.() || 0
          return bTime - aTime
        })
        .slice(0, 5)
    } catch (error) {
      this.handleError(error, "最近の評価取得")
    }
  }

  async getEvaluationChartData() {
    try {
      return {
        labels: ["技術力", "品質", "安全", "協調性", "勤怠"],
        datasets: [
          {
            label: "部署平均",
            data: [4.2, 3.8, 4.5, 4.0, 4.8],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
          },
          {
            label: "あなたの評価",
            data: [4.5, 4.0, 4.8, 4.2, 5.0],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
          },
        ],
      }
    } catch (error) {
      this.handleError(error, "チャートデータ取得")
    }
  }

  // --- Developer-specific methods ---
  async getPendingAdmins() {
    try {
      if (!this.app.hasRole("developer")) throw new Error("開発者権限が必要です")
      const q = query(collection(this.db, "users"), where("status", "==", "developer_approval_pending"))
      const querySnapshot = await this.executeWithTimeout(
        getDocs(q),
        "承認待ち管理者リストの取得"
      )
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      this.handleError(error, "承認待ち管理者リストの取得")
    }
  }

  async getActiveTenants() {
    try {
      if (!this.app.hasRole("developer")) throw new Error("開発者権限が必要です")
      const tenantsQuery = query(collection(this.db, "tenants"), where("status", "==", "active"))
      const usersQuery = query(
        collection(this.db, "users"),
        where("role", "==", "admin"),
        where("status", "==", "active"),
      )
      const [tenantsSnap, usersSnap] = await this.executeWithTimeout(
        Promise.all([getDocs(tenantsQuery), getDocs(usersQuery)]),
        "アクティブテナントの取得"
      )

      const adminUsers = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      return tenantsSnap.docs.map((tenantDoc) => {
        const tenant = { id: tenantDoc.id, ...tenantDoc.data() }
        const admin = adminUsers.find((u) => u.tenantId === tenant.id)
        const companyName = tenant.companyName || admin?.companyName || "名称未設定"
        return {
          ...tenant,
          adminName: admin?.name || "N/A",
          adminEmail: admin?.email || "N/A",
          companyName,
        }
      })
    } catch (error) {
      this.handleError(error, "アクティブテナントの取得")
    }
  }

  async approveAdmin(userId) {
    try {
      if (!this.app.hasRole("developer")) throw new Error("開発者権限が必要です")
      
      console.log("API: Starting admin approval process for userId:", userId)
      
      const userRef = doc(this.db, "users", userId)
      const userDoc = await getDoc(userRef)
      if (!userDoc.exists()) throw new Error("User not found")
      
      const userData = userDoc.data()
      const companyName = userData?.companyName || "名称未設定"
      
      // テナントIDを先に生成
      const tenantId = doc(collection(this.db, "tenants")).id
      const tenantRef = doc(this.db, "tenants", tenantId)
      
      console.log("API: Generated tenantId:", tenantId)
      console.log("API: User data:", userData)
      
      const batch = writeBatch(this.db)
      
      // ユーザーの更新（tenantIdを確実に設定）
      batch.update(userRef, {
        status: "active",
        tenantId: tenantId,
        updatedAt: serverTimestamp(),
      })
      
      // テナントの作成
      batch.set(tenantRef, {
        adminId: userId,
        companyName: companyName,
        status: "active",
        createdAt: serverTimestamp(),
      })
      
      // global_users にも登録（マルチテナント対応）
      if (userData.email) {
        const globalUserRef = doc(this.db, "global_users", userData.email)
        batch.set(globalUserRef, {
          uid: userId,
          email: userData.email,
          name: userData.name || "管理者",
          companyName: companyName,
          role: "admin",
          status: "active",
          tenantId: tenantId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      
      await this.executeWithTimeout(
        batch.commit(),
        "管理者アカウントの承認"
      )
      
      console.log("API: Admin approval completed successfully")
      console.log("API: TenantId assigned:", tenantId)
      
    } catch (error) {
      console.error("API: Error in approveAdmin:", error)
      this.handleError(error, "管理者アカウントの承認")
    }
  }

  async updateTenantStatus(tenantId, status) {
    try {
      if (!this.app.hasRole("developer")) throw new Error("開発者権限が必要です")
      await this.executeWithTimeout(
        updateDoc(doc(this.db, "tenants", tenantId), {
          status: status,
          updatedAt: serverTimestamp(),
        }),
        `テナントステータスの更新 (tenantId: ${tenantId})`
      )
    } catch (error) {
      this.handleError(error, `テナントステータスの更新 (tenantId: ${tenantId})`)
    }
  }

  // --- データバリデーション ---
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  validatePassword(password) {
    return password && password.length >= 6
  }

  validateName(name) {
    return name && name.trim().length >= 2
  }

  validateCompanyName(companyName) {
    return companyName && companyName.trim().length >= 2
  }

  validateWeight(weight) {
    return weight >= 0 && weight <= 100
  }
}
