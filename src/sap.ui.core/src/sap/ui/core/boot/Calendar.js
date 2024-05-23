/*!
 * ${copyright}
 */

/**
 * Load configured calendar
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/i18n/Localization",
	"sap/base/util/LoaderExtensions"
], (
	config,
	Localization,
	LoaderExtensions
) => {
	"use strict";

	let aCalendarTypes = config.get({
		name: "sapUiSupportedCalendarTypes",
		type: config.Type.StringArray,
		defaultValue: [
			"Gregorian",
			"Buddhist",
			"Islamic",
			"Japanese",
			"Persian"
		]
	});
	// load calendar
	const pCalendarpBoot = new Promise((resolve, reject) => {
		aCalendarTypes = aCalendarTypes.map((sType) => {
			return `sap/ui/core/date/${sType}`;
		});
		sap.ui.require(aCalendarTypes, () => {
			resolve();
		}, reject);
	});

	return {
		run: () => {
			// load cldr
			const pLocaleData = new Promise((resolve, reject) => {
				const sLanguage = Localization.getLanguageTag().language;
				LoaderExtensions.loadResource("sap/ui/core/cldr/" + sLanguage + ".json", {
					async: true,
					dataType: "text"
				}).then((sCldr) => {
					const mPreload = {};
					mPreload["sap/ui/core/cldr/" + sLanguage + ".json"] = sCldr;
					sap.ui.require.preload(mPreload);
					resolve();
				}).catch((err) => {
					reject(err);
				});
			});
			return Promise.all([pCalendarpBoot, pLocaleData]);
		}
	};
});