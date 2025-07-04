// Vue 3中推荐使用mitt库作为事件总线
// 如果没有mitt，可以创建一个简单的事件总线
class EventBus {
  constructor() {
    this.events = {};
  }

  $on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  $emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }

  $off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      } else {
        this.events[event] = [];
      }
    }
  }
}

export default new EventBus()
