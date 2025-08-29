/**
 * Token Generator Utility
 * 招待トークンや各種セキュアトークンの生成ユーティリティ
 */

/**
 * セキュアなランダム文字列を生成
 * @param {number} length - 生成する文字列の長さ
 * @param {string} charset - 使用する文字セット
 * @returns {string} 生成された文字列
 */
function generateRandomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  
  // crypto.getRandomValues を使用してセキュアな乱数を生成
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
  } else {
    // フォールバック: Math.randomを使用（セキュリティレベルは低下）
    console.warn('TokenGenerator: crypto.getRandomValues not available, using Math.random fallback');
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  
  return result;
}

/**
 * 招待コードを生成
 * 形式: 8文字の大文字英数字 (例: ABC12345)
 * @returns {string} 招待コード
 */
export function generateInvitationCode() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return generateRandomString(8, charset);
}

/**
 * セッショントークンを生成
 * 形式: 32文字の英数字
 * @returns {string} セッショントークン
 */
export function generateSessionToken() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return generateRandomString(32, charset);
}











// デフォルトエクスポート
export default {
  generateInvitationCode,
  generateSessionToken
};