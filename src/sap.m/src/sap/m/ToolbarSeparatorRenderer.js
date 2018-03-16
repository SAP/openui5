/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * ToolbarSeparator renderer.
	 * @namespace
	 */
	var ToolbarSeparatorRenderer = {};

	ToolbarSeparatorRenderer.render = function(rm, oControl) {
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapMTBSeparator");

		//ARIA
		rm.writeAccessibilityState(oControl, {
			role: "separator"
		});

		rm.writeClasses();
		rm.write("></div>");
	};

	return ToolbarSeparatorRenderer;

}, /* bExport= */ true);
