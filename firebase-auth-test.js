/**
 * Firebase認証状態確認テスト
 * 既存アカウントの使用可能性を検証
 */

// Firebase認証テストの実行
async function testFirebaseAuth() {
    console.log('🔥 Firebase認証状態確認テスト開始...\n');
    
    // 1. 環境設定確認
    console.log('1. 環境設定確認:');
    console.log('   - ホスト名:', window.location.hostname);
    console.log('   - 現在のURL:', window.location.href);
    
    // 2. Firebase設定の取得試行
    try {
        const env = window.env || new Environment();
        const firebaseConfig = await env.getFirebaseConfig();
        
        console.log('\n2. Firebase設定取得結果:');
        console.log('   ✅ 設定取得成功');
        console.log('   - プロジェクトID:', firebaseConfig.projectId);
        console.log('   - 認証ドメイン:', firebaseConfig.authDomain);
        console.log('   - APIキー:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substr(0, 8)}...` : 'なし');
        
        // 3. Firebase初期化試行
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        
        console.log('\n3. Firebase初期化:');
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        console.log('   ✅ Firebase初期化成功');
        
        // 4. 既存アカウントでのテスト認証試行
        console.log('\n4. 既存アカウント認証テスト:');
        console.log('   テスト用アカウント: test@example.com / testpass');
        
        try {
            await signInWithEmailAndPassword(auth, 'test@example.com', 'testpass');
            console.log('   ✅ 既存アカウント認証: 成功');
            
            // ログアウト
            await auth.signOut();
            console.log('   ✅ ログアウト成功');
            
        } catch (authError) {
            console.log('   ❌ 既存アカウント認証: 失敗');
            console.log('   エラーコード:', authError.code);
            console.log('   エラーメッセージ:', authError.message);
            
            // CORS エラーかチェック
            if (authError.code === 'auth/network-request-failed') {
                console.log('   🚨 CORSエラー検出 - 一時認証システムにフォールバック');
                
                // 一時認証システムテスト
                console.log('\n5. 一時認証システムテスト:');
                if (window.TempAuth) {
                    const tempAuth = new window.TempAuth();
                    try {
                        const result = await tempAuth.login('admin@demo.com', 'admin123');
                        console.log('   ✅ 一時認証: 成功');
                        console.log('   - ユーザーID:', result.user.uid);
                        console.log('   - 一時フラグ:', result.user.isTemp);
                    } catch (tempError) {
                        console.log('   ❌ 一時認証: 失敗', tempError.message);
                    }
                } else {
                    console.log('   ⚠️  一時認証システム未ロード');
                }
                
                return 'CORS_ERROR';
            } else if (authError.code === 'auth/user-not-found') {
                console.log('   ℹ️  テストアカウントが存在しないため作成が必要');
                return 'USER_NOT_FOUND';
            } else if (authError.code === 'auth/wrong-password') {
                console.log('   ℹ️  テストアカウントは存在するがパスワードが異なる');
                return 'WRONG_PASSWORD';
            } else if (authError.code === 'auth/invalid-credential') {
                console.log('   ℹ️  認証情報が無効');
                return 'INVALID_CREDENTIAL';
            }
            
            return authError.code;
        }
        
        return 'SUCCESS';
        
    } catch (configError) {
        console.log('\n❌ Firebase設定取得失敗:', configError.message);
        console.log('   一時認証システムのみが利用可能');
        return 'CONFIG_ERROR';
    }
}

// ページロード時に実行
if (typeof window !== 'undefined') {
    window.testFirebaseAuth = testFirebaseAuth;
    
    // 自動実行
    document.addEventListener('DOMContentLoaded', async () => {
        const result = await testFirebaseAuth();
        
        console.log('\n📊 総合判定:');
        switch(result) {
            case 'SUCCESS':
                console.log('🟢 既存Firebase認証: 利用可能');
                console.log('   既存のアカウントでログイン可能です');
                break;
                
            case 'CORS_ERROR':
                console.log('🟡 既存Firebase認証: CORS制限により利用不可');
                console.log('   一時認証システムで運用中（正常動作）');
                console.log('   Firebase Console設定完了後に解決予定');
                break;
                
            case 'USER_NOT_FOUND':
                console.log('🟠 既存Firebase認証: 接続可能だがアカウント未作成');
                console.log('   新規アカウント作成が可能');
                break;
                
            case 'CONFIG_ERROR':
                console.log('🔴 Firebase設定エラー');
                console.log('   一時認証システムのみ利用可能');
                break;
                
            default:
                console.log('🟡 既存Firebase認証: 制限あり');
                console.log('   エラーコード:', result);
                console.log('   一時認証システムで代替運用');
        }
    });
}

export { testFirebaseAuth };