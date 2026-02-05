import prettierConfig from "eslint-config-prettier";
import promisePlugin from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslintJs from "@eslint/js";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslintJs.configs.recommended,
    allConfig: eslintJs.configs.all,
});

export default [
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/.yarn/**",
            "**/build/**",
            "**/coverage/**",
            "**/*.log",
            ".eslintcache",
            "eslint.config.mjs",
            "vitest.config.ts",
        ],
    },
    // Bring in legacy shareable configs via compat so we can still use plugin: style strings
    ...fixupConfigRules(
        compat.extends(
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:react/jsx-runtime",
            "plugin:@typescript-eslint/recommended",
            "plugin:react-hooks/recommended",
            "plugin:import/typescript",
            "plugin:import/recommended",
            "plugin:promise/recommended",
        ),
    ),
    {
        plugins: {
            react: fixupPluginRules(reactPlugin),
            "@typescript-eslint": fixupPluginRules(typescriptEslintPlugin),
            "unused-imports": unusedImports,
            "simple-import-sort": simpleImportSort,
            promise: fixupPluginRules(promisePlugin),
        },
        languageOptions: {
            globals: { ...globals.browser },
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: { jsx: true },
                projectService: {
                    allowDefaultProject: ["*.js", "*.mjs", "scripts/*.mjs"],
                    defaultProject: "./tsconfig.json",
                },
                tsconfigRootDir: __dirname,
            },
        },
        settings: { react: { version: "detect" } },
        rules: {
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double", { avoidEscape: true }],
            semi: ["error", "always"],
            "@typescript-eslint/explicit-member-accessibility": ["error"],
            "@typescript-eslint/member-ordering": "off",
            "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0 }],
            "no-multi-spaces": ["error"],
            "key-spacing": ["error", { beforeColon: false, afterColon: true }],
            "no-trailing-spaces": ["error"],
            "space-infix-ops": ["error"],
            "comma-spacing": ["error", { before: false, after: true }],
            "arrow-spacing": ["error", { before: true, after: true }],
            "comma-dangle": ["error", "always-multiline"],
            curly: ["error", "multi-line", "consistent"],
            "nonblock-statement-body-position": ["error", "beside"],
            "space-before-blocks": ["error", "always"],
            "no-else-return": ["error"],
            "keyword-spacing": ["error", { before: true, after: true }],
            "unused-imports/no-unused-imports": "error",
            "react/no-array-index-key": "error",
            "import/first": "error",
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",
            "import/no-unresolved": "off", // handled by TS
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    disallowTypeAnnotations: false,
                    fixStyle: "separate-type-imports",
                },
            ],
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^\\u0000", "^\\w", "^@?\\w", "^", "^\\.", ".css$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "max-lines": [
                "error",
                { max: 600, skipBlankLines: true, skipComments: true },
            ],
            "no-warning-comments": [
                "warn",
                {
                    terms: ["hack", "fixme", "workaround", "todo"],
                    location: "anywhere",
                },
            ],
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/consistent-type-assertions": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "default",
                    format: ["camelCase"],
                    leadingUnderscore: "allow",
                    trailingUnderscore: "allow",
                },
                { selector: "enumMember", format: ["UPPER_CASE"] },
                { selector: "objectLiteralProperty", format: ["camelCase", "UPPER_CASE"] },
                { selector: "typeLike", format: ["PascalCase"] },
                {
                    selector: "variable",
                    types: ["boolean"],
                    format: ["PascalCase"],
                    prefix: [
                        "is",
                        "has",
                        "can",
                        "should",
                        "will",
                        "did",
                        "was",
                    ],
                },
                {
                    selector: "variable",
                    modifiers: ["const"],
                    format: ["camelCase", "UPPER_CASE", "PascalCase"],
                    leadingUnderscore: "allow",
                },
                { selector: "function", format: ["camelCase", "PascalCase"] },
            ],
            "no-implicit-coercion": [
                "error",
                { boolean: true, number: true, string: true, allow: [] },
            ],
            "no-magic-numbers": "off",
            "@typescript-eslint/no-magic-numbers": [
                "error",
                {
                    ignore: [-1, 0, 1, 2, 3, 4, 5, 10, 100, 1000],
                    ignoreArrayIndexes: true,
                    ignoreEnums: true,
                    ignoreNumericLiteralTypes: true,
                    ignoreReadonlyClassProperties: true,
                },
            ],
            "no-useless-rename": "error",
            "max-lines-per-function": [
                "error",
                {
                    max: 120,
                    skipBlankLines: true,
                    skipComments: true,
                    IIFEs: true,
                },
            ],
            "no-empty": ["error", { allowEmptyCatch: false }],
        },
    },
    {
        files: ["**/*.test.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "@typescript-eslint/explicit-member-accessibility": "off",
            "@typescript-eslint/consistent-type-imports": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-implicit-coercion": "off",
            "no-magic-numbers": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "simple-import-sort/imports": "off",
            "simple-import-sort/exports": "off",
            "import/first": "off",
            "import/newline-after-import": "off",
            "import/no-duplicates": "off",
            "react/no-array-index-key": "off",
            "no-implied-eval": "off",
        },
    },
    {
        files: ["scripts/**/*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-magic-numbers": "off",
        },
    },
    prettierConfig,
];
