/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class ColumnsPanel renderer.
	 * @static
	 */
	var P13nColumnsPanelRenderer = {};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be rendered
	 */
	P13nColumnsPanelRenderer.render = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMP13nColumnsPanel");
		oRm.writeClasses();
		oRm.write(">"); // div element
	
		oRm.renderControl(oControl._oToolbar);
		oRm.renderControl(oControl._oScrollContainer);
	
		oRm.write("</div>");
	};
	

	return P13nColumnsPanelRenderer;

}, /* bExport= */ true);
