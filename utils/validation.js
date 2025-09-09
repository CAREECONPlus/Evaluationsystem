/**
 * Validation Utilities
 * バリデーションユーティリティ
 */

export class ValidationUtils {
  
  /**
   * メールアドレス検証
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'メールアドレスを入力してください' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: '有効なメールアドレスを入力してください' };
    }
    
    return { isValid: true };
  }

  /**
   * 必須フィールド検証
   */
  static validateRequired(value, fieldName = 'フィールド') {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { isValid: false, message: `${fieldName}は必須です` };
    }
    return { isValid: true };
  }

  /**
   * 文字列長検証
   */
  static validateStringLength(value, minLength = 0, maxLength = Infinity, fieldName = 'フィールド') {
    const str = String(value || '').trim();
    
    if (str.length < minLength) {
      return { isValid: false, message: `${fieldName}は${minLength}文字以上で入力してください` };
    }
    
    if (str.length > maxLength) {
      return { isValid: false, message: `${fieldName}は${maxLength}文字以下で入力してください` };
    }
    
    return { isValid: true };
  }

  /**
   * 数値検証
   */
  static validateNumber(value, min = -Infinity, max = Infinity, fieldName = 'フィールド') {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return { isValid: false, message: `${fieldName}は有効な数値を入力してください` };
    }
    
    if (num < min) {
      return { isValid: false, message: `${fieldName}は${min}以上の値を入力してください` };
    }
    
    if (num > max) {
      return { isValid: false, message: `${fieldName}は${max}以下の値を入力してください` };
    }
    
    return { isValid: true };
  }

  /**
   * 日付検証
   */
  static validateDate(value, fieldName = '日付') {
    if (!value) {
      return { isValid: false, message: `${fieldName}を入力してください` };
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, message: `${fieldName}は有効な日付を入力してください` };
    }
    
    return { isValid: true };
  }

  /**
   * 日付範囲検証
   */
  static validateDateRange(startDate, endDate, startFieldName = '開始日', endFieldName = '終了日') {
    const startValidation = this.validateDate(startDate, startFieldName);
    if (!startValidation.isValid) return startValidation;
    
    const endValidation = this.validateDate(endDate, endFieldName);
    if (!endValidation.isValid) return endValidation;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return { isValid: false, message: `${endFieldName}は${startFieldName}より後の日付を入力してください` };
    }
    
    return { isValid: true };
  }

  /**
   * 重複検証
   */
  static validateUnique(value, existingValues, fieldName = 'フィールド') {
    if (!existingValues || !Array.isArray(existingValues)) {
      return { isValid: true };
    }
    
    const normalizedValue = String(value || '').trim().toLowerCase();
    const duplicates = existingValues.filter(existing => 
      String(existing || '').trim().toLowerCase() === normalizedValue
    );
    
    if (duplicates.length > 0) {
      return { isValid: false, message: `${fieldName}「${value}」は既に存在します` };
    }
    
    return { isValid: true };
  }

  /**
   * 評価スコア検証
   */
  static validateEvaluationScore(score, fieldName = 'スコア') {
    return this.validateNumber(score, 1, 5, fieldName);
  }

  /**
   * 組織名検証
   */
  static validateOrganizationName(name) {
    const requiredCheck = this.validateRequired(name, '組織名');
    if (!requiredCheck.isValid) return requiredCheck;
    
    return this.validateStringLength(name, 2, 100, '組織名');
  }

  /**
   * ユーザー名検証
   */
  static validateUserName(name) {
    const requiredCheck = this.validateRequired(name, 'ユーザー名');
    if (!requiredCheck.isValid) return requiredCheck;
    
    return this.validateStringLength(name, 2, 50, 'ユーザー名');
  }

  /**
   * パスワード検証
   */
  static validatePassword(password) {
    const requiredCheck = this.validateRequired(password, 'パスワード');
    if (!requiredCheck.isValid) return requiredCheck;
    
    const lengthCheck = this.validateStringLength(password, 6, 128, 'パスワード');
    if (!lengthCheck.isValid) return lengthCheck;
    
    // 複雑さチェック（少なくとも文字と数字を含む）
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'パスワードは英字と数字を両方含む必要があります' };
    }
    
    return { isValid: true };
  }

  /**
   * フォーム全体検証
   */
  static validateForm(formData, rules) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const fieldValue = formData[fieldName];
      
      for (const rule of fieldRules) {
        let validation;
        
        switch (rule.type) {
          case 'required':
            validation = this.validateRequired(fieldValue, rule.fieldName || fieldName);
            break;
          case 'email':
            validation = this.validateEmail(fieldValue);
            break;
          case 'stringLength':
            validation = this.validateStringLength(
              fieldValue, 
              rule.min || 0, 
              rule.max || Infinity, 
              rule.fieldName || fieldName
            );
            break;
          case 'number':
            validation = this.validateNumber(
              fieldValue, 
              rule.min || -Infinity, 
              rule.max || Infinity, 
              rule.fieldName || fieldName
            );
            break;
          case 'date':
            validation = this.validateDate(fieldValue, rule.fieldName || fieldName);
            break;
          case 'unique':
            validation = this.validateUnique(
              fieldValue, 
              rule.existingValues, 
              rule.fieldName || fieldName
            );
            break;
          case 'custom':
            validation = rule.validator(fieldValue, formData);
            break;
          default:
            validation = { isValid: true };
        }
        
        if (!validation.isValid) {
          errors[fieldName] = validation.message;
          isValid = false;
          break; // 最初のエラーで停止
        }
      }
    }
    
    return { isValid, errors };
  }

  /**
   * リアルタイムバリデーション設定
   */
  static setupRealtimeValidation(formElement, rules, options = {}) {
    if (!formElement) return;
    
    const {
      showErrorsOn = 'blur', // 'blur', 'input', 'change'
      errorClass = 'is-invalid',
      errorMessageClass = 'invalid-feedback'
    } = options;
    
    Object.keys(rules).forEach(fieldName => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      if (!field) return;
      
      const validateField = () => {
        const formData = new FormData(formElement);
        const fieldValue = formData.get(fieldName);
        const fieldRules = rules[fieldName];
        
        let hasError = false;
        
        for (const rule of fieldRules) {
          let validation;
          
          switch (rule.type) {
            case 'required':
              validation = this.validateRequired(fieldValue, rule.fieldName || fieldName);
              break;
            case 'email':
              validation = this.validateEmail(fieldValue);
              break;
            case 'stringLength':
              validation = this.validateStringLength(
                fieldValue, 
                rule.min || 0, 
                rule.max || Infinity, 
                rule.fieldName || fieldName
              );
              break;
            default:
              validation = { isValid: true };
          }
          
          if (!validation.isValid) {
            this.showFieldError(field, validation.message, errorClass, errorMessageClass);
            hasError = true;
            break;
          }
        }
        
        if (!hasError) {
          this.clearFieldError(field, errorClass, errorMessageClass);
        }
      };
      
      field.addEventListener(showErrorsOn, validateField);
    });
  }

  /**
   * フィールドエラー表示
   */
  static showFieldError(field, message, errorClass = 'is-invalid', errorMessageClass = 'invalid-feedback') {
    field.classList.add(errorClass);
    
    // 既存のエラーメッセージを削除
    const existingError = field.parentNode.querySelector(`.${errorMessageClass}`);
    if (existingError) {
      existingError.remove();
    }
    
    // 新しいエラーメッセージを追加
    const errorElement = document.createElement('div');
    errorElement.className = errorMessageClass;
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
  }

  /**
   * フィールドエラークリア
   */
  static clearFieldError(field, errorClass = 'is-invalid', errorMessageClass = 'invalid-feedback') {
    field.classList.remove(errorClass);
    
    const errorMessage = field.parentNode.querySelector(`.${errorMessageClass}`);
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  /**
   * フォーム全体のエラーを表示
   */
  static displayFormErrors(formElement, errors, errorClass = 'is-invalid', errorMessageClass = 'invalid-feedback') {
    // 既存のエラーをクリア
    this.clearAllFormErrors(formElement, errorClass, errorMessageClass);
    
    // 各フィールドにエラーを表示
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.showFieldError(field, message, errorClass, errorMessageClass);
      }
    });
  }

  /**
   * フォーム全体のエラーをクリア
   */
  static clearAllFormErrors(formElement, errorClass = 'is-invalid', errorMessageClass = 'invalid-feedback') {
    // エラークラスを削除
    formElement.querySelectorAll(`.${errorClass}`).forEach(field => {
      field.classList.remove(errorClass);
    });
    
    // エラーメッセージを削除
    formElement.querySelectorAll(`.${errorMessageClass}`).forEach(errorMsg => {
      errorMsg.remove();
    });
  }
}

