/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
	"use strict";


	/**
	 * @class ToolbarSeparator renderer.
	 * @static
	 */
	var ToolbarSeparatorRenderer = {};
	
	ToolbarSeparatorRenderer.render = function(rm, oControl) {
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapMTBSeparator");
	
		rm.writeClasses();
		rm.write("></div>");
	};

	return ToolbarSeparatorRenderer;

}, /* bExport= */ true);
