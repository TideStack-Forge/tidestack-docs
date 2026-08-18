// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { siteMeta, fullMeta } from './config/meta.js'
import i18n from './config/i18n.js'
import markdown from './config/markdown.js'

import blog from './config/presets.blog.js'
import docs from './config/presets.docs.js'
import vscodeLsEsmAliasPlugin from './config/plugins/vscode-ls-esm-alias.js'

import themeConfig from './config/themeConfig.js'

/** @type {import('@docusaurus/types').Config} */
const config = {
  ...siteMeta,
  i18n,

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs,
        blog,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [vscodeLsEsmAliasPlugin],
  themeConfig,
  markdown,
  themes: [
    '@docusaurus/theme-mermaid',
    [
      // @ts-ignore
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      // @ts-ignore
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        language: ['en', 'zh'],
        // ```
      },
    ],
  ],
}

export default config
