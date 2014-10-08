/*!
 * ${copyright}
 */

// Provides default renderer for View
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @namespace View renderer.
	 * @name sap.ui.core.mvc.ViewRenderer
	 */
	var ViewRenderer = {
	};
	
	ViewRenderer.addDisplayClass = function(rm, oControl) {
		if (oControl.getDisplayBlock() || (oControl.getWidth() === "100%" && oControl.getHeight() === "100%")) {
			rm.addClass("sapUiViewDisplayBlock");
		}
	};

	return ViewRenderer;

}, /* bExport= */ true);
