/**
 * Cache Service
 * データキャッシング機能
 */
export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // デフォルト5分
  }

  set(key, data, ttl = this.ttl) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      ttl: ttl
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(pattern = null) {
    if (!pattern) {
      this.cache.clear();
    } else {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }

  has(key) {
    return this.get(key) !== null;
  }

  getAll() {
    const result = {};
    for (const [key, value] of this.cache.entries()) {
      if (this.get(key) !== null) {
        result[key] = value.data;
      }
    }
    return result;
  }

  size() {
    return this.cache.size;
  }
}
