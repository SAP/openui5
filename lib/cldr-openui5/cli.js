import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pacote from "pacote";
import CLDR from "./lib/CLDR.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_FOLDER = join(__dirname, "../../");
const CLDR_VERSION = "46.1.0";
const DOWNLOAD_FOLDER = join(BASE_FOLDER, "tmp/cldr");
const EXPORT_FOLDER = join(BASE_FOLDER, "src/sap.ui.core/src/sap/ui/core/cldr");

function download() {
	const aPackages = [
		"cldr-bcp47",
		"cldr-core",
		"cldr-numbers-full",
		"cldr-dates-full",
		"cldr-misc-full",
		"cldr-units-full",
		"cldr-localenames-full",
		"cldr-cal-islamic-full",
		"cldr-cal-japanese-full",
		"cldr-cal-persian-full",
		"cldr-cal-buddhist-full"
	];

	return Promise.all(aPackages.map(function(sName) {
		return pacote.extract(sName + "@" + CLDR_VERSION, join(DOWNLOAD_FOLDER, sName));
	})).then(function() {
		console.log("DONE", "Files downloaded and extracted to", DOWNLOAD_FOLDER);
	}, function(err) {
		console.error(err);
	});
}

function generate() {
	const iStart = Date.now();
	new CLDR({
		source: DOWNLOAD_FOLDER,
		output: EXPORT_FOLDER,
		version: CLDR_VERSION
	}).on("generated", function() {
		console.log("DONE", "Files saved to", EXPORT_FOLDER);
		console.log(`Generation took ${(Date.now() - iStart) / 1000} seconds`);
	}).on("error", function(err) {
		console.error(err);
	}).start();
}

const aArgs = process.argv.slice(2);
const bDownload = !aArgs.length || aArgs.includes("download");
const bGenerate = !aArgs.length || aArgs.includes("generate");

try {
	if (bDownload) {
		await download();
	}
	if (bGenerate) {
		generate();
	}
} catch (error) {
	console.error(error);
	process.exit(1);
}
