const {
    configs: { recommended: jsConfigRecommended },
} = require("@eslint/js");
const { node, es2024 } = require("globals");
const esLintConfigPrettier = require("eslint-config-prettier");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = [
    jsConfigRecommended,
    prettierRecommended,
    esLintConfigPrettier,
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            ecmaVersion: 2024,
            globals: { ...node, ...es2024 },
        },
        rules: {
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
