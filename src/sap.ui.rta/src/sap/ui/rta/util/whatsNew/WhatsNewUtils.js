/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures"
], function(
	Settings,
	WhatsNewFeatures
) {
	"use strict";

	function filterDontShowAgainFeatures(aFeatures, aDontShowAgainFeatureIds) {
		return aFeatures.filter((oFeature) => {
			return !aDontShowAgainFeatureIds?.includes(oFeature.featureId);
		});
	}

	function filterApplicableFeatures(aFeatures, oFlexSettings) {
		return aFeatures.filter((oNewFeature) => {
			return typeof oNewFeature.isFeatureApplicable === "function" && oFlexSettings
				? !!oNewFeature.isFeatureApplicable(oFlexSettings)
				: true;
		});
	}

	const WhatsNewUtils = {
		/**
		 * Get the URL for the feature documentation
		 * @param {string} sPath - The path of the feature, including the index
		 * @param {Array} aFeatureCollection - Feature collection
		 * @returns {string} URL for the feature documentation
		 */
		getLearnMoreURL(sPath, aFeatureCollection) {
			const sFeaturePageIndex = sPath.slice(-1);
			const oSettings = Settings.getInstanceOrUndef();
			if (oSettings?.isAtoEnabled() && oSettings?.getSystem()) {
				return aFeatureCollection[sFeaturePageIndex].documentationUrls.s4HanaCloudUrl;
			}
			if (!oSettings?.isAtoEnabled() && oSettings?.getSystem()) {
				return aFeatureCollection[sFeaturePageIndex].documentationUrls.s4HanaOnPremUrl;
			}
			return aFeatureCollection[sFeaturePageIndex].documentationUrls.btpUrl;
		},

		/**
		 * Filters the new features based on the dontShowAgain feature IDs and the Flex settings
		 * @param {string[]} aDontShowAgainFeatureIds - Array of feature IDs that should be excluded
		 * from the What's New dialog
		 * @returns {object[]} Filtered What's New features
		 */
		getFilteredFeatures(aDontShowAgainFeatureIds) {
			const oFlexSettings = Settings.getInstanceOrUndef();
			const aAllFeatures = WhatsNewFeatures.getAllFeatures();
			const aNewFeatures = filterDontShowAgainFeatures(aAllFeatures, aDontShowAgainFeatureIds);
			return filterApplicableFeatures(aNewFeatures, oFlexSettings);
		}
	};

	return WhatsNewUtils;
});