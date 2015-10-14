/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * DynamicContainer renderer.
	 * @namespace
	 */
	var DynamicContainerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	DynamicContainerRenderer.render = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMDC");
		oRm.writeClasses();
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("tabindex", "0");
		oRm.writeAttribute("role", "presentation");
		oRm.write(">");

		var iLength = oControl.getTiles().length;
		for (var i = 0; i < iLength; i++) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-wrapper-" + i);
			oRm.addClass("sapMDCWrapper");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getTiles()[i]);
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	return DynamicContainerRenderer;

}, /* bExport= */ true);
