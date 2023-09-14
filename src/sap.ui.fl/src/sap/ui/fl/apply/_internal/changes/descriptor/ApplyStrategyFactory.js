
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

	function processManifestPart(vManifestPart, oChangeTexts) {
		// Recursively search the manifest for localization bindings and replace them with default texts
		const vNewManifestPart = Array.isArray(vManifestPart)
			? [...vManifestPart]
			: { ...vManifestPart };
		Object.entries(vNewManifestPart).forEach(([sKey, vValue]) => {
			if (typeof vValue === "object" && vValue !== null) {
				vNewManifestPart[sKey] = processManifestPart(vValue, oChangeTexts);
			} else if (typeof vValue === "string") {
				vNewManifestPart[sKey] = vValue.replaceAll(/{{.*?}}/g, (sMatch) => {
					// Extract the key and replace it if there is a value for it
					const sTextKey = sMatch.slice(2, -2);
					const sResolvedValue = oChangeTexts[sTextKey];
					return sResolvedValue || sMatch;
				});
			}
		});
		return vNewManifestPart;
	}

	var RuntimeStrategy = {
		registry() {
			return requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/Registration");
		},
		handleError(oError) {
			Log.error(oError);
		},
		processTexts(oManifest, oChangeTexts) {
			const oValidChangeTexts = {};
			Object.entries(oChangeTexts).forEach(([sTextKey, { value: mChangeTextValue }]) => {
				// Always use the default language (key = "")
				if (mChangeTextValue[""]) {
					oValidChangeTexts[sTextKey] = mChangeTextValue[""];
					return;
				}
				Log.error("Text change has to contain default language");
			});
			return processManifestPart(oManifest, oValidChangeTexts);
		}
	};

	var ApplyStrategyFactory = {
		/**
		 * Strategy to apply descriptor changes during runtime.
		 * @returns {object} Runtime strategy
		 */
		getRuntimeStrategy() {
			return RuntimeStrategy;
		}
	};

	return ApplyStrategyFactory;
});