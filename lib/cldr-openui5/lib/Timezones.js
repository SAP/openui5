import fs from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sTimezonesPath = join(__dirname, "../../..", "src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js");
const sTimezoneUtilsPath = join(__dirname, "../../..", "src/sap.ui.core/src/sap/base/i18n/date/TimezoneUtils.js");
const sBCP47TimezonesPath = join(__dirname, "../../..", "tmp/cldr/cldr-bcp47/bcp47/timezone.json");
// if a segment of a time zone ID starts with lower case it has to be checked and maybe replaced
const rUnusualTimezoneID = /(^[a-z]|\/[a-z])/;

/**
 * Generator for updating the timezones in: openui5/src/sap.ui.core/test/sap/ui/core/qunit/i18n/helper/_timezones.js
 */
export default class Timezones {
	sFileContent;
	// Whether the logging of deprecated timezones has been done
	#bDeprecatedTimezonesLogged;
	// As of V43 we fill this array with the TZ IDs of the 'ar' locale
	_aCompleteCLDRTimezoneIDs = [];
	// store previous IANA timezone IDs to be able to compare them across all languages
	_aLastTimezoneIDs = [];

	/**
	 * Checks whether all time zone names are unique.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale in which the missing
	 *   time zone names are set
	 * @throws {Error}
	 *   If there are duplicate time zone names.
	 */
	static checkDuplicateTimezoneNames(sCLDRTag, oTimezoneNames) {
		// ensure city names are unique to be able to uniquely format/parse them
		const aTimezoneNames = Timezones.getAllChildValues(oTimezoneNames);
		const aDuplicateTimezoneNames = aTimezoneNames.filter((sTimezoneName, iIndex) => {
			return aTimezoneNames.indexOf(sTimezoneName) !== iIndex;
		});
		if (aDuplicateTimezoneNames.length) {
			throw new Error("'" + sCLDRTag + "' contains duplicate time zone names: "
				+ aDuplicateTimezoneNames.join(", "));
		}
	}

	/**
	 * Checks the <code>timezoneNames</code> property of the currently processed locale for duplicate time zone names
	 * and for unusual time zone IDs, like "London/short/daylight". It logs the respective time zone IDs if they are
	 * considered to be unusual.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale
	 * @throws {Error}
	 *   If there are duplicate time zone names
	 */
	static checkTimezoneNames(sCLDRTag, oTimezoneNames) {
		Timezones.checkDuplicateTimezoneNames(sCLDRTag, oTimezoneNames);
		Timezones.getTimezoneIDs(oTimezoneNames).forEach((sTimezoneID) => {
			if (rUnusualTimezoneID.test(sTimezoneID)) {
				console.log("WARNING: Unusual time zone ID found '" + sTimezoneID + "' for locale '" + sCLDRTag
					+ "', maybe check and replace.");
			}
		});
	}

	/**
	 * Checks whether the time zone names are unique and whether the time zone IDs are as expected
	 * and the IDs for the current locale are the same as for the previous locale.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, object>} oTimezoneNames
	 *   The resulting <code>timezoneNames</code> object of the currently processed locale
	 * @throws {Error}
	 *   If time zones are inconsistent over all languages, or if there are duplicate time zone names
	 */
	checkTimezonesConsistency(sCLDRTag, oTimezoneNames) {
		Timezones.checkTimezoneNames(sCLDRTag, oTimezoneNames);

		const aTimezoneIDs = Timezones.getTimezoneIDs(oTimezoneNames);
		if (this._aLastTimezoneIDs.length !== 0) {
			const aMissingTimezoneIDs = this._aLastTimezoneIDs.filter((sTimezoneId) => {
				return !aTimezoneIDs.includes(sTimezoneId);
			});
			const aUnexpectedTimezoneIDs = aTimezoneIDs.filter((sTimezoneId) => {
				return !this._aLastTimezoneIDs.includes(sTimezoneId);
			});
			if (aMissingTimezoneIDs.length || aUnexpectedTimezoneIDs.length) {
				throw new Error("'" + sCLDRTag + "' has inconsistent time zone IDs; missing IDs: "
					+ aMissingTimezoneIDs + "; unexpected IDs: " + aUnexpectedTimezoneIDs);
			}
		}
		this._aLastTimezoneIDs = aTimezoneIDs;
	}

