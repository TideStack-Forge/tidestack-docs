import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

export default function vscodeLsEsmAliasPlugin() {
  return {
    name: 'vscode-ls-esm-alias',
    configureWebpack(_config, isServer) {
      if (!isServer) {
        return {}
      }

      return {
        resolve: {
          alias: {
            'vscode-languageserver-types$': path.join(
              path.dirname(require.resolve('vscode-languageserver-types')),
              '../esm/main.js'
            ),
          },
        },
      }
    },
  }
}
