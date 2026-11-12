import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'

import Heading from '@theme/Heading'
import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroLayout}`}>
        <div>
          <p className={styles.eyebrow}>TideStack · 开发手册</p>
          <Heading as="h1" className={styles.title}>
            {siteConfig.tagline}
          </Heading>
          <p className={styles.lead}>
            以业务语义为中心，让 AI 与开发者协同构建企业应用。
            从业务建模到应用交付，让页面、流程与代码在同一平台持续演进。
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              快速开始 <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.overviewLink} to="/docs/overview">
              了解{siteConfig.title} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <aside className={styles.tutorial} aria-labelledby="tutorial-title">
          <p className={styles.eyebrow}>从第一个模型开始</p>
          <Heading as="h2" id="tutorial-title">搭建一个客户管理应用</Heading>
          <p className={styles.tutorialDescription}>跟随教程定义客户模型、生成业务页面，并运行验证第一个应用。</p>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">01</span>
              <div><strong>启动开发平台</strong><span>准备本地环境，登录开发平台</span></div>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">02</span>
              <div><strong>定义业务模型</strong><span>创建应用与客户模型，生成业务页面</span></div>
            </li>
            <li>
              <span className={styles.stepNumber} aria-hidden="true">03</span>
              <div><strong>运行并验证</strong><span>录入、查询和编辑第一条客户数据</span></div>
            </li>
          </ol>
          <Link className={styles.tutorialLink} to="/docs/getting-started">
            开始搭建 <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>
    </header>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={`${siteConfig.title}开发手册`} description="需求进，应用出。以业务语义为中心，让 AI 与开发者协同构建企业应用。从业务建模到应用交付，让页面、流程与代码在同一平台持续演进。">
      <main>
        <HomepageHeader />
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
