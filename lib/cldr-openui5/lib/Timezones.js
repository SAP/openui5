import fs from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sTimezonesPath = join(__dirname, "../../..", "src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js");
const sTimezoneUtilsPath = join(__dirname, "../../..", "src/sap.ui.core/src/sap/base/i18n/date/TimezoneUtils.js");
const sBCP47TimezonesPath = join(__dirname, "../../..", "tmp/cldr/cldr-bcp47/bcp47/timezone.json");

/**
 * Generator for updating the timezones in: openui5/src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js
 */
export default class Timezones {
	sFileContent;
	// Whether the logging of deprecated timezones has been done
	#bDeprecatedTimezonesLogged;

	/**
	 * Deletes unsupported time zone IDs from the given time zone names object recursively.
	 * Every deleted time zone ID is added to the deprecated time zones set and logged once after completion.
	 *
	 * @param {Object<string, any>} oCurrentTimezones The given time zone names reference object
	 */
	deleteUnsupportedTimezoneNames(oCurrentTimezones) {
		const oDeprecatedTimezones = new Set();

		this._deleteUnsupportedTimezoneNames(oCurrentTimezones, oDeprecatedTimezones);

		if (!this.#bDeprecatedTimezonesLogged && oDeprecatedTimezones.size > 0) {
			console.log("INFO: Deleted deprecated timezone translations: "
				+ Array.from(oDeprecatedTimezones).join(", "));
		}
		this.#bDeprecatedTimezonesLogged = true;
	}

	/**
	 * Deletes unsupported time zone IDs from the given time zone names object recursively.
	 *
	 * @param {Object<string, any>} oCurrentTimezones The given time zone names reference object
	 * @param {Set<string>} oDeprecatedTimezones The set to add the deleted time zone IDs to
	 * @param {string} [sPrefix=""] The prefix for the current time zone ID
	 */
	_deleteUnsupportedTimezoneNames(oCurrentTimezones, oDeprecatedTimezones, sPrefix = "") {
		Object.keys(oCurrentTimezones).forEach((sKey) => {
			if (typeof oCurrentTimezones[sKey] !== "string") {
				this._deleteUnsupportedTimezoneNames(
					oCurrentTimezones[sKey], oDeprecatedTimezones, sPrefix + sKey + "/");
			} else {
				const sCurrentTimezoneID = sPrefix + sKey;
				if (!this.isTimezoneSupported(sCurrentTimezoneID) && sCurrentTimezoneID !== "Etc/Universal") {
					oDeprecatedTimezones.add(sCurrentTimezoneID);
					delete oCurrentTimezones[sKey];
				}
			}
		});
	}

	/**
	 * Loads the BCP47 timezones package and creates two instance attributes:
	 * <ul>
	 *   <li><code>aSupportedTimezones</code>: Contains the array of not deprecated CLDR time zone IDs</li>
	 *   <li><code>mAlias2SupportedTz</code>: Maps each alias from the BCP47 data to the corresponding not deprecated
	 *     CLDR time zone ID</li>
	 * </ul>
	 */
	async loadBCP47Timezones() {
		const oBCP47Timezones = JSON.parse(await fs.readFile(sBCP47TimezonesPath, "utf8")).keyword.u.tz;
		this.aSupportedTimezones = [];
		this.mAlias2SupportedTz = {};
		Object.keys(oBCP47Timezones).forEach((sKey) => {
			if (sKey.startsWith("_")) {
				return;
			}
			const oBCPTimezoneInfo = oBCP47Timezones[sKey];
			if (!oBCPTimezoneInfo._alias) {
				if (!oBCPTimezoneInfo._deprecated) {
					console.log(`ERROR: BCP47 timezone with key '${sKey}' has no _alias and is not deprecated`);
				}
				return;
			}
			const aAliases = oBCPTimezoneInfo._alias.split(" ");
			const sCLDRTimezone = aAliases[0];
			if (sCLDRTimezone === "Etc/Unknown") {
				return;
			}
			this.aSupportedTimezones.push(sCLDRTimezone);
			// add also the first timezone ID to have a complete list of BCP47 time zone IDs
			aAliases.forEach((sAlias) => {
				this.mAlias2SupportedTz[sAlias] = sCLDRTimezone;
			});
		});
	}

	/**
	 * Returns an object which maps a supported CLDR time zone ID to the corresponding ABAP timezone ID.
	 * The map is remembered as the <code>mCLDR2ABAPTimezones</code> attribute of this instance.
	 *
	 * @returns {Object<string, string>}
	 *   An object which maps a supported CLDR time zone ID to the corresponding ABAP timezone ID
	 */
	getCLDR2ABAPTimezoneMapping() {
		if (!this.mCLDR2ABAPTimezones) {
			const aNotInABAP = this.aSupportedTimezones
				.filter((sTimezoneID) => !this.aABAPTimezoneIDs.includes(sTimezoneID));
			const aNotInCLDR = this.aABAPTimezoneIDs
				.filter((sTimezoneID) => !this.aSupportedTimezones.includes(sTimezoneID));
			this.mCLDR2ABAPTimezones = {};
			aNotInABAP.forEach((sCLDRTimezoneID) => {
				const sMatchingABAPTimezoneID = aNotInCLDR
					.find((sABAPTimezoneID) => this.mAlias2SupportedTz[sABAPTimezoneID] === sCLDRTimezoneID);
				if (!sMatchingABAPTimezoneID) {
					console.log(`WARNING: No matching ABAP timezone found for CLDR timezone '${sCLDRTimezoneID}'`);
					return;
				}
				this.mCLDR2ABAPTimezones[sCLDRTimezoneID] = sMatchingABAPTimezoneID;
			});
		}

		return this.mCLDR2ABAPTimezones;
	}

