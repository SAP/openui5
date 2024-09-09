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
				sap.ui.require(["sap/ui/core/LocaleData"], (LocaleData) => {
					LocaleData.requestInstance(Localization.getLanguageTag()).then(resolve);
				}, reject);
			});
			return Promise.all([pCalendarpBoot, pLocaleData]);
		}
	};
});