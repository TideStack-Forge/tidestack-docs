import {createRequire} from 'module'

const require = createRequire(import.meta.url)

export default function externalSvgImagesPlugin() {
  return {
    name: 'external-svg-images',
    configureWebpack() {
      return {
        plugins: [{
          apply(compiler) {
            compiler.hooks.compilation.tap('external-svg-images', (compilation) => {
              compiler.webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
                'external-svg-images',
                (loaders, module) => {
                  if (!/\.svg(?:[?#]|$)/i.test(module.resource)) return
                  for (const loader of loaders) {
                    if (loader.loader !== require.resolve('url-loader')) continue
                    // Markdown uses an inline loader request, so changing webpack rules alone has no effect.
                    if (typeof loader.options === 'string') {
                      const options = new URLSearchParams(loader.options)
                      options.set('limit', '0')
                      loader.options = options.toString()
                    } else {
                      loader.options = {...loader.options, limit: false}
                    }
                  }
                },
              )
            })
          },
        }],
      }
    },
  }
}