	/**
	 * Determines whether the given time zone ID is supported.
	 *
	 * @param {string} sTimezoneID The timezone ID to be checked
	 *
	 * @returns {boolean} Whether the given ID is supported
	 */
	isTimezoneSupported(sTimezoneID) {
		if (!this.oSupportedABAPTimezoneIDs) {
			const mCLDR2ABAPTimezones = this.getCLDR2ABAPTimezoneMapping();
			this.oSupportedABAPTimezoneIDs = new Set(this.aSupportedTimezones.map(
				(sCLDRTimezone) => mCLDR2ABAPTimezones[sCLDRTimezone] || sCLDRTimezone));
		}

		return this.oSupportedABAPTimezoneIDs.has(sTimezoneID);
	}

	/**
	 * Loads the _timezones.js and the TimezoneUtils.js files.
	 */
	async loadTimezonesFiles() {
		this.sFileContent = await fs.readFile(sTimezonesPath, "utf8");
		this.sUtilsFileContent = await fs.readFile(sTimezoneUtilsPath, "utf8");
		await this.loadBCP47Timezones();
	}

	/**
	 * Updates the current CLDR timezones in the <code>_timeszones.js</code> with data from a local
	 * <code>BCP 47</code> package of the CLDR data.
	 *
	 * @param {string} sCLDRVersion The currently used CLDR version
	 */
	processCLDRTimezonesArray(sCLDRVersion) {
		this.updateCLDRVersion(sCLDRVersion);
		this.updateArray("aCLDRTimezoneIDs", this.aSupportedTimezones);
		console.log("DONE, the aCLDRTimezoneIDs in the _timezones.js file has been updated");
	}

	/**
	 * Updates the current ABAP timezones in the <code>_timeszones.js</code> with data from a local
	 * <code>ABAPTz.json</code> file, which have to be placed in directory <code>openui5/tmp/cldr/</code>.
	 * The JSON file has to be created manually before running the <code>npm run generate-cldr</code> command.
	 * The resulting array is remembered as the <code>aABAPTimezoneIDs</code> attribute of this instance, and
	 * is eventually written back to the <code>_timezones.js</code> file.
	 *
	 * @throws {Error} If the <code>ABAPTz.json</code> file is older than 7 days
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
		this.aABAPTimezoneIDs = oABAPTzJson.d.results.map((o) => o.value);
		this.updateArray("aABAPTimezoneIDs", this.aABAPTimezoneIDs);
		console.log("DONE, the aABAPTimezonesIDs in the _timezones.js file has been updated");
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
	 * Updates the CLDR version of the <code>aCLDRTimezoneIDs</code> array in the <code>_timezones.js</code> file with
	 * the configured version in the <code>cli.js</code> file.
	 *
	 * @param {string} sCLDRVersion The currently used CLDR version
	 */
	updateCLDRVersion(sCLDRVersion) {
		this.sFileContent = this.sFileContent.replace(/CLDR \d+\.\d+\.\d+/, `CLDR ${sCLDRVersion}`);
	}

	/**
	 * Loads the <code>_timezones.js</code> and <code>TimezoneUtils.js</code> file contents, and
	 * updates the <code>aABAPTimezoneIDs and aCLDRTimezoneIDs</code> arrays in the
	 * <code>_timezones.js</code>, and the <code>mTimezoneAliases2ABAPTimezones</code> in the
	 * <code>TimezoneUtils.js</code> contents.
	 * To write the updated contents back to the actual files, call <code>#writeTimezonesFiles</code>.
	 *
	 * @param {string} sCLDRVersion The currently used CLDR version
	 *
	 * @throws {Error} If the <code>ABAPTz.json</code> file is older than 7 days
	 */
	async updateTimezones(sCLDRVersion) {
		await this.loadTimezonesFiles();
		await this.processABAPTimezonesArray();
		this.processCLDRTimezonesArray(sCLDRVersion);
		this.updateTimezonesMap();
	}

	/**
	 * Updates the <code>mTimezoneAliases2ABAPTimezones</code> map in the loaded <code>TimezoneUtils.js</code>
	 * file content.
	 */
	updateTimezonesMap() {
		const sMapAnchor = "TimezoneUtils.mTimezoneAliases2ABAPTimezones = ";
		const iMapStart = this.sUtilsFileContent.indexOf(sMapAnchor);
		const iMapEnd = this.sUtilsFileContent.indexOf(";", iMapStart);

		const mCLDR2ABAPTimezoneMapping = this.getCLDR2ABAPTimezoneMapping();
		const mAlias2SupportedTz = this.mAlias2SupportedTz;
		const mResult = {};
		Object.keys(mAlias2SupportedTz).sort().forEach((sAlias) => {
			const sCLDRTimezone = mAlias2SupportedTz[sAlias];
			const sABAPTimezoneID = mCLDR2ABAPTimezoneMapping[sCLDRTimezone] || sCLDRTimezone;
			// "Etc/Universal" is still used by ABAP, and a translation is generated for it, and it is a valid
			// alias for "Etc/UTC" in the BCP47 data -> do not add it to the map.
			if (sAlias !== sABAPTimezoneID && sAlias !== "Etc/Universal") {
				mResult[sAlias] = sABAPTimezoneID;
			}
		});
		this.sUtilsFileContent = this.sUtilsFileContent.replace(
			this.sUtilsFileContent.slice(iMapStart, iMapEnd),
			sMapAnchor + JSON.stringify(mResult, null, "\t").replace(/\n/g, "\n\t"));
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
