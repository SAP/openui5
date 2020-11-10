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
		apiVersion: 2
	});

	/**
	 * @override
	 */
	AnalyticsCloudContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		var MIN_ANALYTICS_CLOUD_CONTENT_HEIGHT = "14rem";

		return MIN_ANALYTICS_CLOUD_CONTENT_HEIGHT;
	};

	return AnalyticsCloudContentRenderer;
});
