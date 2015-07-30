/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
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
			rm.addClass(sap.m.ToolbarSpacer.flexClass);
		}
	
		rm.writeStyles();
		rm.writeClasses();
		rm.write("></div>");
	};

	return ToolbarSpacerRenderer;

}, /* bExport= */ true);