/**
 * 評価システム専用バリデーションルール
 */
export class EvaluationValidationRules {
  
  // 部門作成フォームのルール
  static get departmentForm() {
    return {
      name: [
        { type: 'required', fieldName: '部門名' },
        { type: 'stringLength', min: 2, max: 50, fieldName: '部門名' }
      ],
      description: [
        { type: 'stringLength', max: 200, fieldName: '部門説明' }
      ]
    };
  }
  
  // チーム作成フォームのルール
  static get teamForm() {
    return {
      name: [
        { type: 'required', fieldName: 'チーム名' },
        { type: 'stringLength', min: 2, max: 50, fieldName: 'チーム名' }
      ],
      department: [
        { type: 'required', fieldName: '所属部門' }
      ],
      description: [
        { type: 'stringLength', max: 200, fieldName: 'チーム説明' }
      ]
    };
  }
  
  // 評価期間作成フォームのルール
  static get evaluationPeriodForm() {
    return {
      periodName: [
        { type: 'required', fieldName: '期間名' },
        { type: 'stringLength', min: 3, max: 100, fieldName: '期間名' }
      ],
      startDate: [
        { type: 'required', fieldName: '開始日' },
        { type: 'date', fieldName: '開始日' }
      ],
      endDate: [
        { type: 'required', fieldName: '終了日' },
        { type: 'date', fieldName: '終了日' },
        { 
          type: 'custom', 
          validator: (endDate, formData) => {
            if (!endDate || !formData.get('startDate')) {
              return { isValid: true }; // 他のバリデーションに任せる
            }
            return ValidationUtils.validateDateRange(
              formData.get('startDate'), 
              endDate, 
              '開始日', 
              '終了日'
            );
          }
        }
      ],
      type: [
        { type: 'required', fieldName: '期間タイプ' }
      ]
    };
  }
  
