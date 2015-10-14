/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * JamContent renderer.
	 * @namespace
	 */
	var JamContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.JamContent} oControl the control to be rendered
	 */

	JamContentRenderer.render = function(oRm, oControl){
		var sSize = oControl.getSize();
		var sSubheader = oControl.getSubheader();
		var sValue = oControl.getValue();
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);

		oRm.writeAttributeEscaped("title", sTooltip);
		oRm.writeAttribute("id", oControl.getId() + "-jam-content");
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", oControl.getAltText().replace(/\s/g, " ") + (sap.ui.Device.browser.firefox ? "" : " " + sTooltip ));

		oRm.addClass(sSize);
		oRm.addClass("sapMJC");
		if (oControl.hasListeners("press")) {
			oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapMPointer");
		}
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-value");
		oRm.addClass("sapMJCValue");
		oRm.addClass(sSize);
		oRm.addClass(oControl.getValueColor());
		oRm.writeClasses();
		oRm.write(">");
		var iChar = oControl.getTruncateValueTo();
		//Control shows only iChar characters. If the last shown character is decimal separator -
		//show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
		if (sValue.length >= iChar && (sValue[iChar - 1] === "." || sValue[iChar - 1] === ",")) {
			oRm.writeEscaped(sValue.substring(0, iChar - 1));
		} else {
			oRm.writeEscaped(sValue ? sValue.substring(0, iChar) : "");
		}
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMJCCTxt");
		oRm.addClass(sSize);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oCText);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-subheader");
		oRm.addClass("sapMJCSbh");
		oRm.addClass(sSize);
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sSubheader);
		oRm.write("</div>");
		oRm.write("</div>");
	};

	return JamContentRenderer;

}, /* bExport= */true);
