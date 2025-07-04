// 替代 vue-ls，提供本地存储功能
const Storage = {
  prefix: 'ls_',
  
  /**
   * 设置存储
   * @param {String} key 键
   * @param {*} value 值
   * @param {Number} expire 过期时间，单位：秒
   */
  set(key, value, expire = null) {
    if (key) {
      key = this.prefix + key;
      const data = {
        value,
        time: Date.now()
      }
      
      if (expire) {
        data.expire = expire * 1000;
      }
      
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
  
  /**
   * 获取存储
   * @param {String} key 键
   * @param {*} def 默认值
   */
  get(key, def = null) {
    if (key) {
      key = this.prefix + key;
      const item = localStorage.getItem(key);
      
      if (item) {
        try {
          const data = JSON.parse(item);
          const expire = data.expire;
          const time = data.time;
          
          if (expire && Date.now() - time > expire) {
            this.remove(key);
            return def;
          }
          
          return data.value;
        } catch (e) {
          return def;
        }
      }
    }
    return def;
  },
  
  /**
   * 移除存储
   * @param {String} key 键
   */
  remove(key) {
    if (key) {
      key = this.prefix + key;
      localStorage.removeItem(key);
    }
  },
  
  /**
   * 清空所有存储
   */
  clear() {
    localStorage.clear();
  },
  
  // 兼容Vue 3插件接口
  install(app, options = {}) {
    // 设置前缀
    if (options.namespace) {
      this.prefix = options.namespace;
    }
    
    // 添加全局方法
    app.config.globalProperties.$ls = this;
    
    // 添加组合式API支持
    app.provide('$ls', this);
  }
};

export default Storage;
