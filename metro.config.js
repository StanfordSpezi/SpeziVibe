const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '.');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Configure resolver for monorepo - resolve to source files directly
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Resolve workspace packages to their source files instead of dist
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if it's a workspace package
  if (moduleName.startsWith('@spezivibe/')) {
    const packageName = moduleName.split('/')[1];
    const packagePath = path.join(workspaceRoot, 'packages', packageName);

    // Check if the package exists
    const fs = require('fs');
    if (fs.existsSync(packagePath)) {
      // Resolve to the source index file
      const sourceIndex = path.join(packagePath, 'src', 'index.ts');
      if (fs.existsSync(sourceIndex)) {
        return {
          filePath: sourceIndex,
          type: 'sourceFile',
        };
      }
      // Fallback to tsx if ts doesn't exist
      const sourceIndexTsx = path.join(packagePath, 'src', 'index.tsx');
      if (fs.existsSync(sourceIndexTsx)) {
        return {
          filePath: sourceIndexTsx,
          type: 'sourceFile',
        };
      }
    }
  }

  // Fallback to default resolution by returning null
  return null;
};

module.exports = config;
