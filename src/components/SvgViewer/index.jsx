import React, {lazy, Suspense, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import styles from './styles.module.css'

const Canvas = lazy(() => import('./Canvas'))

function ViewerDialog({src, alt, width, height, onClose}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={alt || '查看图表'}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current.close()
      }}>
      <div className={styles.layout}>
        <header className={styles.header}>
          <span className={styles.title}>{alt || '查看图表'}</span>
          <button type="button" autoFocus onClick={() => dialogRef.current.close()}>关闭 <kbd>Esc</kbd></button>
        </header>
        <Suspense fallback={<p className={styles.loading} role="status">正在加载图表…</p>}>
          <Canvas src={src} alt={alt} width={width} height={height} />
        </Suspense>
      </div>
    </dialog>,
    document.body,
  )
}

export default function SvgViewer({src, alt, width, height, children}) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)

  function closeViewer() {
    setIsOpen(false)
    triggerRef.current?.focus({preventScroll: true})
  }

  return (
    <>
      <a
        ref={triggerRef}
        href={src}
        className={styles.trigger}
        aria-label={`放大查看：${alt || '图表'}`}
        aria-haspopup="dialog"
        title="点击放大查看"
        onClick={(event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          setIsOpen(true)
        }}>
        {children}
      </a>
      {isOpen ? <ViewerDialog src={src} alt={alt} width={width} height={height} onClose={closeViewer} /> : null}
    </>
  )
}
