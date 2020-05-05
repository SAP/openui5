
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyUtil",
	"sap/base/Log"
], function (
	requireAsync,
	ApplyUtil,
	Log
) {
	"use strict";

	var BuildStrategy = {
		registry: function() {
			return requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/RegistrationBuild");
		},
		handleError: function (oError) {
			throw oError;
		},
		processTexts: function (oManifest, oChangeTexts) {
			if (typeof oManifest["sap.app"].i18n === "string") {
				oManifest["sap.app"].i18n = { bundleUrl: oManifest["sap.app"].i18n };
			}
			if (!oManifest["sap.app"].i18n.enhanceWith) {
				oManifest["sap.app"].i18n.enhanceWith = [];
			}
			var sBundleName = ApplyUtil.formatBundleName(oManifest["sap.app"].id, oChangeTexts.i18n);

			var bDoubles = oManifest["sap.app"].i18n.enhanceWith.some(function(mEntry) {
				return mEntry.bundleName === sBundleName;
			});
			if (!bDoubles) {
				oManifest["sap.app"].i18n.enhanceWith.push({ bundleName: sBundleName });
			}
			return oManifest;
		}
	};

	var RuntimeStrategy = {
		registry: function() {
			return requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/Registration");
		},
		handleError: function (oError) {
			Log.error(oError);
		},
		processTexts: function (oManifest, oChangeTexts) {
			//TODO: optimize performance by creating map not using JSON.stringify/parse
			var sManifest = JSON.stringify(oManifest);
			Object.keys(oChangeTexts).forEach(function(sTextKey) {
				if (oChangeTexts[sTextKey].value[""]) {
					 sManifest = sManifest.replace("{{" + sTextKey + "}}", oChangeTexts[sTextKey].value[""]);
				} else {
					Log.error("Text change has to contain default language");
				}
			});
			return JSON.parse(sManifest);
		}
	};


	var ApplyStrategyFactory = {
		/**
		 * Strategy to apply descriptor changes during build.
		 * @returns {Promise<object>} Build strategy
		 */
		getBuildStrategy: function() {
			return Promise.resolve(BuildStrategy);
		},

		/**
		 * Strategy to apply descriptor changes during runtime.
		 * @returns {Promise<object>} Runtime strategy
		 */
		getRuntimeStrategy: function() {
			return Promise.resolve(RuntimeStrategy);
		}
	};

	return ApplyStrategyFactory;
}, true);