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
		apiVersion: 2
	});

	/**
	 * @override
	 */
	AnalyticalContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		var MIN_ANALYTICAL_CONTENT_HEIGHT = "14rem";

		return MIN_ANALYTICAL_CONTENT_HEIGHT;
	};

	return AnalyticalContentRenderer;
});
