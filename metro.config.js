// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Store the original resolveRequest
const originalResolveRequest = config.resolver.resolveRequest;

// Custom resolver to handle .js imports from TypeScript files
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // If it's a relative import ending in .js and we're in a TypeScript file in node_modules/ox
  if (
    moduleName.endsWith('.js') &&
    context.originModulePath &&
    context.originModulePath.includes('node_modules/ox') &&
    moduleName.startsWith('.')
  ) {
    // Try resolving without .js extension (Metro will try .ts automatically)
    const moduleNameWithoutExt = moduleName.slice(0, -3);
    try {
      if (originalResolveRequest) {
        return originalResolveRequest(context, moduleNameWithoutExt, platform);
      }
    } catch (e) {
      // Fall through to default
    }
  }

  // Default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
