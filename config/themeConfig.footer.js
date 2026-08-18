import { fullMeta as meta } from './meta.js'

const footer = {
  style: 'dark',
  links: [
    {
      title: '开始浏览',
      items: [
        {
          label: '快速上手',
          to: '/docs/getting-started',
        },
        {
          label: '低代码开发',
          to: '/docs/low-code',
        },
        {
          label: '融合开发',
          to: '/docs/fusion-development',
        },
        {
          label: '运维管理',
          to: '/docs/operations',
        },
      ],
    },
    {
      title: '理解与查阅',
      items: [
        {
          label: '平台介绍',
          to: '/docs/overview',
        },
        {
          label: '核心概念',
          to: '/docs/concepts',
        },
        {
          label: '参考资料',
          to: '/docs/reference',
        },
      ],
    },
  ],
  copyright: `Copyright © ${new Date().getFullYear()} ${meta.organizationName}`,
}

export default footer
