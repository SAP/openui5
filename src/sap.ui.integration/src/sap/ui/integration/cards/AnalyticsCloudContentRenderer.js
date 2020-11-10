/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * AnalyticsCloudContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var AnalyticsCloudContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.AnalyticsCloudContentRenderer", {
		apiVersion: 2,
		MIN_ANALYTICS_CLOUD_CONTENT_HEIGHT: "14rem"
	});

	/**
	 * @override
	 */
	AnalyticsCloudContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (oConfiguration.minHeight) {
			return oConfiguration.minHeight;
		}

		return AnalyticsCloudContentRenderer.MIN_ANALYTICS_CLOUD_CONTENT_HEIGHT;
	};

	return AnalyticsCloudContentRenderer;
});
