/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
	"use strict";

	/**
	 * DynamicDateRange renderer.
	 * @namespace
	 */
	var DynamicDateRangeRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.DynamicDateRange} oControl an object representation of the control that should be rendered
	 */
	DynamicDateRangeRenderer.render = function(oRm, oControl) {

		oRm.openStart("div", oControl);
		oRm.class("sapMDynamicDateRange");
		oRm.openEnd();

		oRm.renderControl(oControl._oInput);

		oRm.close("div");
	};

	return DynamicDateRangeRenderer;
});
