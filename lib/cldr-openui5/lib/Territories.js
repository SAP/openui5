import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Handles CLDR territories.
 */
export default class Territories {
	// territories to be cached
	mTerritoriesCache = {};

	// custom territory overrides by SAP Globalization
	mCustomTerritories = {
		ar: {
			TW: "تايوان",
			HK: "هونج كونج",
			MO: "ماكاو"
		},
		"ar_EG": {
			TW: "تايوان",
			HK: "هونج كونج",
			MO: "ماكاو"
		},
		"ar_SA": {
			TW: "تايوان",
			HK: "هونج كونج",
			MO: "ماكاو"
		},
		hi: {
			TW: "ताईवान",
			HK: "हांग कांग",
			MO: "मकाओ"
		},
		kk: {
			TW: "Тайвань",
			HK: "Гонконг",
			MO: "Макао"
		}
	};

	/**
	 * Caches relevant territories.
	 *
	 * @param {Object<string,string>} mTerritories
	 *   The territories map
	 * @param {string} sLocale
	 *   The locale
	 */
	cacheLocaleTerritories(mTerritories, sLocale) {
		this.mTerritoriesCache[sLocale] = {
			TW: mTerritories.TW,
			HK: mTerritories.HK,
			MO: mTerritories.MO
		};
	}

	/**
	 * Overwrites the locale territories with improved translations.
	 *
	 * @param {object} oData
	 *   The generated CLDR data
	 * @param {Object<string,string>} oData.territories
	 *   The territories map
	 * @param {string} sLocale
	 *   The locale
	 */
	updateLocaleTerritories({territories: mTerritories}, sLocale) {
		// use preferred translations
		mTerritories.HK = mTerritories["HK-alt-short"];
		mTerritories.MO = mTerritories["MO-alt-short"];

		// apply custom territories
		Object.assign(mTerritories, this.mCustomTerritories[sLocale]);

		// cache relevant territories
		this.cacheLocaleTerritories(mTerritories, sLocale);
	}

	/**
	 * Updates the territories cache in openui5/lib/cldr-openui5/lib/resources/territories.json
	 */
	async writeTerritoriesCache() {
		const sPath = join(__dirname, "resources/territories.json");

		await fs.writeFile(sPath, JSON.stringify(this.mTerritoriesCache, null, "\t"));
		console.log(`DONE, territories updated: ${sPath}`);
	}
}
