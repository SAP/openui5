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
	var ImageContentRenderer = {
		apiVersion : 2  // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.ImageContent} oControl the control to be rendered
	 */
	ImageContentRenderer.render = function(oRm, oControl) {
		oRm.openStart("div",oControl);
		oRm.class("sapMImageContent");
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}
		if (oControl.hasListeners("press")) {
			oRm.class("sapMPointer");
			oRm.attr("tabindex", "0");
		}
		oRm.openEnd();

		var oContent = oControl.getAggregation("_content");
		if (oContent) {
			oContent.addStyleClass("sapMImageContentImageIcon");
			oRm.renderControl(oContent);
		}
		oRm.close("div");
	};

	return ImageContentRenderer;
}, /* bExport= */true);