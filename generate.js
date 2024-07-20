const fs = require("node:fs/promises");
const CleanCSS = require("clean-css");
const { Presets, SingleBar } = require("cli-progress");
const { FontAssetType, OtherAssetType, generateFonts } = require("fantasticon");

const defaultFontConfig = {
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

async function cleanup(...dirs) {
    console.info("Cleaning up directories...");
    const options = { hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}" };
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(dirs.length, 0);
    await Promise.all(
        dirs.map(async (dir) => {
            const options = { recursive: true, force: true };
            await fs.rm(`./${dir}`, options);
            progressbar.increment();
        }),
    );
    progressbar.stop();
}

async function generateCSS() {
    await fs.mkdir("./fonts", { recursive: true });
    console.info("Generating CSS stylesheet...");
    const options = { hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s" };
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(1, 0);
    const inRoot = "./node_modules/@primer/octicons/build/svg";
    const outRoot = ".";
    const fontRoot = `${outRoot}/fonts`;
    await generateFonts({
        inputDir: inRoot,
        outputDir: outRoot,
        pathOptions: {
            woff: `${fontRoot}/octicons.woff`,
            woff2: `${fontRoot}/octicons.woff2`,
            eot: `${fontRoot}/octicons.eot`,
        },
        ...defaultFontConfig,
    });
    progressbar.increment();
    progressbar.stop();
}

async function minimizeCSS() {
    console.info("Minimizing CSS stylesheet...");
    const options = { hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s" };
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(1, 0);
    const result = await new CleanCSS({ returnPromise: true }).minify(["./octicons.css"]);
    await fs.writeFile("./octicons.min.css", result.styles, { flag: "w+" });
    progressbar.increment();
    progressbar.stop();
}

Promise.resolve()
    .then(() => cleanup("fonts", "octicons.css", "octicons.min.css"))
    .then(() => generateCSS())
    .then(() => minimizeCSS());
