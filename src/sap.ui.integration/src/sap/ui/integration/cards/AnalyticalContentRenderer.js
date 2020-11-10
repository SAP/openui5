/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * AnalyticalContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var AnalyticalContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.AnalyticalContentRenderer", {
		apiVersion: 2,
		MIN_ANALYTICAL_CONTENT_HEIGHT: "14rem"
	});

	/**
	 * @override
	 */
	AnalyticalContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (oConfiguration.minHeight) {
			return oConfiguration.minHeight;
		}

		return AnalyticalContentRenderer.MIN_ANALYTICAL_CONTENT_HEIGHT;
	};

	return AnalyticalContentRenderer;
});
