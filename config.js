// Firebase設定を環境ごとに分離
export const getFirebaseConfig = () => {
  const env = window.location.hostname === 'localhost' ? 'development' : 'production'
  
  const configs = {
    development: {
      apiKey: "AIzaSyAK3wAWIZCultkSQfyse8L8Z-JNMEVK5Wk",
      authDomain: "hyouka-db.firebaseapp.com",
      projectId: "hyouka-db",
      storageBucket: "hyouka-db.appspot.com",
      messagingSenderId: "861016804589",
      appId: "1:861016804589:web:d911d516d6c79aa73690e4"
    },
    production: {
      // 本番環境の設定
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    }
  }
  
  return configs[env]
}
