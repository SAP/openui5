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
	var ScrollBarRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl Object representation of the control that should be rendered
	 */
	ScrollBarRenderer.render = function(oRm, oControl){

		var sScrollBarTouchClass = "sapMScrollBarTouch",
			sContentSize = oControl.getContentSize(),
			sControlId = oControl.getId(),
			bDeviceSupportsTouch = Device.support.touch;

		// First div
		oRm.openStart("div", oControl);
		oRm.class("sapMScrollBarOuterDiv");
		if (bDeviceSupportsTouch) {
			oRm.class(sScrollBarTouchClass);
		}
		oRm.openEnd();

			// Middle div - ScrollBar itself.
			oRm.openStart("div", sControlId + "-sb");
			oRm.class("sapMScrollBarInnerDiv");
			oRm.openEnd();

				oRm.openStart("div", sControlId + "-sbcnt");
				oRm.style("width", "0.75rem");
				oRm.style("height", sContentSize);
				oRm.openEnd();

				oRm.close("div");

			oRm.close("div");

			oRm.openStart("div");
			oRm.openEnd();

				oRm.openStart("span", sControlId + "-ffsize");
				oRm.class("sapMScrollBarDistantSpan");
				oRm.openEnd();

				oRm.close("span");

			oRm.close("div");

		oRm.close("div");

	};

	return ScrollBarRenderer;

}, /* bExport= */ true);