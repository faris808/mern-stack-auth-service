// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            "dist",
            "node_modules",
            "eslint.config.mjs",
            "jest.config.js",
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-misused-promises": "off",
        },
    },
);
