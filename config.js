/**
 * 設定管理モジュール
 * 環境変数システムと連携してアプリケーション設定を管理
 * 
 * @deprecated このファイルは非推奨です。代わりにenv.jsの環境変数システムを使用してください。
 * 後方互換性のために残していますが、将来のバージョンで削除される予定です。
 */

import environment from "./env.js"

/**
 * Firebase設定を取得
 * @deprecated env.getFirebaseConfig()を使用してください
 */
export const getFirebaseConfig = async () => {
  console.warn('config.js getFirebaseConfig() is deprecated. Use environment.getFirebaseConfig() instead.')
  
  try {
    return await environment.getFirebaseConfig()
  } catch (error) {
    console.error('Failed to load Firebase config from environment:', error)
    throw error
  }
}

/**
 * アプリケーション設定を取得
 */
export const getAppConfig = async () => {
  const env = environment.getEnvironment()
  
  return {
    environment: env,
    isDevelopment: environment.isDevelopment(),
    isProduction: environment.isProduction(),
    isStaging: environment.isStaging(),
    
    // デバッグ設定
    debug: {
      enabled: environment.isDevelopment(),
      showFirebaseEmulatorWarning: environment.isDevelopment(),
      verboseLogging: environment.isDevelopment()
    },
    
    // アプリケーション設定
    app: {
      name: await environment.get('APP_NAME', '建設業評価管理システム'),
      version: await environment.get('APP_VERSION', '1.0.0'),
      supportEmail: await environment.get('SUPPORT_EMAIL', 'support@example.com')
    },
    
    // セキュリティ設定
    security: {
      sessionTimeout: await environment.get('SESSION_TIMEOUT', 60 * 60 * 1000), // 1時間
      maxLoginAttempts: await environment.get('MAX_LOGIN_ATTEMPTS', 5),
      passwordMinLength: await environment.get('PASSWORD_MIN_LENGTH', 6)
    },
    
    // UI設定
    ui: {
      defaultLanguage: await environment.get('DEFAULT_LANGUAGE', 'ja'),
      theme: await environment.get('DEFAULT_THEME', 'light'),
      itemsPerPage: await environment.get('ITEMS_PER_PAGE', 20)
    }
  }
}

/**
 * 設定の検証
 */
export const validateConfig = async () => {
  try {
    const firebaseConfig = await environment.getFirebaseConfig()
    const appConfig = await getAppConfig()
    
    // 必須設定のチェック
    const requiredFirebaseKeys = [
      'apiKey', 'authDomain', 'projectId', 
      'storageBucket', 'messagingSenderId', 'appId'
    ]
    
    const missingKeys = requiredFirebaseKeys.filter(key => !firebaseConfig[key])
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`)
    }
    
    console.log('Config validation successful')
    console.log(`Environment: ${appConfig.environment}`)
    console.log(`App Name: ${appConfig.app.name}`)
    console.log(`Debug Mode: ${appConfig.debug.enabled}`)
    
    return true
    
  } catch (error) {
    console.error('Config validation failed:', error)
    throw error
  }
}

// 後方互換性のためのエクスポート（非推奨）
export default {
  getFirebaseConfig,
  getAppConfig,
  validateConfig
}
