const typescript = require("@rollup/plugin-typescript");
const pkg = require("./package.json");

export default [
  {
    input: "index.ts",
    external: ["ms"],
    output: [{ file: pkg.main, format: "cjs" }, { file: pkg.module, format: "esm" }],
    plugins: [typescript()],
  },
];
