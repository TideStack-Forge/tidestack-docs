import React, {useState} from 'react'
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch'
import styles from './styles.module.css'

export default function Canvas({src, alt, width, height}) {
  const [scale, setScale] = useState(1)
  const [failed, setFailed] = useState(false)

  return (
    <TransformWrapper
      fitOnInit
      minScale={0.05}
      maxScale={8}
      onTransform={(_, state) => setScale(state.scale)}>
      {({zoomIn, zoomOut, fitToView, centerView}) => (
        <>
          <div className={styles.toolbar} role="group" aria-label="图表缩放">
            <button type="button" aria-label="缩小" onClick={() => zoomOut()}>−</button>
            <output aria-label="缩放比例">{Math.round(scale * 100)}%</output>
            <button type="button" aria-label="放大" onClick={() => zoomIn()}>＋</button>
            <button type="button" onClick={() => fitToView()}>适应窗口</button>
            <button type="button" onClick={() => centerView(1)}>原始大小</button>
            <a href={src} target="_blank" rel="noopener noreferrer">打开原图 ↗</a>
            <span className={styles.hint}>滚轮缩放 · 拖拽平移</span>
          </div>
          {failed ? <p role="alert">图表加载失败，请尝试打开原图。</p> : null}
          <div className={styles.viewport}>
            <TransformComponent wrapperStyle={{width: '100%', height: '100%'}}>
              <img src={src} alt={alt || '图表'} width={width} height={height} className={styles.image} draggable={false} onError={() => setFailed(true)} />
            </TransformComponent>
          </div>
        </>
      )}
    </TransformWrapper>
  )
}
