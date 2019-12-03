/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * ScrollContainer renderer.
	 * @namespace
	 */
	var ScrollContainerRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ScrollContainerRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl)
			.style("width", oControl.getWidth())
			.style("height", oControl.getHeight());

		if (oControl.getVertical()) {
			if (!oControl.getHorizontal()) {
				oRm.class("sapMScrollContV");
			} else {
				oRm.class("sapMScrollContVH");
			}
		} else {
			oRm.class("sapMScrollContH");
		}

		oRm.class("sapMScrollCont");

		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (oControl.getFocusable()) {
			oRm.attr("tabindex","0");
		}
		oRm.openEnd();

		oRm.openStart("div", oControl.getId() + "-scroll")
			.class("sapMScrollContScroll")
			.openEnd();
		// render child controls
		var aContent = oControl.getContent(),
		l = aContent.length;
		for (var i = 0; i < l; i++) {
			oRm.renderControl(aContent[i]);
		}

		oRm.close("div");
		oRm.close("div");
	};


	return ScrollContainerRenderer;

}, /* bExport= */ true);
