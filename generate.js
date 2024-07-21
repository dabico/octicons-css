import CleanCSS from "clean-css";
import { mkdir, writeFile } from "node:fs/promises";
import { FontAssetType, OtherAssetType, generateFonts } from "fantasticon";

const fontOptions = {
    tag: "i",
    name: "octicons",
    prefix: "octicon",
    fontsUrl: "./fonts",
    fontHeight: 300,
    fontTypes: [FontAssetType.EOT, FontAssetType.WOFF2, FontAssetType.WOFF],
    assetTypes: [OtherAssetType.CSS],
    templates: { css: "./octicons.css.hbs" },
    normalize: true,
    round: undefined,
    descent: undefined,
    selector: null,
};

async function generateCSS() {
    const fontRoot = "./fonts";
    await mkdir(fontRoot, { recursive: true });
    await generateFonts({
        inputDir: "./node_modules/@primer/octicons/build/svg",
        outputDir: ".",
        pathOptions: {
            woff: `${fontRoot}/octicons.woff`,
            woff2: `${fontRoot}/octicons.woff2`,
            eot: `${fontRoot}/octicons.eot`,
        },
        ...fontOptions,
    });
}

async function minimizeCSS() {
    const result = await new CleanCSS({ returnPromise: true }).minify(["./octicons.css"]);
    await writeFile("./octicons.min.css", result.styles, { flag: "w+" });
}

Promise.resolve().then(generateCSS).then(minimizeCSS);
