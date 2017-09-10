/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ToolbarSpacer"],
	function(ToolbarSpacer) {
	"use strict";


	/**
	 * ToolbarSpacer renderer.
	 * @namespace
	 */
	var ToolbarSpacerRenderer = {};

	ToolbarSpacerRenderer.render = function(rm, oControl) {
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapMTBSpacer");

		var sWidth = oControl.getWidth();
		if (sWidth) {
			rm.addStyle("width", sWidth);
		} else {
			rm.addClass(ToolbarSpacer.flexClass);
		}

		rm.writeStyles();
		rm.writeClasses();
		rm.write("></div>");
	};

	return ToolbarSpacerRenderer;

}, /* bExport= */ true);
