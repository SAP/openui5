/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * FeedContent renderer.
	 * @namespace
	 */
	var FeedContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.FeedContent} oControl the control to be rendered
	 */
	FeedContentRenderer.render = function(oRm, oControl) {
		var sSubheader = oControl.getSubheader();
		var sValue = oControl.getValue();
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);

		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", sTooltip);

		oRm.addClass("sapMFC");
		if (oControl.hasListeners("press")) {
			oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapMPointer");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (sValue) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-value");
			oRm.addClass("sapMFCValue");
			oRm.addClass(oControl.getValueColor());
			oRm.writeClasses();
			oRm.write(">");

			var iChar = oControl.getTruncateValueTo();
			//Control shows only iChar characters. If the last shown character is decimal separator -
			//show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
			if (sValue.length >= iChar && (sValue[iChar - 1] === "." || sValue[iChar - 1] === ",")) {
				oRm.writeEscaped(sValue.substring(0, iChar - 1));
			} else if (sValue) {
				oRm.writeEscaped(sValue.substring(0, iChar));
			} else {
				oRm.writeEscaped("");
			}
			oRm.write("</div>");
		}

		oRm.write("<div");
		oRm.addClass("sapMFCCTxt");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oContentText);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-subheader");
		oRm.addClass("sapMFCSbh");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sSubheader);
		oRm.write("</div>");

		oRm.write("</div>"); /* sapMFC */
	};

	return FeedContentRenderer;
}, /* bExport= */true);
