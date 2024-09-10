/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings"
], function(
	Settings
) {
	"use strict";

	const WhatsNewUtils = {
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
		}
	};

	return WhatsNewUtils;
});