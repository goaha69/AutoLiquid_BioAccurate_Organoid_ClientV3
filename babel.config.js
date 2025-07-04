const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const plugins = [
  // Add support for class fields
  '@babel/plugin-proposal-class-properties'
]

if (IS_PROD) {
  plugins.push('transform-remove-console')
}

// lazy load ant-design-vue
// if your use import on Demand, Use this code
plugins.push(['import', {
  'libraryName': 'ant-design-vue',
  'libraryDirectory': 'es',
  'style': false // 禁用自动样式导入，在 4.x 版本中手动导入
}])

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        'useBuiltIns': 'entry',
        'corejs': 3
      }
    ]
  ],
  plugins
}
