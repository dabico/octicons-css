const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        files: [ "**/*.js" ],
        languageOptions: {
            sourceType: "commonjs",
            ecmaVersion: 2024,
            globals: {
                ...globals.node,
                ...globals.es2024,
            }
        },
        rules: {
            "semi": ["error", "always"],
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "linebreak-style": ["error", "unix"],
            "no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
            }],
        }
    },
];
