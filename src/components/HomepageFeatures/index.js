import clsx from 'clsx'
import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

const PathList = [
  {
    title: '快速上手',
    to: '/docs/getting-started',
    audience: '首次接触平台的使用者、业务开发、专业开发与实施同学',
    summary: '先理解平台，再把环境跑起来，完成第一个最小可用功能。',
    next: '平台介绍、角色与典型场景、环境准备、安装开发平台',
  },
  {
    title: '低代码开发',
    to: '/docs/low-code',
    audience: '主要依赖平台内建能力交付业务功能的业务开发人员',
    summary: '围绕应用、模型、页面、流程、权限和通知组织业务交付主线。',
    next: '低代码开发总览、从需求到交付、业务模型、审批流',
  },
  {
    title: '融合开发',
    to: '/docs/fusion-development',
    audience: '需要通过前后端扩展承接复杂需求的专业开发人员',
    summary: '先判断是否真的需要写代码，再进入前端扩展或后端扩展专题。',
    next: '融合开发总览、何时用低代码、平台扩展点总表、高低开协同模式',
  },
  {
    title: '运维管理',
    to: '/docs/operations',
    audience: '负责部署、升级、维护和排障的实施与运维人员',
    summary: '围绕部署架构、环境要求、安装初始化和维护排障组织运维主线。',
    next: '部署架构、环境要求、安装与初始化、业务应用发布',
  },
  {
    title: '核心概念',
    to: '/docs/concepts',
    audience: '需要先理解平台模型和能力边界的读者',
    summary: '集中说明业务模型、UI 模型、权限模型等核心对象及其边界。',
    next: '业务模型、数据模型、字段定义、权限模型',
  },
  {
    title: '参考资料',
    to: '/docs/reference',
    audience: '需要查 API、脚本上下文、FAQ 和细节说明的读者',
    summary: '适合在具体实现过程中按需检索，而不是作为第一次阅读入口。',
    next: 'API 参考、Web API 规范、常见问题',
  },
]

function PathCard({ title, to, audience, summary, next }) {
  return (
    <article className={clsx('col col--4', styles.cardWrap)}>
      <Link className={styles.card} to={to}>
        <div className={styles.cardTop}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
          <span className={styles.cardAction}>进入路径</span>
        </div>
        <p className={styles.cardAudience}>适合对象：{audience}</p>
        <p className={styles.cardSummary}>{summary}</p>
        <p className={styles.cardNext}>建议先看：{next}</p>
      </Link>
    </article>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">按你的目标进入</Heading>
          <p>选择当前任务对应的入口，按页面给出的顺序操作和验收。</p>
        </div>
        <div className="row">
          {PathList.map((props, idx) => (
            <PathCard key={idx} {...props} />
          ))}
        </div>
        <div className={styles.callout}>
          <Heading as="h3" className={styles.calloutTitle}>
            阅读建议
          </Heading>
          <p>
            如果你还不确定自己属于哪条路径，先从“快速上手”建立整体认知；如果你已经在做具体交付，优先进入“低代码开发”或“融合开发”；遇到术语和模型边界问题，再回看“核心概念”。
          </p>
        </div>
      </div>
    </section>
  )
}
