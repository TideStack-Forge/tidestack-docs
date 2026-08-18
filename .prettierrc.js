module.exports = {
  // 一行最多 90 字符
  printWidth: 90,

  // 使用 2 个空格缩进
  tabWidth: 2,

  // 使用空格代替tab缩进
  useTabs: false,

  // 句末不用分号
  semi: false,

  // 使用单引号
  singleQuote: true,

  // 仅在必需时为对象的key添加引号
  quoteProps: 'as-needed',

  // jsx中使用单引号
  jsxSingleQuote: false,

  // 按照ES5标准打印尾随逗号（array, object）
  trailingComma: 'es5',

  // 在对象前后添加空格
  // eg: { foo: bar }
  bracketSpacing: true,

  // 多属性html标签的‘>’折行放置在最后一个属性的后面
  jsxBracketSameLine: true,

  // 箭头函数参数必须在圆括号内
  // eg: (x) => x
  arrowParens: 'always',

  // 无需顶部注释即可格式化
  requirePragma: false,

  // 在已被preitter格式化的文件顶部加上标注
  insertPragma: false,

  // 对 markdown 段落使用默认的折行标准
  proseWrap: 'preserve',

  // 对HTML全局空格不敏感
  htmlWhitespaceSensitivity: 'ignore',

  // 不对vue中的script及style标签缩进
  vueIndentScriptAndStyle: false,

  // 结束行形式为换行符
  endOfLine: 'lf',

  // 对引用代码进行格式化
  embeddedLanguageFormatting: 'auto',

  // 在 html, vue 以及 jsx 中，是否强制每个属性的换行（否）
  singleAttributePerLine: false,
}
