/**
 * Token Generator Utility
 * トークン生成・検証ユーティリティ
 */

/**
 * ランダムなトークンを生成
 * @param {string} prefix - トークンのプレフィックス
 * @param {number} length - ランダム部分の長さ
 * @returns {string} 生成されたトークン
 */
export function generateToken(prefix = '', length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix ? `${prefix}_${token}` : token;
}

/**
 * セキュアなトークンを生成（crypto API使用）
 * @param {string} prefix - トークンのプレフィックス
 * @param {number} length - バイト長（デフォルト: 32）
 * @returns {string} 生成されたトークン
 */
export function generateSecureToken(prefix = '', length = 32) {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return prefix ? `${prefix}_${token}` : token;
  }
  
  // crypto APIが利用できない場合は通常のトークン生成にフォールバック
  console.warn('Crypto API not available, falling back to Math.random()');
  return generateToken(prefix, length * 2);
}

/**
 * トークンの形式を検証
 * @param {string} token - 検証するトークン
 * @param {string} expectedPrefix - 期待されるプレフィックス
 * @returns {boolean} トークンが有効な形式かどうか
 */
export function validateToken(token, expectedPrefix = '') {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // プレフィックスが指定されている場合
  if (expectedPrefix) {
    const prefixPattern = new RegExp(`^${expectedPrefix}_[A-Za-z0-9]+$`);
    return prefixPattern.test(token);
  }
  
  // プレフィックスなしの場合は、英数字のみで構成されているかチェック
  return /^[A-Za-z0-9_]+$/.test(token);
}

/**
 * 招待コードを生成
 * @returns {string} 招待コード
 */
export function generateInvitationCode() {
  return generateSecureToken('invitation', 16);
}

/**
 * パスワードリセットトークンを生成
 * @returns {string} リセットトークン
 */
export function generatePasswordResetToken() {
  return generateSecureToken('reset', 32);
}

/**
 * APIキーを生成
 * @returns {string} APIキー
 */
export function generateApiKey() {
  return generateSecureToken('api', 32);
}

/**
 * セッショントークンを生成
 * @returns {string} セッショントークン
 */
export function generateSessionToken() {
  return generateSecureToken('session', 32);
}

/**
 * トークンから有効期限付きトークンを生成
 * @param {string} prefix - トークンのプレフィックス
 * @param {number} expiresInMinutes - 有効期限（分）
 * @returns {object} トークンと有効期限
 */
export function generateExpiringToken(prefix = '', expiresInMinutes = 60) {
  const token = generateSecureToken(prefix);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  return {
    token,
    expiresAt: expiresAt.toISOString(),
    expiresInMinutes
  };
}

/**
 * Base64エンコード
 * @param {string} str - エンコードする文字列
 * @returns {string} Base64エンコードされた文字列
 */
export function base64Encode(str) {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str).toString('base64');
}

/**
 * Base64デコード
 * @param {string} str - デコードする文字列
 * @returns {string} デコードされた文字列
 */
export function base64Decode(str) {
  if (typeof window !== 'undefined' && window.atob) {
    return decodeURIComponent(escape(window.atob(str)));
  }
  return Buffer.from(str, 'base64').toString();
}

/**
 * トークンをハッシュ化（簡易版）
 * @param {string} token - ハッシュ化するトークン
 * @returns {Promise<string>} ハッシュ化されたトークン
 */
export async function hashToken(token) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // crypto.subtle が利用できない場合は簡易ハッシュ
  console.warn('Crypto.subtle not available, using simple hash');
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * トークンの強度を評価
 * @param {string} token - 評価するトークン
 * @returns {object} 強度評価結果
 */
export function evaluateTokenStrength(token) {
  if (!token || typeof token !== 'string') {
    return { strength: 'invalid', score: 0 };
  }
  
  let score = 0;
  const checks = {
    length: token.length >= 32,
    hasUpperCase: /[A-Z]/.test(token),
    hasLowerCase: /[a-z]/.test(token),
    hasNumbers: /[0-9]/.test(token),
    hasSpecialChars: /[^A-Za-z0-9]/.test(token)
  };
  
  // スコア計算
  if (checks.length) score += 40;
  if (checks.hasUpperCase) score += 15;
  if (checks.hasLowerCase) score += 15;
  if (checks.hasNumbers) score += 15;
  if (checks.hasSpecialChars) score += 15;
  
  // 強度判定
  let strength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'moderate';
  
  return {
    strength,
    score,
    checks
  };
}

// デフォルトエクスポート
export default {
  generateToken,
  generateSecureToken,
  validateToken,
  generateInvitationCode,
  generatePasswordResetToken,
  generateApiKey,
  generateSessionToken,
  generateExpiringToken,
  base64Encode,
  base64Decode,
  hashToken,
  evaluateTokenStrength
};
