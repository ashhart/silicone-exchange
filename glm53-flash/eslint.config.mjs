import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version: reactVersion } = require("react/package.json");

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...typescriptConfig,
  {
    // eslint-plugin-react's "detect" mode calls context.getFilename(), which
    // ESLint 10 removed — pin the version instead. Placed last so it wins
    // the settings merge.
    settings: { react: { version: reactVersion } },
  },
];
export default eslintConfig;
