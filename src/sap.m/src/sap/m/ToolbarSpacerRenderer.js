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
	var ToolbarSpacerRenderer = {};

	/**
	 * Flexible Spacer Class Name
	 * @protected
	 */
	ToolbarSpacerRenderer.flexClass = "sapMTBSpacerFlex";

	ToolbarSpacerRenderer.render = function(rm, oControl) {
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapMTBSpacer");

		var sWidth = oControl.getWidth();
		if (sWidth) {
			rm.addStyle("width", sWidth);
		} else {
			rm.addClass(ToolbarSpacerRenderer.flexClass);
		}

		rm.writeStyles();
		rm.writeClasses();
		rm.write("></div>");
	};

	return ToolbarSpacerRenderer;

}, /* bExport= */ true);
