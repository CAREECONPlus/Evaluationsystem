/**
 * Initial Developer Account Setup Script
 * 初期開発者アカウント設定スクリプト
 * 
 * 使用方法:
 * 1. このファイルをプロジェクトルートに配置
 * 2. Node.jsで実行: node scripts/setup-developer.js
 * 3. または、ブラウザのコンソールで実行（Firebase初期化後）
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase設定（実際の値に置き換えてください）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// セキュアなパスワード生成
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const setupDeveloper = async () => {
  console.log("=== 開発者アカウント初期設定 ===");
  
  // デフォルト設定（本番環境では必ず変更してください）
  const config = {
    email: process.env.DEV_EMAIL || "developer@system.com",
    password: process.env.DEV_PASSWORD || generateSecurePassword(),
    name: "System Developer",
    companyName: "System Administration"
  };
  
  try {
    // Firebase初期化
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log("Firebase initialized successfully");
    console.log("Creating developer account...");
    
    // Firebase Authにユーザー作成
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      config.email, 
      config.password
    );
    const uid = userCredential.user.uid;
    
    console.log("Firebase Auth user created:", uid);
    
    // Firestoreにデータを保存
    const batch = writeBatch(db);
    
    // 1. global_usersに登録
    batch.set(doc(db, "global_users", config.email), {
      uid: uid,
      email: config.email,
      name: config.name,
      companyName: config.companyName,
      role: "developer",
      status: "active",
      createdAt: serverTimestamp(),
      metadata: {
        setupVersion: "1.0.0",
        createdBy: "setup-script"
      }
    });
    
    // 2. レガシーusersにも登録（後方互換性）
    batch.set(doc(db, "users", uid), {
      uid: uid,
      email: config.email,
      name: config.name,
      companyName: config.companyName,
      role: "developer",
      status: "active",
      createdAt: serverTimestamp()
    });
    
    // 3. システム設定を初期化
    batch.set(doc(db, "systemSettings", "config"), {
      version: "1.0.0",
      initialized: true,
      developerId: uid,
      features: {
        multiTenant: true,
        maxTenantsPerPlan: {
          trial: 1,
          basic: 5,
          premium: 20,
          enterprise: -1 // 無制限
        }
      },
      createdAt: serverTimestamp()
    });
    
    // 4. 監査ログに記録
    batch.set(doc(db, "auditLogs", `setup_${uid}`), {
      action: "developer_account_created",
      userId: uid,
      email: config.email,
      timestamp: serverTimestamp(),
      metadata: {
        script: "setup-developer.js",
        version: "1.0.0"
      }
    });
    
    await batch.commit();
    console.log("Firestore data created successfully");
    
    // 成功情報を表示
    console.log("\n========================================");
    console.log("✅ 開発者アカウントが正常に作成されました");
    console.log("========================================");
    console.log("📧 Email:", config.email);
    console.log("🔑 Password:", config.password);
    console.log("🆔 UID:", uid);
    console.log("========================================");
    console.log("⚠️ 重要: パスワードを安全な場所に保管してください");
    console.log("⚠️ 本番環境では必ずパスワードを変更してください");
    console.log("========================================\n");
    
    // パスワードをファイルに保存（オプション）
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = require('fs');
      const credentials = {
        email: config.email,
        password: config.password,
        uid: uid,
        createdAt: new Date().toISOString(),
        warning: "このファイルは機密情報です。安全に保管し、不要になったら削除してください。"
      };
      
      fs.writeFileSync(
        'developer-credentials.json', 
        JSON.stringify(credentials, null, 2)
      );
      console.log("📁 認証情報が developer-credentials.json に保存されました");
      console.log("   （このファイルは .gitignore に追加してください）");
    }
    
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.error("このメールアドレスは既に使用されています。");
      console.error("別のメールアドレスを使用するか、Firebase Consoleから既存のユーザーを削除してください。");
    } else if (error.code === 'auth/weak-password') {
      console.error("パスワードが弱すぎます。より強力なパスワードを設定してください。");
    } else if (error.code === 'auth/invalid-email') {
      console.error("無効なメールアドレスです。");
    } else {
      console.error("詳細:", error.message);
    }
    
    process.exit(1);
  }
};

// スクリプト実行
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Node.js環境
  setupDeveloper().then(() => {
    console.log("Setup completed");
    process.exit(0);
  }).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
} else {
  // ブラウザ環境
  console.log("ブラウザのコンソールで実行する場合:");
  console.log("setupDeveloper() を実行してください");
  window.setupDeveloper = setupDeveloper;
}
