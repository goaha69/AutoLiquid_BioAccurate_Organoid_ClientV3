import * as SignalR from '@microsoft/signalr'
import store from '../store/index'
import {exp_equipment_heartbeat} from '@/api/modular/experiment/equipmentManage' 

const base_url = site_config.proxy?'':site_config.api_service

const EventEmitter = require('events')

const defaultOptions = {
  log: false
}

class SocketConnection extends EventEmitter {
  constructor(connection, options = {}) {
    super()
    this.connection = connection
    this.options = Object.assign(defaultOptions, options)
    this.listened = []
    this.toSend = []
    this.offline = false
    this.socket = undefined
  }

  /**
   * 同一种消息只定义一次
   *
   * @param {string| symbol} event
   * @param {(...args: any[]) => void} listener
   * @memberof SocketConnection
   */
  one(event, listener) {
    if (this.listeners(event).length === 0) {
      this.on(event, listener)
    }
  }

  async _initialize() {
    try {
      await this.socket.start();
      this.emit('onstart');
      console.log('_initialize-->onstart');
      if (this.offline) {
        this.emit('onrestart');
        console.log('_initialize-->onrestart');
      }
      this.offline = false;
    } catch (error) {
      console.error('Failed to initialize connection:', error);
      await this._reconnect();
    }
  }

  async _reconnect() {
    this.offline = true;
    this.emit('onclose');
    console.log('------>onclose------>123');
    await this._initialize();
  }

  async start(token) 
  {
      // 组件重新加载时, 如果 socket 存在, 不需要新建
      this.socket = new SignalR.HubConnectionBuilder()
      .configureLogging(SignalR.LogLevel.Information)
      .withUrl(
        `${base_url}/hubs/chathub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: SignalR.HttpTransportType.WebSockets,
          keepAliveIntervalInMilliseconds: 10000 // 每10秒发送一次心跳
        }
      ).build()

      this.socket.on('ForceExist', () => { //可以做相关业务逻辑
        store.dispatch("Logout").then(()=>{
          window.location.reload()
        }).catch(err=>{
          this.$message.error({title: '错误',description: err.message})
        })
      })
      
      this.socket.on('AppendNotice', (notice) => { 
         store.commit("APPEND_NOTICE",notice)
      })

      this.socket.on('PublicNotice', (notice) => { 
        this.emit('PublicNotice',notice)
      })

      this.socket.on('PublicMessage', (message) => { 
        this.emit('PublicMessage',message)
        // console.log('PublicMessage----->'+message)
      })

      this.socket.onclose(async () => {
        this.offline = true;
        this.emit('onclose');
        console.log('------>onclose------>');
        await this._initialize(); // 尝试重新初始化连接
      });
      await this._initialize()
  }

  async authenticate(token) {
    await this.start(token)
  }

  listen(method) {
    if (this.offline) return
    if (this.listened.some((v) => v === method)) return
    this.listened.push(method)
    this.one('onstart', () => {
      this.listened.forEach((method) => {
        this.socket.on(method, (data) => {
          if (this.options.log) {
            console.log({type: 'receive',method,data})
          }
          this.emit(method, data)
        })
      })
    })
  }

  send(methodName, ...args) {
    if (this.options.log) {
      console.log({type: 'send',methodName,args})
    }
    if (this.offline) return

    if (this.socket) {
      this.socket.send(methodName, ...args)
      return
    }

    this.one('onstart', () => this.socket.send(methodName, ...args))
  }

  async invoke(methodName, ...args) {
    if (this.options.log) {
      console.log({
        type: 'invoke',
        methodName,
        args
      })
    }
    if (this.offline) return false

    if (this.socket) {
      return this.socket.invoke(methodName, ...args)
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => this.one('onstart', () => resolve(this.socket.invoke(methodName, ...args))))
  }
}

if (!SignalR) {
  throw new Error('[Vue-SignalR] Cannot locate signalr-client')
}

function install(app, connection) {
  if (!connection) {
    throw new Error('[Vue-SignalR] Cannot locate connection')
  }

  const Socket = new SocketConnection(connection)
  app.config.globalProperties.$socket = Socket

  app.mixin({
    created() {
      if (this.$options.sockets) {
        const methods = Object.getOwnPropertyNames(this.$options.sockets)

        methods.forEach((method) => {
          Socket.listen(method)

          Socket.one(method, (data) => this.$options.sockets[method].call(this, data))
        })
      }

      if (this.$options.subscribe) {
        Socket.one('authenticated', () => {
          this.$options.subscribe.forEach((channel) => {
            Socket.invoke('join', channel)
          })
        })
      }
    },
    mounted(){
    }
  })
}

// 默认参
let timer = null
// let ws = null
let isConnect = false
let count = 0 
// // 心跳检测
let heart = {
  timer: null,
  timeout: 30000, // 每10分钟进行一次心跳检测
  start() {
    // 暂时禁用心跳功能
    console.log('心跳功能已禁用')
    return
    this.timer = setTimeout(() => {
        if (isConnect) {
          console.log('Heartbeat Message 456');
          //调用方法
          //mySocket.invoke("ClientMethod",'Heartbeat Message#########')

          exp_equipment_heartbeat().then((res) => {})
        }
        //若修复了一次log多条信息后 可以放开下面这条注释进行循环 每10秒进行一次心跳测试
        initWebSocket()
    }, this.timeout)
  },
}

export function connectWebsocket() {
  if (count > 10) {
      connectCount()
      return
  }
  try { // 正在建立连接
    console.log('WebSocket连接成功')
    initWebSocket() // 初始化WebSocket连接
  } catch { // 建立连接出错，重新连接
      connect()
  }
}

// // 重新连接WebSocket
function connect() {
  if (isConnect) return
  console.log('尝试重新连接WebSocket')
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { // 每次连接 延迟5s
      count++
      connectWebsocket()
  }, 5000)
}

// // 初始化WebSocket连接
function initWebSocket() {
  isConnect = true
  heart.start() // 开始心跳检测
}
//连接失败
function connectCount() {
  console.log('WebSocket连接失败');
  clearTimeout(timer)
}

let mySocket = null
export function heartbeatInstall(app) {
  mySocket = app.config.globalProperties.$socket;
  // setTimeout(() => {
  //   if (!app.config.globalProperties.$socket.offline) {
  //     console.log('Heartbeat Message');        
  //     app.config.globalProperties.$socket.invoke("ClientMethod",'Heartbeat Message')
  //   }
  // }, 3000)
}

export function heartbeatMethod() {
  heart.start()
  // setTimeout(() => {
  //   console.log('心跳检测')
  //   console.log('mySocket.offline : '+ mySocket.offline)
  //   if (!mySocket.offline) {
  //     console.log('Heartbeat Message');        
  //     mySocket.invoke("ClientMethod",'Heartbeat Message')
  //   }
  // }, 10000)
}

export default {install}
