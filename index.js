const fs = require("node:fs/promises");
const axios = require("axios");
const retry = require("axios-retry");
const ghls = require("list-github-dir-content");
const {glob} = require("glob");
const {Presets, SingleBar, MultiBar} = require("cli-progress");
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

    const regex = /-(12|16|24)\.svg$/;
    const svgs = files.filter(file => regex.test(file));

    console.info("Downloading icon SVGs...");
    const options = {hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}"};
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(svgs.length, 0);
    await Promise.all(
        svgs.map(async svg => {
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

async function organizeIcons(...sizes) {
    await Promise.all(
        sizes.map(async size => fs.mkdir(`./icons/${size}`, {recursive: true}))
    );
    console.info("Grouping icons into size categories...");
    const options = {hideCursor: true, format: "{bar} {size}px icons | {value}/{total}"};
    const multibar = new MultiBar(options, Presets.shades_classic);
    const buckets = await Promise.all(
        sizes.map(async size => {
            const files = await glob(`icons/*-${size}.svg`);
            const count = files.length;
            const bar = multibar.create(count, 0, {size: size});
            return [files, size, bar];
        })
    );
    await Promise.all(
        buckets.map(async ([files, size, bar]) => {
            await Promise.all(
                files.map(async file => {
                    const [_, name] = file.split("/");
                    await fs.rename(file, `./icons/${size}/${name}`);
                    bar.increment();
                })
            );
        })
    );
    multibar.stop();
}

async function generateCSS(...sizes) {
    await Promise.all(
        sizes.map(async size => fs.mkdir(`./octicons/octicons-${size}/fonts`, {recursive: true}))
    );
    console.info("Generating CSS stylesheets...");
    const options = {hideCursor: true, format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}"};
    const progressbar = new SingleBar(options, Presets.shades_classic);
    progressbar.start(sizes.length, 0);
    await Promise.all(
        sizes.map(async size => {
            const inRoot = `./icons/${size}`;
            const outRoot = `./octicons/octicons-${size}`;
            const fontRoot = `${outRoot}/fonts`;
            const options = {
                inputDir: inRoot,
                outputDir: outRoot,
                pathOptions: {
                    woff: `${fontRoot}/octicons.woff`,
                    woff2: `${fontRoot}/octicons.woff2`,
                    eot: `${fontRoot}/octicons.eot`,
                },
                ...defaultFontConfig
            };
            await generateFonts(options);
            progressbar.increment();
        })
    );
    progressbar.stop();
}

Promise.resolve()
    .then(() => setup())
    .then(() => cleanup("octicons", "icons"))
    .then(() => downloadIcons())
    .then(() => organizeIcons(12, 16, 24))
    .then(() => generateCSS(12, 16, 24))
    .then(() => cleanup("icons"));
