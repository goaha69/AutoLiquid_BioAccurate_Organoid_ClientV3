const path = require('path')
const webpack = require('webpack')
const createThemeColorReplacerPlugin = require('./config/plugin.config')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

const productionGzipExtensions = ['js', 'css', 'svg', 'ttf', 'otf']

function resolve(dir) {
  return path.join(__dirname, dir)
}

const isProd = process.env.NODE_ENV === 'production'

const assetsCDN = {
  // webpack build externals
  externals: {
    // vue: 'Vue',
    // 'vue-router': 'VueRouter',
    // vuex: 'Vuex',
    // axios: 'axios'
  },
  css: [],
  js: [
  ]
}

// vue.config.js
const vueConfig = {
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // 配置compression-webpack-plugin压缩
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,// 只有大小大于该值的资源会被处理 10240 10k
        minRatio: 0.8,// 只有压缩率小于这个值的资源才会被处理 
        deleteOriginalAssets: false // 删除原文件true=删
      })
    ],
    // if prod, add externals
    externals: isProd ? assetsCDN.externals : {},
    devtool:"source map"
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })

    // if prod is on
    // assets require on cdn
    if (isProd) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN
        return args
      })
    }
  },

  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#1890FF',
            'layout-color': '#1890FF',
            'border-radius-base': '2px'
          },
          // DO NOT REMOVE THIS LINE
          javascriptEnabled: true
        },
        additionalData: `@import "${resolve('src/components/antd-variables.less')}";`
      }
    }
  },

  devServer: {
    port: 8080,
    proxy: {
      // 代理所有以/api开头的请求
      '/api': {
        target: 'http://localhost:5566',
        ws: true,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '' // 重写路径，去掉/api前缀
        },
        logLevel: 'debug', // 添加调试日志
        onProxyReq: function(proxyReq, req, res) {
          console.log('代理请求:', req.method, req.originalUrl, '→', 'http://localhost:5566' + req.originalUrl.replace('/api', ''));
        },
        onError: function(err, req, res) {
          console.log('代理错误:', err);
        }
      },
      // 直接代理所有API路径（作为备选）
      '/exp_deviceversion': {
        target: 'http://localhost:5566',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      '/getCaptchaOpen': {
        target: 'http://localhost:5566',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      '^/exp_': {
        target: 'http://localhost:5566',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      '^/sys': {
        target: 'http://localhost:5566',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      '^/login': {
        target: 'http://localhost:5566',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      '/hubs': {
        target: 'http://localhost:5566',
        ws: true,
        changeOrigin: true
      }
    },
    // 确保代理能正常工作
    disableHostCheck: true
  },

  // disable source map in production
  productionSourceMap: false,
  lintOnSave: false, //关闭eslint检查
  // babel-loader no-ignore node_modules/*
  transpileDependencies: [
    'k-form-design'
  ]
}

// preview.pro.loacg.com only do not use in your production;
if (process.env.VUE_APP_PREVIEW === 'true') {
  // eslint-disable-next-line no-labels
  // runtimeCompiler: true,
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
}

require('events').EventEmitter.defaultMaxListeners = 0; // 解除限制

module.exports = vueConfig
