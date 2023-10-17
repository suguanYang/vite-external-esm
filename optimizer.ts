import { DepsOptimizer, InlineConfig, OptimizedDepInfo } from "vite";

class Optimizer {
  public processing?: Promise<any>;
  private opt?: DepsOptimizer;

  constructor() {}

  static create(config: InlineConfig) {
    // Hacking
    const optimizer = new Optimizer();
    const originSet = WeakMap.prototype.set;
    WeakMap.prototype.set = function (key: any, val: DepsOptimizer) {
      const weakMapInstance = this;

      if (
        key?.root === config.root &&
        key?.plugins?.some((p: any) => p.name === "vite-plugin-externals") &&
        val?.metadata?.hash
      ) {
        optimizer.opt = val;
        optimizer.opt.registerMissingImport = optimizer.registerMissingImport;
      }

      return originSet.bind(weakMapInstance)(key, val);
    };
  }

  // controll the vite behavior
  private registerMissingImport = (id: string, resolved: string) => {
    const optimized = this.opt!.metadata.optimized[id];
    if (optimized) {
      return optimized;
    }
    const chunk = this.opt!.metadata.chunks[id];
    if (chunk) {
      return chunk;
    }
    const discovered = this.opt!.metadata.discovered[id];
    if (discovered) {
      return discovered;
    }

    const promising = Promise.resolve({
      exports: [],
      hasImports: false, // this can indicate vite
    });
    const missing: OptimizedDepInfo = {
      id,
      file: resolved,
      src: resolved,
      browserHash: "",
      processing: promising.then(() => void 0),
      exportsData: promising,
    };
    this.opt?.metadata.depInfoList.push(missing);
    return missing;
  };
}

export default Optimizer;
