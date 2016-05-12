/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * ImageContent renderer.
	 * @namespace
	 */
	var ImageContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.ImageContent} oControl the control to be rendered
	 */
	ImageContentRenderer.render = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMImageContent");
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		if (oControl.hasListeners("press")) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.writeClasses();
		oRm.write(">");

		var oContent = oControl.getAggregation("_content");
		if (oContent) {
			oContent.addStyleClass("sapMImageContentImageIcon");
			oRm.renderControl(oContent);
		}
		oRm.write("</div>");
	};

	return ImageContentRenderer;
}, /* bExport= */true);