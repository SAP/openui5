/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.Exact
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Exact renderer.
	 * @namespace
	 */
	var ExactRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ExactRenderer.render = function(oRenderManager, oControl){
		var rm = oRenderManager;
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapUiUx3Exact");
		rm.writeClasses();
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.write(">");
		rm.renderControl(oControl._searchArea);
		if (oControl._bDetailsVisible) {
			rm.renderControl(oControl._browser);
			rm.renderControl(oControl._resultText);
			rm.renderControl(oControl._resultArea);
		}
		rm.write("</div>");
	};

	return ExactRenderer;

}, /* bExport= */ true);
