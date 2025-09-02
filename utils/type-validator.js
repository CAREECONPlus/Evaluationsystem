/**
 * 型安全性とランタイムバリデーション機能
 * JSDocの型定義と連携してランタイムでの型チェックを提供
 * 
 * @fileoverview
 * このモジュールは以下の機能を提供します：
 * - JSDoc型定義に基づくランタイム型チェック
 * - カスタムバリデーションルール
 * - 型エラーの詳細レポート
 * - パフォーマンス最適化された型検証
 */

import { getLogger } from './logger.js';

/**
 * 型定義
 * @readonly
 * @enum {string}
 */
export const TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  FUNCTION: 'function',
  DATE: 'date',
  EMAIL: 'email',
  URL: 'url',
  UNDEFINED: 'undefined',
  NULL: 'null'
};

/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  /**
   * @param {string} message エラーメッセージ
   * @param {string} field フィールド名
   * @param {any} value 実際の値
   * @param {string} expectedType 期待される型
   */
  constructor(message, field, value, expectedType) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.expectedType = expectedType;
    this.actualType = typeof value;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 型バリデーション結果
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - バリデーション成功フラグ
 * @property {ValidationError[]} errors - エラー配列
 * @property {string[]} warnings - 警告配列
 * @property {Object} sanitizedValue - サニタイズされた値
 */

/**
 * バリデーションルール定義
 * @typedef {Object} ValidationRule
 * @property {string} type - 期待される型
 * @property {boolean} [required=true] - 必須フラグ
 * @property {any} [defaultValue] - デフォルト値
 * @property {number} [minLength] - 最小長
 * @property {number} [maxLength] - 最大長
 * @property {number} [min] - 最小値
 * @property {number} [max] - 最大値
 * @property {RegExp} [pattern] - 正規表現パターン
 * @property {any[]} [enum] - 許可値リスト
 * @property {Function} [customValidator] - カスタムバリデーター関数
 * @property {string} [description] - フィールド説明
 */

/**
 * スキーマ定義
 * @typedef {Object.<string, ValidationRule>} Schema
 */

/**
 * 型バリデータークラス
 */
export class TypeValidator {
  constructor() {
    this.logger = getLogger('TypeValidator');
    
    /** @type {Map<string, Schema>} */
    this.schemas = new Map();
    
    /** @type {Map<string, Function>} */
    this.customValidators = new Map();
    
    /** @type {boolean} */
    this.strictMode = false;
    
    this.registerBuiltinValidators();
  }

