/*!
 * ${copyright}
 */

// A renderer for the ScrollBar control
sap.ui.define(['sap/ui/Device', "sap/ui/dom/getScrollbarSize"],
function(Device, getScrollbarSize) {
	"use strict";


	/**
	 * ScrollBar renderer.
	 * @namespace
	 * @alias sap.m.ScrollBarRenderer
	 */
	var ScrollBarRenderer = {};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl Object representation of the control that should be rendered
	 */
	ScrollBarRenderer.render = function(oRm, oControl){

		var bRTL = sap.ui.getCore().getConfiguration().getRTL(),
			sScrollBarTouchClass = "sapMScrollBarTouch",
			sContentSize = oControl.getContentSize(),
		    oBSS = getScrollbarSize(sScrollBarTouchClass),
			sControlId = oControl.getId(),
			// Fix for Fiori Client and Edge in Mobile Mode on Win8 and Win10
			iWidth = (Device.browser.edge && !oBSS.width) ? 15 : oBSS.width;

		// First div
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMScrollBarOuterDiv");
		if (Device.support.touch) {
			oRm.addClass(sScrollBarTouchClass);
		}
		oRm.addStyle("width", iWidth + "px");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		// Middle div - ScrollBar itself.
		oRm.write("<div");
		oRm.writeAttribute("id", sControlId + "-sb");
		oRm.addClass("sapMScrollBarInnerDiv");
		oRm.addStyle("width", (iWidth * 2) + "px");
		oRm.addStyle((bRTL ? "margin-right" : "margin-left"), -Math.abs(iWidth) + "px");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", sControlId + "-sbcnt");
		oRm.addStyle("width", iWidth + "px");
		if (sContentSize) {
			oRm.addStyle("height", sContentSize);
		}
		oRm.writeStyles();
		oRm.write(">");
		oRm.write("</div>");
		oRm.write("</div>");

		oRm.write("<div>");
		oRm.write("<span");
		oRm.writeAttribute("id", sControlId + "-ffsize");
		oRm.addClass("sapMScrollBarDistantSpan");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</span>");
		oRm.write("</div>");

		oRm.write("</div>");

	};

	return ScrollBarRenderer;

}, /* bExport= */ true);