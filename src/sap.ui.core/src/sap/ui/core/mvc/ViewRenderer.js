/*!
 * ${copyright}
 */

// Provides default renderer for View
sap.ui.define(function() {
	"use strict";


	/**
	 * View renderer.
	 * @namespace
	 * @alias sap.ui.core.mvc.ViewRenderer
	 */
	var ViewRenderer = {
	};

	ViewRenderer.addDisplayClass = function(rm, oControl) {
		if (oControl.getDisplayBlock() || (oControl.getWidth() === "100%" && oControl.getHeight() === "100%")) {
			rm.class("sapUiViewDisplayBlock");
		}
	};

	return ViewRenderer;

}, /* bExport= */ true);
