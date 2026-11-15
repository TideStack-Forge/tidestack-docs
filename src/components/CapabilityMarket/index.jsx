import React, {useMemo, useState} from 'react'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useBrokenLinks from '@docusaurus/useBrokenLinks'
import catalog from '@site/static/capabilities/catalog.json'
import styles from './styles.module.css'

const sides = {frontend: '前端基座', backend: '后端基座'}
const categoryNames = Object.fromEntries(catalog.categories.map(({id, name}) => [id, name]))

function matches(item, query) {
  const text = [item.id, item.name, item.summary, item.useWhen, item.requires, item.limits,
    categoryNames[item.category], ...item.entryPoints, ...item.modules, ...item.access.map(key => catalog.accessLabels[key])]
    .join(' ').toLocaleLowerCase()
  return query.trim().toLocaleLowerCase().split(/\s+/).every(term => text.includes(term))
}

export default function CapabilityMarket() {
  const brokenLinks = useBrokenLinks()
  catalog.capabilities.forEach(item => brokenLinks.collectAnchor(item.id))
  const [query, setQuery] = useState('')
  const [side, setSide] = useState('all')
  const [category, setCategory] = useState('all')
  const [access, setAccess] = useState('all')
  const docsBase = useBaseUrl('/docs/')
  const catalogUrl = useBaseUrl('/capabilities/catalog.json')
  const visible = useMemo(() => catalog.capabilities.filter(item =>
    (side === 'all' || side === item.side) &&
    (category === 'all' || category === item.category) &&
    (access === 'all' || item.access.includes(access)) && matches(item, query)),
  [query, side, category, access])

  function reset() {
    setQuery('')
    setSide('all')
    setCategory('all')
    setAccess('all')
  }

  return (
    <section className={styles.market} aria-label="能力目录">
      <div className={styles.toolbar}>
        <label className={styles.search}>查找能力
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="输入需求、能力名称或 API，如：审批、延迟、subscribeWithInitial" />
        </label>
        <div className={styles.filters}>
          <label>基座
            <select value={side} onChange={event => setSide(event.target.value)}>
              <option value="all">全部</option>
              {Object.entries(sides).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
          <label>领域
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option value="all">全部领域</option>
              {catalog.categories.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label>接入方式
            <select value={access} onChange={event => setAccess(event.target.value)}>
              <option value="all">全部方式</option>
              {Object.entries(catalog.accessLabels).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
          <button type="button" onClick={reset}>清除筛选</button>
        </div>
        <div className={styles.result}>
          <span role="status" aria-live="polite">找到 {visible.length} / {catalog.capabilities.length} 项能力</span>
          <a href={catalogUrl} download>下载 AI 能力目录（JSON）</a>
        </div>
      </div>
      {visible.length === 0 && <p className={styles.empty}>没有匹配的能力。可减少关键词，或清除领域和接入方式筛选。</p>}
      <div className={styles.grid}>
        {visible.map(item => (
          <article key={item.id} id={item.id} className={styles.card}>
            <div className={styles.tags}>
              <span data-side={item.side}>{sides[item.side]}</span>
              <span>{categoryNames[item.category]}</span>
            </div>
            <h3><a href={`#${item.id}`}>{item.name}</a></h3>
            <p>{item.summary}</p>
            <p className={styles.when}><strong>适用：</strong>{item.useWhen}</p>
            <div className={styles.docs}>
              {item.docs.map(doc => (
                <Link key={doc.path} to={docsBase + doc.path.replace(/\.mdx?$/, '').replace(/\/index$/, '/')}>
                  {doc.coverage === 'guide' ? '使用指南' : '相关说明'} →
                </Link>
              ))}
            </div>
            <details>
              <summary>接入条件与限制</summary>
              <dl>
                <dt>调用或配置入口</dt>
                <dd>{item.entryPoints.map(entry => <code key={entry}>{entry}</code>)}</dd>
                <dt>接入方式</dt><dd>{item.access.map(key => catalog.accessLabels[key]).join('、')} · {catalog.availabilityLabels[item.availability]}</dd>
                <dt>使用前提</dt><dd>{item.requires}</dd>
                <dt>注意事项</dt><dd>{item.limits}</dd>
                <dt>能力标识</dt><dd><code>{item.id}</code></dd>
                <dt>来源模块</dt><dd>{item.modules.map(module => <code key={module}>{module}</code>)}</dd>
              </dl>
              <details>
                <summary>源码依据（仓库内路径）</summary>
                <ul className={styles.sources}>{item.sources.map(source => <li key={source}><code>{source}</code></li>)}</ul>
              </details>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
