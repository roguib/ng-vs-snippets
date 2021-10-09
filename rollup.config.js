import typescript from "rollup-plugin-typescript2";
import shebang from "rollup-plugin-add-shebang";

import pkg from "./package.json";

export default [
  {
    input: "src/index.ts",
    output: { format: "cjs", file: `build/${pkg.name}.js` },
    plugins: [
      shebang({
        include: `build/${pkg.name}.js`,
      }),
      typescript({
        typescript: require("typescript"),
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: { format: "cjs", file: `build/${pkg.name}.min.js` },
    plugins: [
      shebang({
        include: `build/${pkg.name}.min.js`,
      }),
      typescript({
        typescript: require("typescript"),
      }),
    ],
  },
];