	/**
	 * Add missing parent relations, fix UTC time zone names, delete unsupported time zone names,
	 * and delete time zone backzone IDs.
	 *
	 * @param {Object<string,any>} oResult The resulting CLDR object for the current locale
	 */
	cleanupTimezoneNames(oResult) {
		const oTerritories = oResult.territories;
		const oTimezoneNames = oResult.timezoneNames;

		// Adjust Etc/UTC values
		oTimezoneNames.Etc.Universal = oTimezoneNames.Etc.UTC.long.standard;
		oTimezoneNames.Etc.UTC = oTimezoneNames.Etc.UTC.short.standard;

		this.deleteUnsupportedTimezoneNames(oTimezoneNames);

		oTimezoneNames.Africa["_parent"] = oTerritories["002"];
		// Argentina is the only sub territory for which the cities do not have the sub territory in their
		// translation therefore provide the territory manually
		oTimezoneNames.America.Argentina["_parent"] = oTerritories.AR;
		// timezone translation data - use "_parent" key for the translation of the top level territories
		oTimezoneNames.America["_parent"] = oTerritories["019"];
		oTimezoneNames.Antarctica["_parent"] = oTerritories.AQ;
		oTimezoneNames.Asia["_parent"] = oTerritories["142"];
		oTimezoneNames.Australia["_parent"] = oTerritories.AU;
		oTimezoneNames.Europe["_parent"] = oTerritories["150"];
	}

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
	 * Gets all values of the leaves in the object structure. Path segments that start with "_" are skipped.
	 *
	 * @param {Object<string, any>} oNode The object to flatten; all leaves have to be of type string
	 * @returns {string[]} The leaves of the object tree
	 */
	static getAllChildValues(oNode) {
		let aResult = [];
		Object.keys(oNode).forEach((sChildKey) => {
			if (typeof oNode[sChildKey] === "object") {
				aResult = aResult.concat(Timezones.getAllChildValues(oNode[sChildKey]));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(oNode[sChildKey]);
			}
		});

		return aResult;
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
	 * Recursively iterates over the given time zone names object and returns a list of time zone IDs.
	 *
	 * @param {Object<string, any>} oTimezoneNamesNode
	 *   The <code>timezoneNames</code> object of the currently processed locale, or a child object in that tree
	 * @param {string} [sTimezoneIDPrefix]
	 *   The time zone ID prefix for the given child object of the time zone names tree
	 * @returns {string[]}
	 *   The list of time zone IDs
	 */
	static getTimezoneIDs(oTimezoneNamesNode, sTimezoneIDPrefix) {
		let aResult = [];
		sTimezoneIDPrefix = sTimezoneIDPrefix || "";
		Object.keys(oTimezoneNamesNode).forEach((sChildKey) => {
			if (typeof oTimezoneNamesNode[sChildKey] === "object") {
				aResult = aResult.concat(
					Timezones.getTimezoneIDs(oTimezoneNamesNode[sChildKey], sTimezoneIDPrefix + sChildKey + "/"));
			} else if (!sChildKey.startsWith("_")) {
				aResult.push(sTimezoneIDPrefix + sChildKey);
			}
		});

		return aResult;
	}

	/**
	 * Generates an object containing the existing time zone names of a locale and adds missing ones.
	 *
	 * @param {Object<string, object>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 */
	generateTimeZoneNames(oTimezoneNames) {
		// For the arabic locale all time zones (except Etc/UTC) have an exemplar city and they are collected in
		// this._aCompleteCLDRTimezoneIDs. Use this list to generate the time zone name from the key (e.g. Dublin)
		// if there is no "exemplarCity" for some time zones in some locales
		// (e.g. {Europe : {Dublin : {IST: "Irish Standard Time"}}}).
		this._aCompleteCLDRTimezoneIDs.forEach((sTimezoneID) => {
			const aTzIDParts = sTimezoneID.split("/");
			let oIANATimezones = oTimezoneNames;
			aTzIDParts.forEach((sPart, i) => {
				const bLastPart = i === aTzIDParts.length - 1;
				if (!oIANATimezones[sPart] && !bLastPart) {
					oIANATimezones[sPart] = {};
				} else if (bLastPart && typeof oIANATimezones[sPart] !== "string") {
					oIANATimezones[sPart] = sPart.replaceAll("_", " ");
				}
				oIANATimezones = oIANATimezones[sPart];
			});
		});
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
	 * Moves a CLDR time zone translation to its ABAP timezone ID in the given object.
	 *
	 * @param {Object<string, object>} oTimezoneNames
	 *   The <code>timezoneNames</code> reference object of the locale containing the time zone IDs in a JSON structure
	 */
	moveCLDRTranslationToABAPTimezoneID(oTimezoneNames) {
		const mCLDR2ABAP = this.getCLDR2ABAPTimezoneMapping();
		Object.keys(mCLDR2ABAP).forEach((sCLDRTimezoneID) => {

			// CLDR element in oTimezoneNames and key
			const aCLDRTimezones = sCLDRTimezoneID.split("/");
			const sLastKeyCLDR = aCLDRTimezones.pop();
			const oCurrentElementCLDR = aCLDRTimezones.reduce((oPrevious, sKey) => {
				return oPrevious[sKey];
			}, oTimezoneNames);

			// ABAP element in oTimezoneNames and key
			const aABAPTimezones = mCLDR2ABAP[sCLDRTimezoneID].split("/");
			const sLastKeyABAP = aABAPTimezones.pop();
			const oCurrentElementABAP = aABAPTimezones.reduce((oPrevious, sKey) => {
				return oPrevious[sKey];
			}, oTimezoneNames);

			// Do not overwrite existing translations e.g:
			// CLDR provides a translation for Pacific/Enderbury, but the mapping of BCP47 defines Pacific/Kanton
			// as the preferred IANA time zone ID.
			// Pacific/Kanton does have a translation itself in CLDR data thus, it must not be overwritten.
			if (!oCurrentElementABAP[sLastKeyABAP]) {
				oCurrentElementABAP[sLastKeyABAP] = oCurrentElementCLDR[sLastKeyCLDR];
			}
			delete oCurrentElementCLDR[sLastKeyCLDR];
		});
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
	 * Create a new object from the given object, by cloning the object's properties in alphabetical order.
	 *
	 * @param {Object<string, any>} oObject The object to be cloned
	 * @returns {Object<string, any>}
	 *   The cloned object; <code>Objects.keys</code> returns the property names in alphabetical order
	 */
	static sort(oObject) {
		const oNewObject = {};
		const aKeys = Object.keys(oObject);
		aKeys.sort();
		aKeys.forEach((sKey) => {
			if (oObject[sKey] && typeof oObject[sKey] === "object") {
				oNewObject[sKey] = Timezones.sort(oObject[sKey]);
			} else {
				oNewObject[sKey] = oObject[sKey];
			}
		});
		return oNewObject;
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
	 * Updates the time zone specific data in the given <code>oResult</code> object for the currently processed locale.
	 *
	 * @param {string} sCLDRTag
	 *   The language tag as defined by the IETF BCP 47, e.g. "en", "de-CH" or "sr-Latn"
	 * @param {Object<string, any>} oResult
	 *   The resulting CLDR object for the current locale
	 */
	updateLocaleTimezones(sCLDRTag, oResult) {
		const oTimezoneNames = oResult["timezoneNames"];
		if (this._aCompleteCLDRTimezoneIDs.length === 0) {
			// As of CLDR version 44, this array is filled with the TZ IDs of the 'ar' locale
			// since, this is a reliable source to enumerate all CLDR TZ IDs as,
			// timezone key and language dependent text for 'ar' are guaranteed to be different
			this._aCompleteCLDRTimezoneIDs = Timezones.getTimezoneIDs(oTimezoneNames);
		} else {
			this.generateTimeZoneNames(oTimezoneNames);
		}

		this.moveCLDRTranslationToABAPTimezoneID(oTimezoneNames);
		this.cleanupTimezoneNames(oResult);
		oResult["timezoneNames"] = Timezones.sort(oTimezoneNames);
		this.checkTimezonesConsistency(sCLDRTag, oResult["timezoneNames"]);
		// adjust Timezone appendItems for zh-Hans to avoid conflicts in parsing:
		// <code>"Timezone": "{1}{0}",</code> has no spaces
		// Without spaces "GMT+11995" cannot be distinguished, because there is GMT+1 and GMT+11.
		// unfortunately gmtFormat is calendar specific, therefore it cannot be adjusted more specifically
		if (sCLDRTag.startsWith("zh-Hans-")) {
			oResult["ca-gregorian"].dateTimeFormats.appendItems.Timezone = "{1} {0}";
		}
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
