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
	var FeedContentRenderer = {
		apiVersion: 2
	};

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

		oRm.openStart("div", oControl);

		oRm.attr("role", "presentation");
		oRm.attr("aria-label", sTooltip);

		oRm.class("sapMFC");
		if (oControl.hasListeners("press")) {
			oRm.attr("tabindex", "0");
			oRm.class("sapMPointer");
		}
		oRm.openEnd();

		if (sValue) {
			oRm.openStart("div", oControl.getId() + "-value");
			oRm.class("sapMFCValue");
			oRm.class(oControl.getValueColor());
			oRm.openEnd();

			var iChar = oControl.getTruncateValueTo();
			//Control shows only iChar characters. If the last shown character is decimal separator -
			//show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
			if (sValue.length >= iChar && (sValue[iChar - 1] === "." || sValue[iChar - 1] === ",")) {
				oRm.text(sValue.substring(0, iChar - 1));
			} else if (sValue) {
				oRm.text(sValue.substring(0, iChar));
			} else {
				oRm.text("");
			}
			oRm.close("div");
		}

		oRm.openStart("div");
		oRm.class("sapMFCCTxt");
		oRm.openEnd();
		oRm.renderControl(oControl._oContentText);
		oRm.close("div");

		oRm.openStart("div", oControl.getId() + "-subheader");
		oRm.class("sapMFCSbh");
		oRm.openEnd();
		oRm.text(sSubheader);
		oRm.close("div");

		oRm.close("div"); /* sapMFC */
	};

	return FeedContentRenderer;
}, /* bExport= */true);
