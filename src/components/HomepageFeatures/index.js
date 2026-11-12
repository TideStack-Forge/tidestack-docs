import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

const PathList = [
  {
    title: '低代码开发',
    to: '/docs/low-code',
    audience: '业务开发人员',
    summary: '将业务意图表达为模型，组合数据、页面与流程，交付可复用的业务应用。',
    next: '应用建模 · 页面与流程 · 权限与通知',
  },
  {
    title: '融合开发',
    to: '/docs/fusion-development',
    audience: '专业开发人员',
    summary: '让高代码、低代码与 AI 围绕同一份模型资产协作，通过正式扩展点组合自定义能力。',
    next: '前后端扩展 · 工具链协同 · AI 辅助开发',
  },
  {
    title: '运维管理',
    to: '/docs/operations',
    audience: '实施与运维人员',
    summary: '围绕应用交付做好部署、发布、监控与升级，让模型与应用资产持续演进。',
    next: '安装部署 · 发布升级 · 监控排障',
  },
]

const ResourceList = [
  {
    title: '概念与设计',
    to: '/docs/concepts',
    summary: '理解模型标准、设计理念与平台架构。',
  },
  {
    title: '参考资料',
    to: '/docs/reference',
    summary: '按需查阅 API、脚本上下文与常见问题。',
  },
  {
    title: 'AI 入口',
    to: '/docs/ai',
    summary: '让 AI 理解模型规范，按任务选择上下文并核对交付结果。',
  },
]

function PathCard({ title, to, audience, summary, next }) {
  return (
    <article>
      <Link className={styles.card} to={to}>
        <p className={styles.cardAudience}>{audience}</p>
        <div className={styles.cardTop}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
          <span className={styles.cardAction} aria-hidden="true">↗</span>
        </div>
        <p className={styles.cardSummary}>{summary}</p>
        <p className={styles.cardNext}>{next}</p>
      </Link>
    </article>
  )
}

export default function HomepageFeatures() {
  return (
    <div className={styles.features}>
      <div className="container">
        <section aria-labelledby="paths-title">
          <div className={styles.sectionHeader}>
            <Heading as="h2" id="paths-title">选择你的开发路径</Heading>
            <p>围绕同一份模型资产，完成建模、扩展、交付与持续演进。</p>
          </div>
          <div className={styles.paths}>
            {PathList.map((props) => (
              <PathCard key={props.to} {...props} />
            ))}
          </div>
        </section>
        <section className={styles.resources} aria-labelledby="resources-title">
          <div className={styles.sectionHeader}>
            <Heading as="h2" id="resources-title">理解与查阅</Heading>
            <p>理解模型标准、查阅接口规范，为人与 AI 的协作提供共同依据。</p>
          </div>
          <div className={styles.resourceGrid}>
            {ResourceList.map(({ title, to, summary }) => (
              <Link key={to} className={styles.resourceLink} to={to}>
                <div className={styles.cardTop}>
                  <Heading as="h3">{title}</Heading>
                  <span className={styles.cardAction} aria-hidden="true">→</span>
                </div>
                <p>{summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
