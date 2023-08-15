
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/requireAsync",
	"sap/base/Log"
], function(
	requireAsync,
	Log
) {
	"use strict";

	var RuntimeStrategy = {
		registry: function() {
			return requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/Registration");
		},
		handleError: function(oError) {
			Log.error(oError);
		},
		processTexts: function(oManifest, oChangeTexts) {
			// TODO: optimize performance by creating map not using JSON.stringify/parse
			var sManifest = JSON.stringify(oManifest);
			Object.keys(oChangeTexts).forEach(function(sTextKey) {
				if (oChangeTexts[sTextKey].value[""]) {
					 sManifest = sManifest.replace(`{{${sTextKey}}}`, oChangeTexts[sTextKey].value[""]);
				} else {
					Log.error("Text change has to contain default language");
				}
			});
			return JSON.parse(sManifest);
		}
	};

	var ApplyStrategyFactory = {
		/**
		 * Strategy to apply descriptor changes during runtime.
		 * @returns {object} Runtime strategy
		 */
		getRuntimeStrategy: function() {
			return RuntimeStrategy;
		}
	};

	return ApplyStrategyFactory;
});