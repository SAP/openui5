/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * ActionsToolbar renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var ActionsToolbarRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.integration.controls.ActionsToolbar} oActionsToolbar An object representation of the control that should be rendered.
	 */
	ActionsToolbarRenderer.render = function(oRm, oActionsToolbar) {
		oRm.openStart("div", oActionsToolbar)
			.class("sapUiIntActionsToolbar")
			.openEnd();

		oRm.renderControl(oActionsToolbar._getToolbar());

		oRm.close("div");
	};

	return ActionsToolbarRenderer;

}, /* bExport= */ true);