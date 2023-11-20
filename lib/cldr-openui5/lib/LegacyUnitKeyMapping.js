import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Provides a unit mapping of legacy unit keys to the renamed unit keys.
 */
export default class LegacyUnitKeyMapping {
	// array of CLDR locales
	aLocales;

	// maps CLDR locales to legacy units
	mLocale2LegacyUnits = {};

	// map of changed unit keys: maps legacy unit keys to renamed unit keys
	mChangedUnitKeys;

	/**
	 * Class constructor.
	 *
	 * @param {string[]} aLocales
	 *   An array of all locales to be generated
	 */
	constructor(aLocales) {
		this.aLocales = aLocales;
	}

	/**
	 * Imports the units of the previous CLDR generation.
	 *
	 * @param {string} sCldrExportPath
	 *   The path to the CLDR export directory
	 */
	async importOldUnits(sCldrExportPath) {
		for (const sLocale of this.aLocales) {
			try {
				const sFilePath = join(sCldrExportPath, `${sLocale}.json`);
				const sFileContent = await fs.readFile(sFilePath);
				const oLocaleData = JSON.parse(sFileContent);
				this.mLocale2LegacyUnits[sLocale] = oLocaleData.units.short;
			} catch {
				// locale skipped, file does not exist
			}
		}
	}

	/**
	 * Checks the units of the current locale and compares them with the old units.
	 * If unit keys have been renamed, a map <code>mChangedUnitKeys</code> is filled as key-value "old key to new key".
	 *
	 * @param {object} oData
	 *   The generated CLDR data
	 * @param {object} oData.units
	 *   The generated unit information, stored in <code>short</code>
	 * @param {object} oData.units.short
	 *   The generated unit definitions; mapping unit key to unit translations
	 * @param {string} sLocale
	 *   The locale
	 */
	analyseUnits({units: {"short": oNewUnits}}, sLocale) {
		const oOldUnits = this.mLocale2LegacyUnits[sLocale];
		if (!oOldUnits) {
			return; // undefined if locale did not exist in old version
		}

		const mChangedUnitKeys = this.collectChangedUnitKeys(oOldUnits, oNewUnits);
		for (const sUnitKey in mChangedUnitKeys) {
			const sKeySuggestion = this.findNewUnitKey(oOldUnits[sUnitKey], oNewUnits);
			if (!sKeySuggestion) {
				// if no unit found, try to find one in a different locale
				continue;
			}
			if (mChangedUnitKeys[sUnitKey] === null) {
				// found the first matching unit key
				mChangedUnitKeys[sUnitKey] = {key: sKeySuggestion, locale: sLocale};
			} else if (mChangedUnitKeys[sUnitKey].key !== sKeySuggestion) {
				// if the new suggestion differs from an old suggestion, log an error
				console.error(`ERROR: contradictory unit keys found for ${oOldUnits[sUnitKey]}\n`
					+ `\tfound unit keys: ${mChangedUnitKeys[sUnitKey].key} (${mChangedUnitKeys[sUnitKey].locale})`
					+ ` vs. ${sKeySuggestion} (${sLocale})`);
			}
		}
	}

	/**
	 * Compares the old existing unit keys with the new generated unit keys. Unit keys which are no longer available
	 * in the generated data must have been renamed. The missing unit keys are added as key to
	 * <code>mChangedUnitKeys</code>, the value is set to <code>undefined</code>.
	 *
	 * @param {object} oOldUnits
	 *   The old units of the previous generation
	 * @param {object} oNewUnits
	 *   The new units of the current generation
	 * @returns {object}
	 *   The <code>mChangedUnitKeys</code>
	 */
	collectChangedUnitKeys(oOldUnits, oNewUnits) {
		if (!this.mChangedUnitKeys) {
			this.mChangedUnitKeys = {};
			for (const sUnitKey in oOldUnits) {
				if (!(sUnitKey in oNewUnits)) {
					this.mChangedUnitKeys[sUnitKey] = null;
				}
			}
		}

		return this.mChangedUnitKeys;
	}

	/**
	 * Searches in the <code>oNewUnits</code> for the renamed unit key of the no longer existing <code>oOldUnit</code>.
	 *
	 * @param {object} oOldUnit
	 *   The object of a unit which does no longer exist in the new units
	 * @param {object} oNewUnits
	 *   The new units
	 * @returns {string|undefined}
	 *   The renamed unit key to the <code>oOldUnit</code>; or <code>undefined</code> if no target unit was found
	 */
	findNewUnitKey(oOldUnit, oNewUnits) {
		for (const sUnitKey in oNewUnits) {
			if (oNewUnits[sUnitKey].displayName === oOldUnit.displayName) {
				return sUnitKey;
			}
		}
		return undefined;
	}

	/**
	 * Removes temporary processing information from <code>mChangedUnitKeys</code> and formats it into the expected
	 * output format.
	 *
	 * @returns {string}
	 *   The JSON-formatted legacy unit mapping
	 */
	getFinalUnitMapping() {
		for (const sOldKey in this.mChangedUnitKeys) {
			this.mChangedUnitKeys[sOldKey] &&= this.mChangedUnitKeys[sOldKey].key;
		}

		return JSON.stringify(this.mChangedUnitKeys, null, "\t");
	}

	/**
	 * Finalizes the unit mapping process.
	 * If renamed legacy unit mappings were found, write them as a comment into <code>LocaleData</code>. This mapping
	 * has to be checked and can manually be added to the <code>mLegacyUnit2CurrentUnit</code> in
	 * <code>LocaleData</code>.
	 */
	async writeUnitMappingToLocaleData() {
		if (!this.mChangedUnitKeys || !Object.keys(this.mChangedUnitKeys).length) {
			console.log("INFO: no new legacy unit keys detected");
			return;
		}

		const sLocaleDataPath = join(__dirname, "../../..", "src/sap.ui.core/src/sap/ui/core/LocaleData.js");
		let sFileContent = await fs.readFile(sLocaleDataPath);

		let sNote = "FIXME: New Legacy Unit Keys found\n";
		sNote += "1. Enhance mLegacyUnit2CurrentUnit\n";
		sNote += "2. Update related tests\n";
		sNote += "3. Update demokit mapping: https://ui5.sap.com/#/topic/8e618a8d93cb4f92adc911b96047eb8d\n";
		sNote += this.getFinalUnitMapping() + "\n";
		sNote = sNote.replace(/(.*\n)/g, "// $1");
		sFileContent = sNote + sFileContent;

		await fs.writeFile(sLocaleDataPath, sFileContent);
		console.log("DONE, new legacy unit keys added to LocaleData.js");
	}
}
