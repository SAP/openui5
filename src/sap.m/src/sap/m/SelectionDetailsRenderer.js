/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
	"use strict";

	/**
	 * SelectionDetails renderer.
	 * @namespace
	 */
	var SelectionDetailsRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.SelectionDetails} oControl The control to be rendered
	 * @public
	 */
	SelectionDetailsRenderer.render = function(oRm, oControl) {
		var oButton = oControl.getAggregation("_button");
		oRm.openStart("div", oControl);
		oRm.openEnd();

		oRm.renderControl(oButton);

		oRm.close("div");
	};

	return SelectionDetailsRenderer;

}, /* bExport= */ true);
