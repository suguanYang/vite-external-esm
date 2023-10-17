import path from "path";

import semver from "semver";

export const flattenId = (id: string): string =>
  id
    .replace(/[\/:]/g, "_")
    .replace(/[\.]/g, "__")
    .replace(/(\s*>\s*)/g, "___");

const tryResolveDepPackageJSON = (
  id: string,
  nodeModulesDir: string
): string | undefined => {
  // resolve from node runtime
  try {
    return require(path.join(
      path.dirname(require.resolve(id)),
      "./package.json"
    )).version;
  } catch (error) {}

  // resolve from node_modules
  try {
    return require(path.join(
      require.resolve(id, {
        paths: [nodeModulesDir],
      }),
      "./package.json"
    )).version;
  } catch (error) {}
};

export const getSpecificDepVersions = (
  packageJSONFile: string,
  nodeModulesDir: string
) => {
  const deps: {
    [key: string]: string;
  } = require(packageJSONFile).dependencies;

  const flattenDepVersions: {
    [key: string]: [string, string];
  } = Object.keys(deps).reduce((acc, depName) => {
    let specificVersion = tryResolveDepPackageJSON(depName, nodeModulesDir);

    if (!specificVersion) {
      console.warn(
        `Cannot resolve ${depName}'s version from package.json, fallback to minimal semver version.`
      );
      specificVersion = semver.minVersion(deps[depName])?.version;
    }

    return {
      ...acc,
      [flattenId(depName)]: [depName, specificVersion],
    };
  }, {});

  return flattenDepVersions;
};
