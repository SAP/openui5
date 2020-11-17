/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * ComponentContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ComponentContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.ComponentContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	ComponentContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (oConfiguration.minHeight) {
			return oConfiguration.minHeight;
		}

		return BaseContentRenderer.getMinHeight.apply(this, arguments);
	};

	return ComponentContentRenderer;
});