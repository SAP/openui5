/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * ToolbarSpacer renderer.
	 * @namespace
	 */
	var ToolbarSpacerRenderer = {
		apiVersion: 2
	};

	/**
	 * Flexible Spacer Class Name
	 * @protected
	 */
	ToolbarSpacerRenderer.flexClass = "sapMTBSpacerFlex";

	ToolbarSpacerRenderer.render = function(rm, oControl) {
		rm.openStart("div", oControl);
		rm.class("sapMTBSpacer");

		var sWidth = oControl.getWidth();
		if (sWidth) {
			rm.style("width", sWidth);
		} else {
			rm.class(ToolbarSpacerRenderer.flexClass);
		}

		rm.openEnd().close("div");
	};

	return ToolbarSpacerRenderer;

}, /* bExport= */ true);
