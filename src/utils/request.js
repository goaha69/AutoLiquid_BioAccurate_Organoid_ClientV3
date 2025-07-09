import axios from 'axios';
import store from '@/store';
import { message, Modal, notification } from 'ant-design-vue';
import { VueAxios } from './axios';
import { ACCESS_TOKEN } from '@/store/mutation-types';

// localStorage辅助函数
const ls = {
  set: (key, value, expire) => {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem(`pro__${key}`, JSON.stringify(data))
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`pro__${key}`)
      if (!item) return defaultValue
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem(`pro__${key}`)
        return defaultValue
      }
      return data.value
    } catch {
      return defaultValue
    }
  },
  remove: (key) => {
    localStorage.removeItem(`pro__${key}`)
  }
}

// 根据环境变量动态设置后端地址，优先读取 VITE_APP_API_BASE_URL，未配置时回退到 /api
const baseURL = import.meta?.env?.VITE_APP_API_BASE_URL || '/api'

// 创建 axios 实例
const service = axios.create({
  baseURL,
  timeout: 60000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 用于防止重复刷新 token
let isRefreshing = false;
let failedRequestsQueue = [];

// 错误处理函数
const err = (error) => {
  if (error.response) {
    const data = error.response.data;
    const token = ls.get(ACCESS_TOKEN);

    if (error.response.status === 403) {
      console.log('服务器403啦，要重新登录！');
      notification.error({
        message: 'Forbidden',
        description: data.message,
      });
    }
    if (error.response.status === 500) {
      if (data.message.length > 0) {
        message.error(data.message);
      }
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed',
      });
      if (token) {
        // 清除 token 并重新登录
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        });
      }
    }
  }
  return Promise.reject(error);
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    const token = ls.get(ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  err
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.config.url, response.data);
    if (response.request.responseType === 'blob') {
      return response;
    }
    const code = response.data.code;
    if (
      code === 1011006 ||
      code === 1011007 ||
      code === 1011008 ||
      code === 1011009
    ) {
      Modal.error({
        title: '提示：',
        content: response.data.message,
        okText: '重新登录',
        onOk: () => {
          ls.remove(ACCESS_TOKEN);
          window.location.reload();
        },
      });
    } else if (
      code === 1013002 ||
      code === 1016002 ||
      code === 1015002
    ) {
      message.error(response.data.message);
      return response.data;
    } else {
      return response.data;
    }
  },
  (error) => {
    console.error('API错误:', error.response?.status, error.config?.url, error.message);
    const { response } = error;
    if (response) {
      // 401 错误处理
      if (response.status === 401) {
        const originalRequest = error.config;

        // 暂时简化401处理，直接跳转到登录页面
        notification.error({
          message: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
        });
        // 清除 token 并强制重新登录
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        });
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const installer = {
  vm: {},
  install(app) {
    app.use(VueAxios, service);
  },
};

export {
  installer as VueAxios,
  service as axios,
};