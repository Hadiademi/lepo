/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx", "cn", "cva", "tw"],
};

export default config;