  /**
   * 組み込みバリデーターを登録
   * @private
   */
  registerBuiltinValidators() {
    // メールアドレスバリデーター
    this.customValidators.set('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // URLバリデーター
    this.customValidators.set('url', (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // 日付バリデーター
    this.customValidators.set('date', (value) => {
      return value instanceof Date && !isNaN(value.getTime());
    });

    // JSON文字列バリデーター
    this.customValidators.set('json', (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * スキーマを登録
   * @param {string} name スキーマ名
   * @param {Schema} schema スキーマ定義
   */
  registerSchema(name, schema) {
    if (typeof name !== 'string') {
      throw new Error('Schema name must be a string');
    }
    
    if (typeof schema !== 'object' || schema === null) {
      throw new Error('Schema must be an object');
    }

    this.schemas.set(name, schema);
    this.logger.debug(`Schema registered: ${name}`);
  }

  /**
   * カスタムバリデーターを登録
   * @param {string} name バリデーター名
   * @param {Function} validator バリデーター関数
   */
  registerValidator(name, validator) {
    if (typeof name !== 'string') {
      throw new Error('Validator name must be a string');
    }
    
    if (typeof validator !== 'function') {
      throw new Error('Validator must be a function');
    }

    this.customValidators.set(name, validator);
    this.logger.debug(`Custom validator registered: ${name}`);
  }

  /**
   * 値の型をバリデーション
   * @param {any} value バリデーション対象の値
   * @param {ValidationRule} rule バリデーションルール
   * @param {string} fieldName フィールド名
   * @returns {ValidationResult} バリデーション結果
   */
  validateValue(value, rule, fieldName = 'value') {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: value
    };

    try {
      // 必須チェック
      if (rule.required !== false && this.isEmpty(value)) {
        if (rule.defaultValue !== undefined) {
          result.sanitizedValue = rule.defaultValue;
          result.warnings.push(`Using default value for ${fieldName}`);
        } else {
          result.isValid = false;
          result.errors.push(new ValidationError(
            `Field '${fieldName}' is required`,
            fieldName,
            value,
            rule.type
          ));
          return result;
        }
      }

      // 値が空で必須でない場合はスキップ
      if (this.isEmpty(value) && rule.required === false) {
        return result;
      }

      // 型チェック
      const typeCheckResult = this.checkType(result.sanitizedValue, rule.type, fieldName);
      if (!typeCheckResult.isValid) {
        result.isValid = false;
        result.errors.push(...typeCheckResult.errors);
        return result;
      }

      // 追加バリデーション
      const additionalValidation = this.performAdditionalValidation(
        result.sanitizedValue, 
        rule, 
        fieldName
      );
      
      result.isValid = additionalValidation.isValid;
      result.errors.push(...additionalValidation.errors);
      result.warnings.push(...additionalValidation.warnings);

    } catch (error) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        `Validation error for '${fieldName}': ${error.message}`,
        fieldName,
        value,
        rule.type
      ));
    }

    return result;
  }

  /**
   * オブジェクトをスキーマでバリデーション
   * @param {Object} data バリデーション対象のデータ
   * @param {string|Schema} schemaOrName スキーマ名または直接スキーマ
   * @returns {ValidationResult} バリデーション結果
   */
  validateObject(data, schemaOrName) {
    let schema;
    
    if (typeof schemaOrName === 'string') {
      schema = this.schemas.get(schemaOrName);
      if (!schema) {
        throw new Error(`Schema '${schemaOrName}' not found`);
      }
    } else {
      schema = schemaOrName;
    }

    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: {}
    };

    if (typeof data !== 'object' || data === null) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        'Data must be an object',
        'root',
        data,
        'object'
      ));
      return result;
    }

    // 各フィールドをバリデーション
    for (const [fieldName, rule] of Object.entries(schema)) {
      const fieldValue = data[fieldName];
      const fieldResult = this.validateValue(fieldValue, rule, fieldName);
      
      if (!fieldResult.isValid) {
        result.isValid = false;
      }
      
      result.errors.push(...fieldResult.errors);
      result.warnings.push(...fieldResult.warnings);
      result.sanitizedValue[fieldName] = fieldResult.sanitizedValue;
    }

    // 不明なフィールドのチェック（strictModeの場合）
    if (this.strictMode) {
      const unknownFields = Object.keys(data).filter(key => !schema[key]);
      if (unknownFields.length > 0) {
        result.warnings.push(`Unknown fields detected: ${unknownFields.join(', ')}`);
      }
    }

    return result;
  }

  /**
   * 配列の各要素をバリデーション
   * @param {Array} array バリデーション対象の配列
   * @param {ValidationRule} itemRule 配列要素のバリデーションルール
   * @param {string} fieldName フィールド名
   * @returns {ValidationResult} バリデーション結果
   */
  validateArray(array, itemRule, fieldName = 'array') {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: []
    };

    if (!Array.isArray(array)) {
      result.isValid = false;
      result.errors.push(new ValidationError(
        `Field '${fieldName}' must be an array`,
        fieldName,
        array,
        'array'
      ));
      return result;
    }

    // 各要素をバリデーション
    array.forEach((item, index) => {
      const itemResult = this.validateValue(item, itemRule, `${fieldName}[${index}]`);
      
      if (!itemResult.isValid) {
        result.isValid = false;
      }
      
      result.errors.push(...itemResult.errors);
      result.warnings.push(...itemResult.warnings);
      result.sanitizedValue.push(itemResult.sanitizedValue);
    });

    return result;
  }

  /**
   * 型チェック
   * @param {any} value 値
   * @param {string} expectedType 期待される型
   * @param {string} fieldName フィールド名
   * @returns {ValidationResult} 型チェック結果
   * @private
   */
  checkType(value, expectedType, fieldName) {
    const result = {
      isValid: true,
      errors: []
    };

    const actualType = this.getActualType(value);
    
    // カスタム型のチェック
    if (this.customValidators.has(expectedType)) {
      const validator = this.customValidators.get(expectedType);
      if (!validator(value)) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' failed ${expectedType} validation`,
          fieldName,
          value,
          expectedType
        ));
      }
      return result;
    }

    // 基本型のチェック
    switch (expectedType) {
      case TYPES.STRING:
        if (typeof value !== 'string') {
          result.isValid = false;
        }
        break;
      case TYPES.NUMBER:
        if (typeof value !== 'number' || isNaN(value)) {
          result.isValid = false;
        }
        break;
      case TYPES.BOOLEAN:
        if (typeof value !== 'boolean') {
          result.isValid = false;
        }
        break;
      case TYPES.OBJECT:
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          result.isValid = false;
        }
        break;
      case TYPES.ARRAY:
        if (!Array.isArray(value)) {
          result.isValid = false;
        }
        break;
      case TYPES.FUNCTION:
        if (typeof value !== 'function') {
          result.isValid = false;
        }
        break;
      default:
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Unknown type '${expectedType}'`,
          fieldName,
          value,
          expectedType
        ));
        return result;
    }

    if (!result.isValid) {
      result.errors.push(new ValidationError(
        `Field '${fieldName}' expected ${expectedType} but got ${actualType}`,
        fieldName,
        value,
        expectedType
      ));
    }

    return result;
  }

  /**
   * 追加バリデーション
   * @param {any} value 値
   * @param {ValidationRule} rule ルール
   * @param {string} fieldName フィールド名
   * @returns {ValidationResult} バリデーション結果
   * @private
   */
  performAdditionalValidation(value, rule, fieldName) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 文字列長チェック
    if (rule.type === TYPES.STRING && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' must be at least ${rule.minLength} characters`,
          fieldName,
          value,
          rule.type
        ));
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' must not exceed ${rule.maxLength} characters`,
          fieldName,
          value,
          rule.type
        ));
      }
    }

    // 数値範囲チェック
    if (rule.type === TYPES.NUMBER && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' must be at least ${rule.min}`,
          fieldName,
          value,
          rule.type
        ));
      }

      if (rule.max !== undefined && value > rule.max) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' must not exceed ${rule.max}`,
          fieldName,
          value,
          rule.type
        ));
      }
    }

    // パターンマッチング
    if (rule.pattern && rule.pattern instanceof RegExp) {
      const strValue = String(value);
      if (!rule.pattern.test(strValue)) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' does not match the required pattern`,
          fieldName,
          value,
          rule.type
        ));
      }
    }

    // 列挙値チェック
    if (rule.enum && Array.isArray(rule.enum)) {
      if (!rule.enum.includes(value)) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Field '${fieldName}' must be one of: ${rule.enum.join(', ')}`,
          fieldName,
          value,
          rule.type
        ));
      }
    }

    // カスタムバリデーター
    if (rule.customValidator && typeof rule.customValidator === 'function') {
      try {
        const customResult = rule.customValidator(value);
        if (customResult === false) {
          result.isValid = false;
          result.errors.push(new ValidationError(
            `Field '${fieldName}' failed custom validation`,
            fieldName,
            value,
            rule.type
          ));
        } else if (typeof customResult === 'string') {
          result.isValid = false;
          result.errors.push(new ValidationError(
            customResult,
            fieldName,
            value,
            rule.type
          ));
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(new ValidationError(
          `Custom validator error for '${fieldName}': ${error.message}`,
          fieldName,
          value,
          rule.type
        ));
      }
    }

    return result;
  }

  /**
   * 値が空かどうか判定
   * @param {any} value 値
   * @returns {boolean} 空かどうか
   * @private
   */
  isEmpty(value) {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }

  /**
   * 実際の型を取得
   * @param {any} value 値
   * @returns {string} 型名
   * @private
   */
  getActualType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    return typeof value;
  }

  /**
   * strictモードを設定
   * @param {boolean} enabled 有効フラグ
   */
  setStrictMode(enabled) {
    this.strictMode = Boolean(enabled);
    this.logger.debug(`Strict mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * バリデーション結果をログ出力
   * @param {ValidationResult} result バリデーション結果
   * @param {string} context コンテキスト
   */
  logValidationResult(result, context = '') {
    if (result.isValid) {
      this.logger.debug(`Validation passed${context ? ` for ${context}` : ''}`);
    } else {
      this.logger.warn(`Validation failed${context ? ` for ${context}` : ''}:`);
      result.errors.forEach(error => {
        this.logger.warn(`- ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      this.logger.info('Validation warnings:');
      result.warnings.forEach(warning => {
        this.logger.info(`- ${warning}`);
      });
    }
  }

  /**
   * デバッグ情報を出力
   */
  debug() {
    this.logger.group('TypeValidator Debug Info');
    this.logger.info('Registered schemas:', Array.from(this.schemas.keys()));
    this.logger.info('Custom validators:', Array.from(this.customValidators.keys()));
    this.logger.info('Strict mode:', this.strictMode);
    this.logger.groupEnd();
  }
}

// シングルトンインスタンス
const typeValidator = new TypeValidator();

/**
 * 値をバリデーション
 * @param {any} value 値
 * @param {ValidationRule} rule ルール
 * @param {string} fieldName フィールド名
 * @returns {ValidationResult} 結果
 */
export function validateValue(value, rule, fieldName) {
  return typeValidator.validateValue(value, rule, fieldName);
}

/**
 * オブジェクトをバリデーション
 * @param {Object} data データ
 * @param {string|Schema} schema スキーマ
 * @returns {ValidationResult} 結果
 */
export function validateObject(data, schema) {
  return typeValidator.validateObject(data, schema);
}

/**
 * 配列をバリデーション
 * @param {Array} array 配列
 * @param {ValidationRule} itemRule 要素ルール
 * @param {string} fieldName フィールド名
 * @returns {ValidationResult} 結果
 */
export function validateArray(array, itemRule, fieldName) {
  return typeValidator.validateArray(array, itemRule, fieldName);
}

/**
 * スキーマを登録
 * @param {string} name スキーマ名
 * @param {Schema} schema スキーマ
 */
export function registerSchema(name, schema) {
  typeValidator.registerSchema(name, schema);
}

/**
 * カスタムバリデーターを登録
 * @param {string} name 名前
 * @param {Function} validator バリデーター
 */
export function registerValidator(name, validator) {
  typeValidator.registerValidator(name, validator);
}

// エクスポート
export default typeValidator;

// グローバルに公開（開発時用）
if (typeof window !== 'undefined') {
  window.typeValidator = typeValidator;
  window.validateValue = validateValue;
  window.validateObject = validateObject;
}