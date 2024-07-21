import js from "@eslint/js";
import globals from "globals";
import recommendedConfig from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";

const { rules: prettierRules } = eslintConfigPrettier;
const prettierConfigsRecommended = recommendedConfig;
const {
    configs: { recommended: jsConfigsRecommended },
} = js;

export default [
    jsConfigsRecommended,
    prettierConfigsRecommended,
    {
        files: ["**/*.js", "octicons-css"],
        languageOptions: {
            sourceType: "module",
            ecmaVersion: 2024,
            globals: {
                ...globals.node,
                ...globals.es2024,
            },
        },
        rules: {
            ...prettierRules,
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
];
