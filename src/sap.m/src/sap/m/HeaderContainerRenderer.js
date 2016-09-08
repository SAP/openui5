 /*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function() {
	"use strict";

	/**
	 * HeaderContainer Renderer.
	 * @namespace
	 */
	var HeaderContainerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	HeaderContainerRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip && (typeof sTooltip === "string")) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapMHdrCntr");
		oRm.addClass(oControl.getOrientation());
		if (oControl.getShowDividers()) {
			oRm.addClass("sapMHrdrCntrDvdrs");
		}
		oRm.writeClasses();
		if (oControl.getHeight()) {
			oRm.addStyle("height", oControl.getHeight());
		}
		oRm.addStyle("width", oControl.getWidth());
		oRm.writeStyles();
		var sDesc = "";
		var aContent = oControl.getContent();
		for (var i = 0; aContent && i < aContent.length; i++) {
			sDesc += aContent[i].getId() + " ";
		}
		oRm.writeAttribute("aria-labelledby", sDesc);
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-scroll-area");
		oRm.addClass("sapMHdrCntrCntr");
		oRm.addClass(oControl.getOrientation());
		oRm.addClass("sapMHdrCntrBG" + oControl.getBackgroundDesign());
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("_scrollContainer"));
		oRm.write("</div>");

		var oButton = oControl.getAggregation("_prevButton");
		if (oButton) {
			oRm.write("<div");
			oRm.addClass("sapMHdrCntrBtnCntr");
			oRm.addClass("sapMHdrCntrLeft");
			oRm.addClass(oControl.getOrientation());
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oButton);
			oRm.write("</div>");
		}

		oButton = oControl.getAggregation("_nextButton");
		if (oButton) {
			oRm.write("<div");
			oRm.addClass("sapMHdrCntrBtnCntr");
			oRm.addClass("sapMHdrCntrRight");
			oRm.addClass(oControl.getOrientation());
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oButton);
			oRm.write("</div>");
		}

		// A sentry of HeaderContainer to catch the focus and put the focus at the right element in HeaderContainer
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-after");
		oRm.writeAttribute("tabindex", "0");
		oRm.write("/>");
		oRm.write("</div>");
	};

	return HeaderContainerRenderer;

}, /* bExport= */ true);
