const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// @expo/log-box (via expo-router's metro runtime) imports react-dom/client
// for its web error overlay. On native this module doesn't exist, so we
// stub it out to prevent the "Unable to resolve react-dom/client" error.
const reactDomStub = path.resolve(__dirname, 'src/stubs/reactDom.js')

const originalResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
    return { type: 'sourceFile', filePath: reactDomStub }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
