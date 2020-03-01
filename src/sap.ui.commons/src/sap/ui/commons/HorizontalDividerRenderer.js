/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.HorizontalDivider
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * HorizontalDivider renderer.
	 * @namespace
	 */
	var HorizontalDividerRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	HorizontalDividerRenderer.render = function(rm, oControl){
		rm.write("<hr");
		rm.writeControlData(oControl);
		rm.writeAttribute("role", "separator"); //ARIA
		if (oControl.getWidth()) {
			rm.writeAttribute("style", "width:" + oControl.getWidth() + ";");
		}
		rm.addClass("sapUiCommonsHoriDiv");
		rm.addClass(oControl.getType() == "Page" ? "sapUiCommonsHoriDivTypePage" : "sapUiCommonsHoriDivTypeArea");
		switch (oControl.getHeight()) {
			case "Ruleheight":
				rm.addClass("sapUiCommonsHoriDivHeightR");
				break;
			case "Small":
				rm.addClass("sapUiCommonsHoriDivHeightS");
				break;
			case "Large":
				rm.addClass("sapUiCommonsHoriDivHeightL");
				break;
			default:
				rm.addClass("sapUiCommonsHoriDivHeightM");
		}
		rm.writeClasses();
		rm.write(">");
	};


	return HorizontalDividerRenderer;

}, /* bExport= */ true);
