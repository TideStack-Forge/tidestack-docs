import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'

import Heading from '@theme/Heading'
import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.lead}>
          面向业务开发、专业开发与实施运维团队的统一文档入口。
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started"
          >
            快速上手
          </Link>
          <Link className="button button--outline button--lg" to="/docs/low-code">
            低代码开发
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/fusion-development"
          >
            融合开发
          </Link>
          <Link className="button button--outline button--lg" to="/docs/operations">
            运维管理
          </Link>
        </div>
        <p className={styles.helperLinks}>
          理解平台模型：<Link to="/docs/concepts">核心概念</Link>
          <span className={styles.dot}>·</span>查 API 与 FAQ：
          <Link to="/docs/reference">参考资料</Link>
        </p>
      </div>
    </header>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={`${siteConfig.title}`} description="潮汐栈官方文档">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
