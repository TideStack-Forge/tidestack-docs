const docsSiteUrl =
  process.env.DOCS_SITE_URL ||
  process.env.DEPLOY_PRIME_URL ||
  process.env.URL ||
  (process.env.GITHUB_REPOSITORY_OWNER
    ? 'https://docs.tidestack.dev'
    : null) ||
  'http://localhost'

const docsBaseUrl = process.env.DOCS_BASE_URL || '/'

// 基本信息
const baseMeta = {
  title: '潮汐栈',
  tagline: '快速构建、融合开发、快速迭代',
  favicon: 'img/favicon.ico',

  url: docsSiteUrl,
  baseUrl: docsBaseUrl,
  organizationName: 'TideStack-Forge',
  projectName: 'tidestack-docs',
}

// 供 Docusaurus 使用的基本信息
const siteMeta = {
  ...baseMeta,
  onBrokenLinks: 'throw',
}

// 供其他配置文件使用的完整信息
const fullMeta = {
  ...baseMeta,
  logo: {
    alt: '潮汐栈',
    src: 'img/logo.svg',
  },
  socialCardImage: 'img/ouroboros-social-card.png',
}

export { siteMeta, fullMeta }
