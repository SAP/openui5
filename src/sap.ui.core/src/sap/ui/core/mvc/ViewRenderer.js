/*!
 * ${copyright}
 */

// Provides default renderer for View
sap.ui.define(function() {
	"use strict";


	/**
	 * View renderer.
	 * @namespace
	 * @alias sap.ui.core.mvc.ViewRenderer
	 */
	var ViewRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.mvc.View} oControl an object representation of the control that should be rendered
	 */
	ViewRenderer.render = function(rm, oControl) {
		rm.openStart("div", oControl);
		rm.class("sapUiView");
		ViewRenderer.addDisplayClass(rm, oControl);
		rm.style("width", oControl.getWidth());
		rm.style("height", oControl.getHeight());
		rm.openEnd();

		oControl.getContent().forEach(rm.renderControl, rm);

		rm.close("div");
	};

	ViewRenderer.addDisplayClass = function(rm, oControl) {
		if (oControl.getDisplayBlock() || (oControl.getWidth() === "100%" && oControl.getHeight() === "100%")) {
			rm.class("sapUiViewDisplayBlock");
		}
	};

	return ViewRenderer;

}, /* bExport= */ true);
