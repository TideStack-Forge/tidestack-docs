import { fullMeta } from './meta.js'
import items from './themeConfig.navbar.items.js'
import footer from './themeConfig.footer.js'
import prism from './themeConfig.prism.js'

const themeConfig =
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
  ({
    // Replace with your project's social card
    image: fullMeta.socialCardImage,
    navbar: {
      title: fullMeta.title,
      logo: fullMeta.logo,
      items,
    },
    footer,
    prism,
    docs: {
      sidebar: {
        hideable: true,
      },
    },
  })

export default themeConfig
