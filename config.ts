import path from "path";
export type UserConfig =
  | {
      disable?: boolean;
      root?: string;
      packageJSONFile?: string;
      nodeModulesDir?: string;
      includes?: string[];
      excludes?: string[];
      CDN?:
        | string
        | {
            main: string;
            alternative?: string;
          };
    }
  | undefined;

export type PluginConfig = Required<Exclude<UserConfig, undefined>> & {
  CDN: {
    main: string;
    alternative: string;
  };
};

const MAIN_ESM_CDN = "https://esm.run";
const ALTERNATIVE_ESM_CDN = "https://esm.sh";
export const resolveConfigs = (userConfig: UserConfig): PluginConfig => {
  userConfig = userConfig || {};
  if (userConfig.disable === undefined) {
    userConfig.disable = false;
  }

  if (userConfig.root === undefined) {
    userConfig.root = process.cwd();
  }

  if (userConfig.packageJSONFile === undefined) {
    userConfig.packageJSONFile = path.join(userConfig.root, "package.json");
  }

  if (userConfig.nodeModulesDir === undefined) {
    userConfig.nodeModulesDir = path.join(userConfig.root, "node_modules");
  }

  if (userConfig.includes === undefined) {
    userConfig.includes = [];
  }

  if (userConfig.excludes === undefined) {
    userConfig.excludes = [];
  }

  if (userConfig.CDN === undefined) {
    userConfig.CDN = {
      main: MAIN_ESM_CDN,
      alternative: ALTERNATIVE_ESM_CDN,
    };
  } else if (typeof userConfig.CDN === "string") {
    userConfig.CDN = {
      main: userConfig.CDN,
      alternative: ALTERNATIVE_ESM_CDN,
    };
  } else {
    if (userConfig.CDN.main === undefined) {
      userConfig.CDN.main = MAIN_ESM_CDN;
    }

    if (userConfig.CDN.alternative === undefined) {
      userConfig.CDN.alternative = ALTERNATIVE_ESM_CDN;
    }
  }

  return userConfig as PluginConfig;
};
