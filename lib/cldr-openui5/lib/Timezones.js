import fs from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sTimezonesPath = join(__dirname, "../../..", "src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js");
const sTimezoneUtilsPath = join(__dirname, "../../..", "src/sap.ui.core/src/sap/base/i18n/date/TimezoneUtils.js");

/**
 * Generator for updating the timezones in: openui5/src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js
 */
export default class Timezones {
	sFileContent;
	pTimezonesReady;
	fnResolveTimezonesReady;

	/**
	 * Class constructor.
	 */
	constructor() {
		this.pTimezonesReady = new Promise((fnResolve) => { this.fnResolveTimezonesReady = fnResolve; });
	}

	/**
	 * Fetches the data from the given <code>sURL</code>.
	 *
	 * @param {string} sURL
	 *   The URL to be fetched
	 * @param {"json"|"text"} sType
	 *   The data type to be fetched ("json" leads to an internal JSON.parse conversion)
	 * @returns {Promise<string|object>}
	 *   A promise resolving with the fetched data
	 */
	async fetchData(sURL, sType) {
		const oResponse = await fetch(sURL);
		const vData = await oResponse[sType]();
		return vData;
	}

	/**
	 * Searches in a given file (<code>sRawData</code>) for time zones and returns them.
	 *
	 * Sample content:
	 *   Zone	Europe/Istanbul	1:55:52 -	LMT	1880
	 *   Link	Europe/Istanbul		Asia/Istanbul
	 * Should result in the following array:
	 *   ["Europe/Istanbul", "Asia/Istanbul"]
	 *
	 * @param {string} sRawData
	 *   The file content containing time zones
	 * @returns {string[]}
	 *   An array of found time zones
	 */
	getTimezonesFromFile(sRawData) {
		const rFindTimeZone = /^Zone\s(\S+)/gm;
		const rResolveLink = /^Link\s\S+\s+(\S+)/gm;
		const aMatches = [...sRawData.matchAll(rFindTimeZone), ...sRawData.matchAll(rResolveLink)];

		return aMatches.map((aMatch) => aMatch[1]);
	}

	/**
	 * Loads the _timezones.js and the TimezoneUtils.js files.
	 */
	async loadTimezonesFiles() {
		this.sFileContent = await fs.readFile(sTimezonesPath, "utf8");
		this.sUtilsFileContent = await fs.readFile(sTimezoneUtilsPath, "utf8");
	}

	/**
	 * Updates the current ABAP timezones in the <code>_timeszones.js</code> with data from a local
	 * <code>ABAPTz.json</code> file, which should be placed in directory <code>openui5/tmp/cldr/</code>.
	 * The JSON file has to be created manually before running the <code>npm run generate-cldr</code> command.
	 */
	async processABAPTimezonesArray() {
		const oDate = new Date();
		const sPath = join(normalize(join(__dirname, "../../../")), "/tmp/cldr/ABAPTz.json");
		const oStats = await fs.stat(sPath);

		if (new Date(oStats.mtime) < oDate.setDate(oDate.getDate() - 7)) {
			throw new Error("The 'ABAPTz.json' file is more than 7 days old."
				+ " Please update the file and run this job again.");
		}

		const oABAPTzJson = JSON.parse(await fs.readFile(sPath));
		this.updateArray("aABAPTimezoneIDs", oABAPTzJson.d.results.map((o) => o.value));
		console.log("DONE, the aABAPTimezonesIDS have been updated");
	}

	/**
	 * Takes care about processing the IANA time zones, see array <code>aTzTimezoneIDs</code>.
	 * Controls the process of (1) loading the time zones and (2) updating the <code>_timezones.js</code> file.
	 */
	async processIanaTimezones() {
		const sVersion = await this.requestLatestIanaTimeZoneVersion();
		const aFilesRawData = await this.requestIanaTimeZoneRawData(sVersion);
		let aTimezones = [];
		aFilesRawData.forEach((sRawData) => {
			const aParsedTimezones = this.getTimezonesFromFile(sRawData);
			aTimezones = aTimezones.concat(aParsedTimezones);
		});
		this.updateArray("aTzTimezoneIDs", aTimezones);
		this.updateIanaVersion(sVersion);
	}

	/**
	 * Waits for <code>updateTimezones</code> to be completed.
	 */
	async ready() {
		await this.pTimezonesReady;
	}

