import React, {createContext, useContext} from 'react'
import MDXComponents from '@theme-original/MDXComponents'
import SvgViewer from '@site/src/components/SvgViewer'

const InsideLink = createContext(false)
const OriginalImage = MDXComponents.img
const OriginalLink = MDXComponents.a

function isSvg(source) {
  return typeof source === 'string' && /\.svg(?:[?#].*)?$/i.test(source)
}

function Image(props) {
  const insideLink = useContext(InsideLink)
  const image = <OriginalImage {...props} />
  return isSvg(props.src) && !insideLink
    ? <SvgViewer src={props.src} alt={props.alt} width={props.width} height={props.height}>{image}</SvgViewer>
    : image
}

function Link({children, ...props}) {
  const content = React.Children.toArray(children)
  const image = content.length === 1 && React.isValidElement(content[0])
    ? content[0]
    : null

  // Docusaurus emits linked assets under /files/ and image assets under /images/.
  const imageHref = props.href?.replace('/assets/files/', '/assets/images/')
  if (image && isSvg(image.props.src) && imageHref === image.props.src) {
    return <Image {...image.props} />
  }

  return (
    <InsideLink.Provider value={true}>
      <OriginalLink {...props}>{children}</OriginalLink>
    </InsideLink.Provider>
  )
}

export default {...MDXComponents, img: Image, a: Link}
