/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/library'], function(coreLibrary) {
"use strict";

// shortcut for sap.ui.core.Orientation
var Orientation = coreLibrary.Orientation;

/**
 * HeaderContainer Renderer.
 * @namespace
 */
var HeaderContainerRenderer = {
	apiVersion: 2
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.m.HeaderContainer} oControl the control to be rendered
 */
HeaderContainerRenderer.render = function(oRm, oControl) {
	var sTooltip = oControl.getTooltip_AsString();
	var sOrientationClass = oControl.getOrientation();
	var sBackgroundClass = "sapMHdrCntrBG" + oControl.getBackgroundDesign();
	// write the HTML into the render manager
	oRm.openStart("div", oControl);
	if (sTooltip) {
		oRm.attr("title", sTooltip);
	}
	oRm.class("sapMHdrCntr");
	if (oControl.getSnapToRow()) {
		oRm.class("sapMHdrCntrSnapToRow");
	}
	oRm.class(sOrientationClass);
	if (oControl.getShowDividers()) {
		oRm.class("sapMHrdrCntrDvdrs");
	}
	if (oControl.getHeight()) {
		oRm.style("height", oControl.getHeight());
	} else {
		oRm.style("height", (oControl.getOrientation() === Orientation.Horizontal) ? "auto" : "100%");
	}
	if (oControl.getWidth()) {
		oRm.style("width", oControl.getWidth());
	} else {
		oRm.style("width", (oControl.getOrientation() === Orientation.Horizontal) ? "100%" : "auto");
	}
	// oRm.attr("role", "list");
	oRm.openEnd();

	oRm.openStart("div", oControl.getId() + "-scroll-area");
	oRm.class("sapMHdrCntrCntr");
	oRm.class(sOrientationClass);
	oRm.class(sBackgroundClass);
	oRm.openEnd();
	oRm.renderControl(oControl.getAggregation("_scrollContainer"));
	oRm.close("div");

	var oButton = oControl.getAggregation("_prevButton");
	if (oButton) {
		oRm.openStart("div", oControl.getId() + "-prev-button-container");
		oRm.class("sapMHdrCntrBtnCntr");
		oRm.class("sapMHdrCntrLeft");
		oRm.class(sOrientationClass);
		oRm.openEnd();
		oRm.renderControl(oButton);
		oRm.close("div");
	}

	oButton = oControl.getAggregation("_nextButton");
	if (oButton) {
		oRm.openStart("div", oControl.getId() + "-next-button-container");
		oRm.class("sapMHdrCntrBtnCntr");
		oRm.class("sapMHdrCntrRight");
		oRm.class(sOrientationClass);
		oRm.openEnd();
		oRm.renderControl(oButton);
		oRm.close("div");
	}

	// A sentry of HeaderContainer to catch the focus and put the focus at the right element in HeaderContainer
	oRm.openStart("div", oControl.getId() + "-after");
	oRm.attr("tabindex", "0");
	oRm.openEnd().close("div");
	oRm.close("div");
};

return HeaderContainerRenderer;

});
