import { Plugin, UserConfig } from "vite";

import { flattenId, getSpecificDepVersions } from "./dependency.js";
import { resolveConfigs } from "./config.js";
import Optimizer from "./optimizer.js";

const bareImportRE = /^[\w@](?!.*:\/\/)/;

const externalESM = (userConfig: UserConfig): Plugin => {
  const pluginConfig = resolveConfigs(userConfig);
  const flattenDeps = getSpecificDepVersions(
    pluginConfig.packageJSONFile,
    pluginConfig.nodeModulesDir
  );

  const {
    CDN: { main: mainESMCDN },
  } = pluginConfig;

  return {
    name: "external-deps",
    config(config, env) {
      Optimizer.create(config);
    },
    apply() {
      return !pluginConfig.disable;
    },
    async resolveId(id, importer) {
      if (bareImportRE.test(id) && importer) {
        const [depName, version] = flattenDeps[flattenId(id)];
        if (!version) {
          return null;
        }

        return {
          external: true,
          id: `${mainESMCDN}/${depName}@${version}`,
        };
      }

      return null;
    },
    enforce: "pre",
  };
};

export default externalESM;