  // 評価項目作成フォームのルール
  static get evaluationItemForm() {
    return {
      itemName_ja: [
        { type: 'required', fieldName: '項目名（日本語）' },
        { type: 'stringLength', min: 2, max: 100, fieldName: '項目名（日本語）' }
      ],
      itemName_en: [
        { type: 'stringLength', max: 100, fieldName: '項目名（英語）' }
      ],
      itemName_vi: [
        { type: 'stringLength', max: 100, fieldName: '項目名（ベトナム語）' }
      ],
      categoryName_ja: [
        { type: 'required', fieldName: 'カテゴリ名（日本語）' },
        { type: 'stringLength', min: 2, max: 50, fieldName: 'カテゴリ名（日本語）' }
      ],
      sortOrder: [
        { type: 'number', min: 0, max: 9999, fieldName: '並び順' }
      ]
    };
  }
  
  // ユーザー配属フォームのルール
  static get userAssignmentForm() {
    return {
      userId: [
        { type: 'required', fieldName: 'ユーザー' }
      ],
      department: [
        { type: 'required', fieldName: '部門' }
      ],
      jobType: [
        { type: 'required', fieldName: '職種' }
      ],
      level: [
        { type: 'number', min: 1, max: 10, fieldName: 'レベル' }
      ]
    };
  }
}