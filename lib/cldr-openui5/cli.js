import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pacote from "pacote";
import CLDR from "./lib/CLDR.js";

const CLDR_VERSION = "43.0.0";
const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_FOLDER = join(__dirname, "../../");
const DOWNLOAD_FOLDER = join(BASE_FOLDER, "tmp/cldr");
const EXPORT_FOLDER = join(BASE_FOLDER, "src/sap.ui.core/src/sap/ui/core/cldr");
const PRETTY_PRINT = true;

function download() {
	const aPackages = [
		"cldr-core",
		"cldr-numbers-modern",
		"cldr-dates-modern",
		"cldr-misc-modern",
		"cldr-units-modern",
		"cldr-localenames-modern",
		"cldr-cal-islamic-modern",
		"cldr-cal-japanese-modern",
		"cldr-cal-persian-modern",
		"cldr-cal-buddhist-modern"
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
	new CLDR({
		source: DOWNLOAD_FOLDER,
		output: EXPORT_FOLDER,
		prettyPrint: PRETTY_PRINT,
		version: CLDR_VERSION
	}).on("generated", function() {
		console.log("DONE", "Files saved to", EXPORT_FOLDER);
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
