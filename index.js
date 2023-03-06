import {mkdirSync, rmSync} from "fs";
import {FontAssetType, generateFonts, OtherAssetType} from "fantasticon";

rmSync("./dist", { recursive: true, force: true });

for (const size of [12, 16, 24]) {
    const inRoot = `./icons/${size}`;
    const outRoot = `./dist/octicons-${size}`;
    const fontRoot = `${outRoot}/fonts`;
    mkdirSync(fontRoot, { recursive: true });
    generateFonts({
        name: "octicons",
        inputDir: inRoot,
        outputDir: outRoot,
        fontTypes: [
            FontAssetType.EOT,
            FontAssetType.WOFF2,
            FontAssetType.WOFF
        ],
        assetTypes: [ OtherAssetType.CSS ],
        templates: {
            css: "./octicons.css.hbs"
        },
        pathOptions: {
            woff: `${fontRoot}/octicons.woff`,
            woff2: `${fontRoot}/octicons.woff2`,
            eot: `${fontRoot}/octicons.eot`,
        },
        fontHeight: 300,
        round: undefined,
        descent: undefined,
        normalize: true,
        selector: null,
        tag: "i",
        prefix: "octicon",
        fontsUrl: "./fonts"
    }).then(({ writeResults, assetsOut }) => {
        console.debug(writeResults);
        console.debug(assetsOut);
    });
}