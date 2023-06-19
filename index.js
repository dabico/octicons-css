const fs = require("node:fs/promises");
const axios = require("axios");
const retry = require("axios-retry");
const ghls = require("list-github-dir-content");
const {Presets, SingleBar} = require("cli-progress");
const {FontAssetType, OtherAssetType, generateFonts} = require("fantasticon");

const defaultFontConfig = {
    tag: "i",
    name: "octicons",
    prefix: "octicon",
    fontsUrl: "./fonts",
    fontHeight: 300,
    fontTypes: [
        FontAssetType.EOT,
        FontAssetType.WOFF2,
        FontAssetType.WOFF
    ],
    assetTypes: [ OtherAssetType.CSS ],
    templates: {
        css: "./octicons.css.hbs"
    },
    normalize: true,
    round: undefined,
    descent: undefined,
    selector: null,
};

async function setup() {
    const config = {retries: 5, retryDelay: retry.exponentialDelay};
    retry(axios, config);
}

async function cleanup(...dirs) {
    console.info("Cleaning up directories...");
    const options = {hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}"};
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(dirs.length, 0);
    await Promise.all(
        dirs.map(async dir => {
            const options = {recursive: true, force: true};
            await fs.rm(`./${dir}`, options);
            progressbar.increment();
        })
    );
    progressbar.stop();
}

async function downloadIcons() {
    const [_, files] = await Promise.all([
        fs.mkdir("./icons"),
        ghls.viaTreeApi({
            user: "primer",
            repository: "octicons",
            directory: "icons",
        }),
    ]);

    console.info("Downloading icon SVGs...");
    const options = {hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}"};
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(files.length, 0);
    await Promise.all(
        files.map(async svg => {
            const base = "https://raw.githubusercontent.com/primer/octicons/main";
            const config = {responseType: "arraybuffer", timeout: 10 * 1000};
            const response = await axios.get(`${base}/${svg}`, config);
            const buffer = Buffer.from(response.data);
            await fs.writeFile(`./${svg}`, buffer);
            progressbar.increment();
        })
    );
    progressbar.stop();
}

async function generateCSS() {
    await fs.mkdir("./octicons/fonts", {recursive: true});
    console.info("Generating CSS stylesheet...");
    const options = {hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s"};
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(1, 0);
    const inRoot = "./icons";
    const outRoot = "./octicons";
    const fontRoot = `${outRoot}/fonts`;
    await generateFonts({
        inputDir: inRoot,
        outputDir: outRoot,
        pathOptions: {
            woff: `${fontRoot}/octicons.woff`,
            woff2: `${fontRoot}/octicons.woff2`,
            eot: `${fontRoot}/octicons.eot`,
        },
        ...defaultFontConfig
    });
    progressbar.increment();
    progressbar.stop();
}

Promise.resolve()
    .then(() => setup())
    .then(() => cleanup("octicons", "icons"))
    .then(() => downloadIcons())
    .then(() => generateCSS())
    .then(() => cleanup("icons"));
