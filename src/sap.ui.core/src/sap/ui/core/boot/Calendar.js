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
	"sap/ui/core/LocaleData"
], (
	config,
	Localization,
	LocaleData
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
			const pLocaleData = LocaleData.requestInstance(Localization.getLanguageTag());
			return Promise.all([pCalendarpBoot, pLocaleData]);
		}
	};
});