	/**
	 * Fetches the relevant files containing time zone information from Github (eggert/tz).
	 * Relevant files names are:
	 * <ul>
	 *   <li>only lower-case characters</li>
	 *   <li>not the excluded 'backzone'</li>
	 * </ul>
	 *
	 * @param {string} sVersion
	 *   The release version to be downloaded
	 * @returns {Promise<string[]>}
	 *   A promise resolving with an array of the downloaded file content
	 */
	async requestIanaTimeZoneRawData(sVersion) {
		const sRepoContentAPI = `https://api.github.com/repos/eggert/tz/contents/?ref=${sVersion}`;
		const rRelevantFile = /^[a-z]+$/;
		const aFileBlocklist = ["backzone"];
		const aRepoFiles = await this.fetchData(sRepoContentAPI, "json");
		const aDownloadURLs = aRepoFiles
			.filter((oFile) => rRelevantFile.test(oFile.name) && !aFileBlocklist.includes(oFile.name))
			.map((oFile) => oFile.download_url);

		return Promise.all(aDownloadURLs.map((sURL) => this.fetchData(sURL, "text")));
	}

	/**
	 * Fetches the latest release version number from Github (eggert/tz).
	 *
	 * @returns {string}
	 *   The latest IANA tz version number
	 */
	async requestLatestIanaTimeZoneVersion() {
		const sRepoTagsAPI = "https://api.github.com/repos/eggert/tz/git/refs/tags";
		const rVersion = /(\d{4}\w+)$/;
		const aRepoTags = (await this.fetchData(sRepoTagsAPI, "json"))
			.map((oTag) => oTag.ref)
			.filter((sVersion) => rVersion.test(sVersion))
			.sort();

		return rVersion.exec(aRepoTags.at(-1))[0];
	}

	/**
	 * Updates the loaded <code>_timezones.js</code> file content.
	 * For a given array <code>sArrayName</code> the array entries are replaced with the new <code>aItems</code>.
	 *
	 * @param {string} sArrayName
	 *   The array to be modified
	 * @param {string[]} aItems
	 *   The new array items
	 */
	updateArray(sArrayName, aItems) {
		const sArrayAnchor = sArrayName + " = ";
		const iArrayStart = this.sFileContent.indexOf(sArrayAnchor);
		const iArrayEnd = this.sFileContent.indexOf(";", iArrayStart);

		aItems = Array.from(new Set(aItems)).sort();

		this.sFileContent = this.sFileContent.replace(
			this.sFileContent.slice(iArrayStart, iArrayEnd),
			sArrayAnchor + JSON.stringify(aItems, null, "\t").replace(/\n/g, "\n\t"));
	}

	/**
	 * Updates the IANA TZ version to the given <code>sVersion</code>.
	 *
	 * @param {string} sVersion
	 *   The new version
	 */
	updateIanaVersion(sVersion) {
		this.sFileContent = this.sFileContent.replace(
			/Version: tz \d{4}\w+/,
			`Version: tz ${sVersion}`);
	}

	/**
	 * Controls the process of loading the <code>_timezones.js</code> file, updating its information and writing it
	 * back to the file system.
	 *
	 * @param {Object<string, string>} mCLDR2ABAPTimezones The map of ABAP timezone IDs to CLDR timezone IDs.
	 */
	async updateTimezones(mCLDR2ABAPTimezones) {
		await this.loadTimezonesFiles();
		await this.processABAPTimezonesArray();
		await this.processIanaTimezones();
		this.updateTimezonesMap(mCLDR2ABAPTimezones);
		await this.writeTimezonesFiles();
		this.fnResolveTimezonesReady();
	}

	/**
	 * Updates the CLDR to ABAP timezone mapping in the loaded <code>TimezoneUtils.js</code> file content.
	 *
	 * @param {Object<string, string>} mCLDR2ABAPTimezones The map of ABAP timezone IDs to CLDR timezone IDs.
	 */
	updateTimezonesMap(mCLDR2ABAPTimezones) {
		const sMapAnchor = "TimezoneUtils.mCLDR2ABAPTimezones = ";
		const iMapStart = this.sUtilsFileContent.indexOf(sMapAnchor);
		const iMapEnd = this.sUtilsFileContent.indexOf(";", iMapStart);

		const mABAP2CLDRTimezones = {};
		for (const sCLDR_ID in mCLDR2ABAPTimezones) {
			mABAP2CLDRTimezones[mCLDR2ABAPTimezones[sCLDR_ID]] = sCLDR_ID;
		}
		this.sUtilsFileContent = this.sUtilsFileContent.replace(
			this.sUtilsFileContent.slice(iMapStart, iMapEnd),
			sMapAnchor + JSON.stringify(mABAP2CLDRTimezones, null, "\t").replace(/\n/g, "\n\t"));
	}

	/**
	 * Writes the _timezones.js and the TimezoneUtils.js file.
	 */
	async writeTimezonesFiles() {
		await fs.writeFile(sTimezonesPath, this.sFileContent);
		console.log(`DONE, timezones updated: ${sTimezonesPath}`);
		await fs.writeFile(sTimezoneUtilsPath, this.sUtilsFileContent);
		console.log(`DONE, TimezoneUtils updated: ${sTimezoneUtilsPath}`);
	}
}
