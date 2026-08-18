module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended', // 扩展 vue 官方的 eslint 标准规则
    '@vue/standard', // 扩展 eslint 标准规则
    'prettier', // 必须放最后; 用于关闭所有与 prettier 冲突的规则
  ],
  parserOptions: {
    parser: '@babel/eslint-parser', // 支持实验性语法的lint检测
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['jsx'],
      },
    },
  },
  plugins: [
    'prettier', // eslint-plugin-prettier 的插件配置，用于格式化代码与 eslint 配合使用
  ],
  /**
   * 示例可视化参考：https://alloyteam.github.io/eslint-config-alloy/?hideOff=1&language=zh-CN&rule=vue
   */
  rules: {
    // 生产环境下警告 console 的使用
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // 生产环境下警告 debugger 的使用
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // 是否强制使用 . 访问静态的属性名（否）
    // eg: foo['bar'] 会报错，但是如果方括号中的值是变量，就不会报错
    'dot-notation': 'off',

    // vue模版中，是否标签内容即便是单行的也要强制换行（否）
    'vue/singleline-html-element-content-newline': 'off',

    // vue模版中，是否标签有多个属性时，每个属性都要换行（否）
    'vue/max-attributes-per-line': 'off',

    // vue模版中，是否在可以用自闭合标签时必须用自闭合标签（否）
    'vue/html-self-closing': 'off',

    // vue组件名是否必须是多单词的（否）
    'vue/multi-word-component-names': 'off',

    // 数组或键值对最后一个元素后面必须有逗号
    'comma-dangle': [
      1,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],

    // 与 prettier 格式不符时报错
    'prettier/prettier': 'error',
  },
}
