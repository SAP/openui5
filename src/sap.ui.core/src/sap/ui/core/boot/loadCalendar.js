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
], function(
	config,
	Localization,
	LoaderExtensions
) {
	"use strict";


	// load calendar
	var pCalendarpBoot = new Promise(function(res, rej) {
		sap.ui.require(["sap/ui/core/date/" + config.get({name:"sapUiCalendarType", type:"string", defaultValue:"Gregorian"})], function(Calendar) {
			res(Calendar);
		}, rej);
	});
	// load cldr
	var pLocaleData = new Promise(function(res, rej) {
		var sLanguage = Localization.getLanguageTag().language;
		LoaderExtensions.loadResource("sap/ui/core/cldr/" + sLanguage + ".json", {
			async: true,
			dataType: "text"
		}).then(function(sCldr) {
			var mPreload = {};
			mPreload["sap/ui/core/cldr/" + sLanguage + ".json"] = sCldr;
			sap.ui.require.preload(mPreload);
			res();
		});
	});

	return {
		run: function() {
			return Promise.all([pCalendarpBoot, pLocaleData]);
		}
	};
});