const items = [
  {
    type: 'docSidebar',
    sidebarId: 'gettingStartedSidebar',
    position: 'left',
    label: '开始使用',
  },
  {
    type: 'docSidebar',
    label: '低代码开发',
    position: 'left',
    sidebarId: 'lowCodeSidebar',
  },
  {
    type: 'docSidebar',
    label: '融合开发',
    position: 'left',
    sidebarId: 'fusionDevelopmentSidebar',
  },
  {
    type: 'docSidebar',
    label: '运维管理',
    position: 'left',
    sidebarId: 'operationsSidebar',
  },
  {
    type: 'docSidebar',
    label: '概念与设计',
    position: 'left',
    sidebarId: 'conceptsSidebar',
  },
  {
    type: 'docSidebar',
    label: '参考资料',
    position: 'left',
    sidebarId: 'referenceSidebar',
  },
  {
    type: 'docSidebar',
    label: 'AI 入口',
    position: 'left',
    sidebarId: 'aiSidebar',
  },
  {
    label: '官网',
    href: process.env.OFFICIAL_SITE_URL || 'https://www.tidestackforge.com',
    position: 'right',
  },
  {
    type: 'search',
    position: 'right',
  },
  {
    type: 'localeDropdown',
    position: 'right',
  },
]

export default items
