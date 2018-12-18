/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * NewsContent renderer.
	 * @namespace
	 */
	var NewsContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	NewsContentRenderer.render = function(oRm, oControl) {
		var sSubheader = oControl.getSubheader();
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", sTooltip);

		oRm.addClass("sapMNwC");
		if (oControl.hasListeners("press")) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapMNwCCTxt");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oContentText);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-subheader");
		oRm.addClass("sapMNwCSbh");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sSubheader);
		oRm.write("</div>");
		oRm.write("</div>");
	};

	return NewsContentRenderer;
}, /* bExport= */true);
